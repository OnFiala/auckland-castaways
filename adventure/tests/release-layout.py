"""Release isolation, offline paths and preservation of an already opened edition."""
from pathlib import Path
import tempfile
import unittest
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from build_web import retain_open_editions, write_edition
from verify_web import verify


class EditionLayout(unittest.TestCase):
    def test_scene_code_painting_and_previous_open_tab(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            base = root / 'flat'
            (base / 'assets').mkdir(parents=True)
            (base / 'index.html').write_text('<meta name="game-release" content="14"><script src="app.js"></script><link href="view.css" rel="stylesheet">')
            (base / 'app.js').write_text("const sheet = 'assets/' + actor + '.webp'; const cut = 'url(#pan)';")
            (base / 'view.css').write_text("p{background:url('assets/sea.webp')}")
            (base / 'assets' / 'sea.webp').write_bytes(b'original sea')
            first = root / 'first'
            launch = write_edition(base, first)
            scope = launch['directory']
            self.assertIn(scope + 'assets/', (first / scope / 'app.js').read_text())
            self.assertIn('url(#pan)', (first / scope / 'app.js').read_text())
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


if __name__ == '__main__':
    unittest.main()
