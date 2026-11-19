"""Release isolation, offline paths and preservation of an already opened edition."""
from pathlib import Path
import tempfile
import unittest
import sys
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from build_web import retain_open_editions, write_edition
from package_download import package
from verify_web import verify


class EditionLayout(unittest.TestCase):
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
