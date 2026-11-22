"""Compare the released pictures from both video codecs, the image player and the standalone film."""
import argparse
import hashlib
import json
import statistics
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageStat


FPS = 8
SAMPLE = (112, 63)
CELL = (448, 252)
FRAME_BYTES = SAMPLE[0] * SAMPLE[1] * 3
# A clear action phase and a painted feature known to be fixed, in each composition.
# Each subject is measured independently of the wider water, weather or light.
WORKING_SHOTS = {
    'cast-lead': ((.04, .62), (.34, .15, .55, .81), (.62, .04, .87, .24)),
    'strike-iron': ((.08, .22), (.282, .055, .420, .644), (.12, .76, .55, .95)),
    'drive-fastening': ((.11, .34), (.315, .04, .490, .57), (.22, .71, .79, .94)),
    'swing-lantern': ((.34, .81), (.53, .23, .72, .59), (.12, .035, .37, .13)),
}


def decode(path):
    # Decode the complete cut. Sampling the middle of each eighth of a second
    # matches make_film_compat.py, also for the lower resolution WebM.
    width, height = SAMPLE
    # The joined AAC track moves the standalone container's video start by 21 ms.
    # Anchor sampling to its first video frame in exactly the same way as each reel.
    command = ['ffmpeg', '-v', 'error', '-nostdin', '-threads', '1', '-i', str(path),
               '-map', '0:v:0', '-an', '-vf', f'setpts=PTS-STARTPTS,fps={FPS},scale={width}:{height}:flags=area',
               '-pix_fmt', 'rgb24', '-threads', '1', '-f', 'rawvideo', '-']
    payload = subprocess.check_output(command)
    if len(payload) % FRAME_BYTES:
        raise ValueError(f'Truncated picture in {path.name}')
    return [Image.frombytes('RGB', SAMPLE, payload[at:at + FRAME_BYTES])
            for at in range(0, len(payload), FRAME_BYTES)]


def image_player_frames(directory, key, count):
    for first in range(0, count, 16):
        path = directory / f'{key}-{first // 16 + 1:02d}.webp'
        frames = min(16, count - first)
        with Image.open(path, formats=['WEBP']) as sheet:
            if sheet.size != (4 * CELL[0], ((frames + 3) // 4) * CELL[1]):
                raise ValueError(f'Frame sheet has wrong dimensions: {path.name}')
            for cell in range(frames):
                x, y = (cell % 4) * CELL[0], (cell // 4) * CELL[1]
                tile = sheet.crop((x, y, x + CELL[0], y + CELL[1]))
                yield tile.convert('RGB').resize(SAMPLE, Image.Resampling.BOX)


def compare(reference, candidate, label):
    errors = [statistics.mean(ImageStat.Stat(ImageChops.difference(a, b)).mean)
              for a, b in zip(reference, candidate, strict=True)]
    # A resample and two lossy video codecs introduce small colour differences.
    # Changing the cut should never pass solely because most frames still match.
    average = statistics.mean(errors)
    peak = max(errors)
    if average > 4.0 or peak > 12.0:
        index = errors.index(peak)
        raise ValueError(f'{label} differs at {index / FPS:.3f}s (mean {average:.2f}, largest {peak:.2f})')
    return {'mean_error_of_255': round(average, 3), 'maximum_frame_error_of_255': round(peak, 3)}


def region_mean(image, bounds):
    box = tuple(round(fraction * SAMPLE[index % 2]) for index, fraction in enumerate(bounds))
    return statistics.mean(ImageStat.Stat(image.crop(box)).mean)


def working_motion(reel, edit, pictures):
    results = {}
    passage_at = 0
    for passage in reel['shots']:
        cameras = edit[passage['plate']]
        for index, (start, key) in enumerate(cameras):
            if key not in WORKING_SHOTS:
                continue
            end = cameras[index + 1][0] if index + 1 < len(cameras) else passage['seconds']
            phases, subject, background = WORKING_SHOTS[key]
            times = [passage_at + start + (end - start) * phase for phase in phases]
            a, b = (int(t * FPS) for t in times)
            measurements = {}
            for format_name, frames in pictures.items():
                difference = ImageChops.difference(frames[a], frames[b])
                movement = region_mean(difference, subject)
                drift = region_mean(difference, background)
                if movement < 3.0 or movement < 2.5 * drift or drift > 4.0:
                    raise ValueError(f'{key} in {format_name}: subject moved {movement:.2f}, fixed paint {drift:.2f}')
                measurements[format_name] = {'subject_difference': round(movement, 3), 'fixed_paint_difference': round(drift, 3)}
            results[key] = {'reel_seconds': [round(t, 3) for t in times], 'measurements': measurements}
        passage_at += passage['seconds']
    return results


def verify(game, standalone):
    game = game.resolve()
    release = {}
    if (game / 'release.json').exists():
        manifest = json.loads((game / 'release.json').read_text())
        release = {'edition': manifest['release'], 'build': manifest['build'][:20]}
        game = game / manifest['directory']
    timeline = json.loads(subprocess.check_output([
        'node', '-p', 'JSON.stringify(require(process.argv[1]).timeline)', str(game / 'story-film-script.js')]))
    movie = decode(standalone)
    at = 0
    reels = []
    actions = {}
    edit = None
    if int(release.get('edition', '0')) >= 20:
        sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools'))
        from story_film_cut import PICTURE_EDIT
        from make_film_compat import picture_starts
        actual = json.loads(subprocess.check_output([
            'node', '-p', 'require(process.argv[1]);JSON.stringify(globalThis.CastawayFilmCuts)',
            str(game / 'story-film-edit.js')]))
        if actual != picture_starts(timeline):
            raise ValueError('The reduced-motion edit timings differ from the complete cut')
        edit = PICTURE_EDIT
    for reel in timeline:
        key = reel['id']
        frames = round(FPS * sum(shot['seconds'] for shot in reel['shots']))
        clips = game / 'assets/story-film'
        main = decode(clips / f'{key}.mp4')
        if len(main) != frames:
            raise ValueError(f'{key} has {len(main)} eighth-second pictures, expected {frames}')
        alternate = decode(clips / f'{key}.webm')
        cells = list(image_player_frames(game / 'assets/story-film-compat', key, frames))
        webm = compare(main, alternate, f'{key}.webm')
        sheet = compare(main, cells, f'{key} image player')
        if edit is not None:
            actions.update(working_motion(reel, edit, {'mp4': main, 'webm': alternate, 'image_player': cells}))
        for index, (a, b) in enumerate(zip(main, movie[at:at + frames], strict=True)):
            if a.tobytes() != b.tobytes():
                raise ValueError(f'The standalone changed the copied picture in {key} at {index / FPS:.3f}s')
        reels.append({'id': key, 'frames_compared': frames, 'webm': webm, 'image_player': sheet,
                      'standalone_matches': True})
        at += frames
    if len(movie) != at:
        raise ValueError(f'The standalone has {len(movie)} pictures, expected {at}')
    if edit is not None and set(actions) != set(WORKING_SHOTS):
        raise ValueError(f'Missing motion samples: {set(WORKING_SHOTS) - set(actions)}')
    with standalone.open('rb') as stream:
        digest = hashlib.file_digest(stream, 'sha256').hexdigest()
    return {**release, 'standalone_sha256': digest, 'sample': list(SAMPLE),
            'samples_per_second': FPS, 'compared_frames': at, 'reels': reels, 'working_shots': actions}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('game', type=Path)
    parser.add_argument('standalone', type=Path)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    result = json.dumps(verify(args.game, args.standalone), indent=2) + '\n'
    if args.report:
        args.report.write_text(result)
    print(result, end='')
