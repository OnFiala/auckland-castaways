"""Release isolation, offline paths and preservation of an already opened edition."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import sys
import zipfile
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from build_web import retain_open_editions, write_edition
import build_web
from build_public_site import build as build_public_site
from package_download import package
from verify_web import verify


class EditionLayout(unittest.TestCase):
    def test_hosted_patches_keep_shared_films_and_repin_the_new_music_and_paintings(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / 'source'
            film = source / 'assets/story-film/prologue.mp4'
            painting = source / 'assets/panels/camp.webp'
            music = source / 'assets/island-score/shore.mp3'
            data = source / 'assets/story-film-compat/prologue-audio.js'
            for asset in (film, painting, music, data):
                asset.parent.mkdir(parents=True)
            film.write_bytes(b'old reel')
            data.write_bytes(b'window.samples="assets/samples";')
            painting.write_bytes(b'old camp')
            (source / 'index.html').write_text(
                '<html><head><meta name="game-release" content="18"><link href="sheet.css">'
                '<link href="assets/story-film/prologue.mp4"><script src="game.js"></script></head></html>')
            (source / 'sheet.css').write_text(
                'a{background:url("assets/panels/camp.webp")}b{background:url(assets/story-film/prologue.mp4)}')
            script = source / 'game.js'
            script.write_text("const reel='assets/story-film/'+id+'.mp4';")
            first_game, second_game = root / 'offline-one', root / 'offline-two'
            previous, hosted, duplicate = root / 'public-one', root / 'public-two', root / 'public-again'
            with patch.object(build_web, 'SOURCE', source):
                build_web.build(first_game)
                build_public_site(first_game, previous, 'https://game.example')
                prior = json.loads((previous / 'release.json').read_text())['directory']
                painting.write_bytes(b'repainted camp')
                music.write_bytes(b'ID3\x00\xff\xfb\x00.paint.png')
                script.write_text(script.read_text() + "const score='assets/island-score/'+id+'.mp3';")
                build_web.build(second_game)

            url = 'https://game.example'
            build_public_site(second_game, hosted, url, previous=previous)
            manifest = json.loads((hosted / 'release.json').read_text())
            current = manifest['directory']
            self.assertEqual(manifest['shared'], {
                'assets/story-film/': prior + 'assets/story-film/',
                'assets/story-film-compat/': prior + 'assets/story-film-compat/'})
            self.assertEqual(len(list(hosted.rglob('prologue.mp4'))), 1)
            self.assertIn(prior + 'assets/story-film/prologue.mp4', (hosted / 'index.html').read_text())
            self.assertIn(prior + 'assets/story-film/', (hosted / current / 'game.js').read_text())
            self.assertIn(current + 'assets/island-score/', (hosted / current / 'game.js').read_text())
            self.assertIn('../' + prior.split('/')[1] + '/assets/story-film/prologue.mp4',
                          (hosted / current / 'sheet.css').read_text())
            self.assertEqual((hosted / current / 'assets/island-score/shore.mp3').read_bytes(), music.read_bytes())
            self.assertEqual((hosted / current / 'assets/panels/camp.webp').read_bytes(), b'repainted camp')
            self.assertEqual((hosted / prior / 'assets/panels/camp.webp').read_bytes(), b'old camp')
            self.assertEqual(verify(hosted, previous)['current_files'], len(manifest['files']))
            build_public_site(second_game, duplicate, url, previous=hosted)
            self.assertEqual((hosted / 'release.json').read_bytes(), (duplicate / 'release.json').read_bytes())
            self.assertEqual((hosted / 'index.html').read_bytes(), (duplicate / 'index.html').read_bytes())
            (hosted / prior / 'assets/story-film/prologue.mp4').write_bytes(b'altered retained movie')
            with self.assertRaisesRegex(ValueError, 'Content hash mismatch'):
                verify(hosted)

    def test_public_link_preview_is_in_the_entry_and_preserves_open_game_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / 'source'
            source.mkdir()
            (source / 'index.html').write_text('<html><head><meta name="game-release" content="18">'
                                               '<script src="game.js"></script></head><body>Game</body></html>')
            (source / 'game.js').write_text('void 0;')
            offline, first, second = (root / name for name in ('offline', 'first', 'second'))
            original = write_edition(source, offline)
            previous = Path('editions/17-previous/film.js')
            (offline / previous).parent.mkdir()
            (offline / previous).write_bytes(b'old tab')
            build_public_site(offline, first, 'https://game.example')
            build_public_site(first, second, 'https://game.example/')
            head = (second / 'index.html').read_text().partition('</head>')[0]
            self.assertEqual(head.count('name="twitter:card" content="summary_large_image"'), 1)
            self.assertIn('property="og:url" content="https://game.example/"', head)
            image_url = 'https://game.example/share/until-we-return-cover.jpg?v='
            self.assertIn('name="twitter:image" content="' + image_url, head)
            self.assertIn('property="og:image" content="' + image_url, head)
            self.assertIn('name="twitter:image:alt"', head)
            self.assertEqual((second / 'index.html').read_bytes(), (first / 'index.html').read_bytes())
            self.assertEqual(verify(second)['build'], original['build'][:20])
            self.assertEqual((second / previous).read_bytes(), b'old tab')
            self.assertNotIn('twitter:card', (offline / 'index.html').read_text())
            with Image.open(second / 'share/until-we-return-cover.jpg') as image:
                self.assertEqual((image.format, image.size), ('JPEG', (1200, 600)))
            self.assertIn('Allow: /', (second / 'robots.txt').read_text())

    def test_film_fallback_keeps_audio_samples_and_versions_the_frame_directory(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / 'source'
            fallback = source / 'assets' / 'story-film-compat'
            fallback.mkdir(parents=True)
            (source / 'index.html').write_text('<meta name="game-release" content="18"><script src="film.js"></script>')
            (source / 'film.js').write_text("const directory = 'assets/story-film-compat/';")
            # A valid sample payload can begin with the same characters as an asset URL.
            samples = b'window.samples = "assets/A";\n'
            (fallback / 'prologue-audio.js').write_bytes(samples)
            sheet = fallback / 'prologue-01.webp'
            Image.new('RGB', (2, 1), '#243456').save(sheet, lossless=True)
            result = root / 'built'
            with patch.object(build_web, 'SOURCE', source):
                build_web.build(result)
            archive = root / 'game.zip'
            package(result, archive)
            with zipfile.ZipFile(archive) as reader:
                prefix = json.loads(reader.read('release.json'))['directory']
                folder = prefix + 'assets/story-film-compat/'
                self.assertIn(folder.encode(), reader.read(prefix + 'film.js'))
                self.assertEqual(reader.read(folder + 'prologue-01.webp'), sheet.read_bytes())
                self.assertEqual(reader.read(folder + 'prologue-audio.js'), samples)
            (result / folder / 'prologue-audio.js').write_bytes(samples + b'changed')
            with self.assertRaisesRegex(ValueError, 'Content hash mismatch'):
                verify(result)

    def test_movie_and_caption_bytes_are_preserved_in_the_extracted_game(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / 'source'
            film = source / 'assets' / 'story-film'
            film.mkdir(parents=True)
            (source / 'index.html').write_text('<meta name="game-release" content="17"><script src="player.js"></script>')
            (source / 'player.js').write_text("const directory = 'assets/story-film/';")
            clip = b'\x00\x00\x00\x20ftypisom\xff\x00.paint.png'
            captions = 'WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nFrançois holds the line.\n'.encode()
            (film / 'prologue.mp4').write_bytes(clip)
            (film / 'prologue.vtt').write_bytes(captions)
            result = root / 'built'
            with patch.object(build_web, 'SOURCE', source):
                build_web.build(result)
            self.assertEqual(verify(result)['current_files'], 4)
            archive = root / 'game.zip'
            package(result, archive)
            with zipfile.ZipFile(archive) as reader:
                prefix = json.loads(reader.read('release.json'))['directory']
                self.assertIn((prefix + 'assets/story-film/').encode(), reader.read(prefix + 'player.js'))
                self.assertEqual(reader.read(prefix + 'assets/story-film/prologue.mp4'), clip)
                self.assertEqual(reader.read(prefix + 'assets/story-film/prologue.vtt'), captions)

    def test_scene_code_painting_and_previous_open_tab(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            base = root / 'flat'
            (base / 'assets').mkdir(parents=True)
            (base / 'index.html').write_text('<meta name="game-release" content="14"><script src="app.js"></script><link href="view.css" rel="stylesheet">')
            (base / 'app.js').write_text("const sheet = 'assets/' + actor + '.webp'; const cut = 'url(#pan)'; const mark = 'asset:assets/sea.webp';")
            (base / 'view.css').write_text("p{background:url('assets/sea.webp')}")
            (base / 'assets' / 'sea.webp').write_bytes(b'original sea')
            first = root / 'first'
            launch = write_edition(base, first)
            scope = launch['directory']
            self.assertIn(scope + 'assets/', (first / scope / 'app.js').read_text())
            self.assertIn('url(#pan)', (first / scope / 'app.js').read_text())
            self.assertIn("'asset:" + scope + "assets/sea.webp'", (first / scope / 'app.js').read_text())
            self.assertEqual(verify(first)['current_files'], 4)
            second = root / 'second'
            (base / 'assets' / 'sea.webp').write_bytes(b'changed sea')
            newer = write_edition(base, second)
            self.assertNotEqual(scope, newer['directory'])
            retain_open_editions(first, second)
            self.assertEqual(verify(second, first)['preserved_urls'], 3)
            self.assertEqual((second / scope / 'assets' / 'sea.webp').read_bytes(), b'original sea')
            self.assertEqual((second / newer['directory'] / 'assets' / 'sea.webp').read_bytes(), b'changed sea')
            (second / newer['directory'] / 'assets' / 'sea.webp').write_bytes(b'wrong content')
            with self.assertRaisesRegex(ValueError, 'Content hash'):
                verify(second)

            (base / 'app.js').write_text("const missing = 'asset:assets/missing-wood.webp';")
            broken = root / 'broken'
            write_edition(base, broken)
            with self.assertRaisesRegex(ValueError, 'Missing scene detail'):
                verify(broken)

    def test_offline_zip_preserves_the_inline_atlas(self):
        # A valid 2 x 2 PNG whose base64 contains a string resembling a path.
        png = ('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACnRFWHR4AEFB'
               '+assets/RsE5zwAAAAtJREFUeJxjYEAGAAAOAAGpkXOxAAAAAElFTkSuQmCC')
        atlas = f'window.materialAtlas = "data:image/png;base64,{png}";\n'
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            base = root / 'flat'
            base.mkdir()
            (base / 'index.html').write_text('<meta name="game-release" content="16">'
                                             '<script src="material-atlas.js"></script>', encoding='utf-8')
            (base / 'material-atlas.js').write_text(atlas, encoding='utf-8')
            output = root / 'built'
            manifest = write_edition(base, output)
            archive = root / 'game.zip'
            package(output, archive)
            atlas_name = manifest['directory'] + 'material-atlas.js'
            with zipfile.ZipFile(archive) as reader:
                self.assertEqual(set(reader.namelist()), {'index.html', 'release.json', 'PLAY.txt', atlas_name})
                self.assertEqual(reader.read(atlas_name), atlas.encode())


if __name__ == '__main__':
    unittest.main()
