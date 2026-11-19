"""Controlled transport fixture, with the same geometry and energy solver as the bake."""
import base64
import importlib.util
import io
import json
import subprocess
import sys
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

sys.dont_write_bytecode = True
tool = Path(__file__).resolve().parents[1] / "tools/bake_materials.py"
spec = importlib.util.spec_from_file_location("material_bake", tool)
bake = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bake)


class TransportTest(unittest.TestCase):
    def test_colour_bleed_two_hops_and_occlusion(self):
        # Illuminate a coloured surface ending at x=79. The neutral receiver
        # at x=118 is beyond the longest single projected link (29 texels).
        incident = np.zeros((bake.HEIGHT, bake.WIDTH, 3))
        incident[:, :80] = 1
        reflectance = np.full_like(incident, .60)
        reflectance[:, :80, 1:] = .09
        floor = np.zeros(incident.shape[:2])
        clear = bake.diffuse_exchanges(reflectance, incident, floor)
        self.assertGreater(clear[72, 89, 0], 4*clear[72, 89, 2])
        self.assertGreater(clear[72, 118, 0], .00012)
        self.assertEqual(clear[72, 148, 0], 0)
        barrier = floor.copy()
        barrier[:, 82:87] = 18
        occluded = bake.diffuse_exchanges(reflectance, incident, barrier)
        self.assertLess(occluded[72, 89, 0], clear[72, 89, 0]*.30)

    def test_subpixel_coverage_and_cutout(self):
        # The left edge crosses a texel and the hole protects the inner sill.
        weight = bake.matte("10.2,20 40,20 40,60 10.2,60", ["18,32 27,32 27,43 18,43"])
        self.assertTrue(np.any((weight > 0) & (weight < 1)))
        self.assertEqual(weight[54,55], 0)
        self.assertEqual(weight[70,55], 1)


    def test_reference_matches_all_original_plates(self):
        # Decode the delivered module, including PNG palette expansion. Derive
        # the comparison from the real input plate independently of the bake.
        script = """
const fs = require('node:fs'), atlas = require('./dist/material-atlas.js');
const states = JSON.parse(fs.readFileSync(0,'utf8'));
const unique = new Map();
for (const {scene,flags} of states) {
    const layout = atlas.get(scene, flags);
    unique.set(layout.plate,layout.pigment);
}
process.stdout.write(JSON.stringify(Object.fromEntries(unique)));
"""
        states = [{"scene":s["scene"], "flags":s["flags"]} for s in bake.source_states()]
        refs = json.loads(subprocess.run(["node","-e",script],input=json.dumps(states),
                          cwd=bake.ROOT,text=True,capture_output=True,check=True).stdout)
        self.assertEqual(len(refs),22)
        for name,uri in refs.items():
            with self.subTest(plate=name):
                data = base64.b64decode(uri.split(",",1)[1],validate=True)
                encoded = Image.open(io.BytesIO(data)).convert("RGB")
                original = Image.open(bake.DIST/name).convert("RGB").resize((256,144),Image.Resampling.LANCZOS)
                src = np.asarray(original,dtype=float)
                pixels = np.asarray(encoded,dtype=float)
                delta = np.abs(pixels-src)
                self.assertLess(delta.mean(),4.0)
                self.assertLessEqual(np.percentile(delta,95),11)
                # Shadow bias in the darkest fifth tests preservation across the
                # image, including plates without any near-black texels.
                luma = src @ bake.LUMA
                shadow = luma <= np.percentile(luma,20)
                bias = np.mean((pixels @ bake.LUMA)[shadow]-luma[shadow])
                self.assertLess(abs(bias),2.0)


if __name__ == "__main__":
    unittest.main()
