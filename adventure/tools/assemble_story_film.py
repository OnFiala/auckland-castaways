#!/usr/bin/env python3
"""Join the released game reels, captions and chapter titles into one viewable MP4."""
import argparse
import hashlib
import json
import re
import subprocess
import tempfile
from fractions import Fraction
from pathlib import Path


def probe(path):
    output = subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-show_chapters',
        '-of', 'json', str(path),
    ])
    return json.loads(output)


def milliseconds(stamp):
    hours, minutes, seconds = ('00:' + stamp if stamp.count(':') == 1 else stamp).split(':')
    whole, fraction = seconds.split('.')
    return (int(hours) * 3600 + int(minutes) * 60 + int(whole)) * 1000 + int(fraction)


def srt_time(value):
    seconds, ms = divmod(value, 1000)
    minutes, sec = divmod(seconds, 60)
    hour, minute = divmod(minutes, 60)
    return f'{hour:02d}:{minute:02d}:{sec:02d},{ms:03d}'


def subtitles(path, duration):
    text = path.read_text(encoding='utf-8-sig').strip()
    blocks = re.split(r'\n\s*\n', text)
    if not blocks or not blocks[0].startswith('WEBVTT'):
        raise ValueError(f'{path.name} has no WebVTT header')
    end = 0
    for block in blocks[1:]:
        lines = block.splitlines()
        if lines[0].startswith(('NOTE', 'STYLE', 'REGION')):
            continue
        time_line = next((index for index, line in enumerate(lines[:2]) if ' --> ' in line), None)
        if time_line is None:
            raise ValueError(f'{path.name} contains an untimed subtitle')
        start_at, finish_at = lines[time_line].split(' --> ', 1)
        start, finish = milliseconds(start_at), milliseconds(finish_at.split()[0])
        caption = '\n'.join(lines[time_line + 1:]).strip()
        if not caption or not end <= start < finish <= duration:
            raise ValueError(f'{path.name} contains an empty or overlapping caption at {start_at}')
        yield start, finish, caption
        end = finish


def metadata_text(text):
    return re.sub(r'([\\;=#])', r'\\\1', text.replace('\n', ' '))


def file_hash(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def assemble(directory, output):
    directory = directory.resolve()
    manifest = directory / 'release.json'
    if manifest.is_file():
        directory = directory / json.loads(manifest.read_text())['directory']
    script = directory / 'story-film-script.js'
    timeline = json.loads(subprocess.check_output([
        'node', '-p', 'JSON.stringify(require(process.argv[1]).timeline)', str(script),
    ]))
    ids = [reel['id'] for reel in timeline]
    if not ids or len(set(ids)) != len(ids) or any(not re.fullmatch(r'[a-z][a-z0-9-]*', key) for key in ids):
        raise ValueError('The film needs distinct, portable reel names')
    output = output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    assets = directory / 'assets' / 'story-film'
    chapters, caption_lines = [], []
    offset = 0
    stream_signature = None
    with tempfile.TemporaryDirectory(dir=output.parent, prefix='.story-film-') as temporary:
        staging = Path(temporary)
        inputs = ['ffconcat version 1.0']
        metadata = [';FFMETADATA1', 'title=Until We Return', 'artist=Until We Return',
                    'comment=An original narrated film accompanying the painted adventure.']
        for reel in timeline:
            key = reel['id']
            clip = assets / f'{key}.mp4'
            streams = probe(clip)['streams']
            video, audio = (next(s for s in streams if s['codec_type'] == kind) for kind in ('video', 'audio'))
            signature = (video['codec_name'], video['width'], video['height'], video['pix_fmt'],
                         video['avg_frame_rate'], audio['codec_name'], audio['sample_rate'], audio['channels'])
            if stream_signature is None:
                stream_signature = signature
            if signature != stream_signature or signature[0] != 'h264' or audio['codec_name'] != 'aac':
                raise ValueError(f'Incompatible film streams in {clip.name}')
            video_ms = round(int(video['duration_ts']) * Fraction(video['time_base']) * 1000)
            score_ms = round(int(audio['duration_ts']) * Fraction(audio['time_base']) * 1000)
            expected = round(sum(shot['seconds'] for shot in reel['shots']) * 1000)
            if abs(video_ms - expected) > 45 or abs(score_ms - video_ms) > 65:
                raise ValueError(f'{clip.name}: picture {video_ms}, sound {score_ms}, script {expected} ms')
            # Relative, controlled filenames keep the concat list portable across host paths.
            (staging / clip.name).symlink_to(clip)
            inputs.extend([f'file {clip.name}', f'duration {video_ms / 1000:.3f}'])
            cues = list(subtitles(assets / f'{key}.vtt', video_ms))
            if not cues:
                raise ValueError(f'{key} has no English subtitles')
            for start, finish, text in cues:
                caption_lines.append(f'{len(caption_lines)+1}\n{srt_time(offset+start)} --> {srt_time(offset+finish)}\n{text}\n')
            title = reel['title']
            metadata.extend(['[CHAPTER]', 'TIMEBASE=1/1000', f'START={offset}', f'END={offset+video_ms}',
                             'title=' + metadata_text(title)])
            chapters.append({'id': key, 'title': title, 'start_ms': offset, 'duration_ms': video_ms,
                             'captions': len(cues), 'clip_sha256': file_hash(clip)})
            offset += video_ms

        (staging / 'reels.ffconcat').write_text('\n'.join(inputs) + '\n', encoding='utf-8')
        (staging / 'chapters.txt').write_text('\n'.join(metadata) + '\n', encoding='utf-8')
        (staging / 'captions.srt').write_text('\n'.join(caption_lines), encoding='utf-8')
        movie = staging / 'story.mp4'
        subprocess.run([
            'ffmpeg', '-v', 'error', '-nostdin', '-f', 'concat', '-safe', '1', '-i', 'reels.ffconcat',
            '-f', 'srt', '-i', 'captions.srt', '-f', 'ffmetadata', '-i', 'chapters.txt',
            '-map', '0:v:0', '-map', '0:a:0', '-map', '1:s:0', '-map_metadata', '2', '-map_chapters', '2',
            '-c:v', 'copy', '-c:a', 'copy', '-c:s', 'mov_text', '-metadata:s:a:0', 'language=eng',
            '-metadata:s:s:0', 'language=eng', '-disposition:s:0', 'default', '-fflags', '+bitexact',
            '-movflags', '+faststart', movie.name,
        ], cwd=staging, check=True)
        result = probe(movie)
        actual = result.get('chapters', [])
        if len(actual) != len(chapters) or any(
            chapter['tags']['title'] != expected['title']
            or abs(float(chapter['start_time']) * 1000 - expected['start_ms']) > 2
            for chapter, expected in zip(actual, chapters)
        ):
            raise ValueError('Chapter labels or timestamps changed during assembly')
        if not any(s['codec_name'] == 'mov_text' and s.get('tags', {}).get('language') == 'eng'
                   for s in result['streams']):
            raise ValueError('The standalone film lost its English caption track')
        if abs(float(result['format']['duration']) * 1000 - offset) > 85:
            raise ValueError('The assembled film duration differs from the game reels')
        movie.replace(output)
    return {'file': output.name, 'sha256': file_hash(output), 'bytes': output.stat().st_size,
            'duration_ms': offset, 'captions': len(caption_lines), 'chapters': chapters}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('game', type=Path, help='the extracted game, or the source dist directory')
    parser.add_argument('output', type=Path, help='the standalone MP4')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    report = json.dumps(assemble(args.game, args.output), indent=2, ensure_ascii=False) + '\n'
    if args.report:
        args.report.write_text(report, encoding='utf-8')
    print(report, end='')
