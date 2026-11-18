/* Displacement measured on the archived slivers alone, before rain or compression. */
'use strict';
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const vm = require('node:vm');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const archive = '19235ea0f1f1e6008e1f2ea482945264c19e0212';
const root = path.resolve(__dirname, '../../..');
function blob(file) {
  return execFileSync('git', ['show', archive + ':adventure/dist/' + file], {cwd: root, maxBuffer: 24 * 1024 * 1024});
}
const host = {};
vm.runInNewContext(blob('landscape.js').toString(), {window: host});
const painter = host.CastawayLandscape;
const cases = [
  ['beach', 'assets/beach.png', [['reef face', [159,282,20,9]]]],
  ['forest', 'assets/voyage/scenes/forest.png', [
    ['canopy limb', [187,15,15,10]], ['ledge', [193,289,5,30]],
    ['lichen trunk', [117,79,10,20]], ['root', [89,340,20,12]]
  ]],
  ['crossing', 'assets/voyage/scenes/crossing-wet.png', [
    ['curved rail', [42,295,19,9]], ['mast', [441,273,10,20]]
  ]]
];
async function run() {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'castaway-baseline-'));
  try {
    for (const [scene,file,probes] of cases) {
      const filename = path.join(scratch, scene+'.png');
      fs.writeFileSync(filename, blob(file));
      const source = await loadImage(filename);
      const ctx = createCanvas(1000,563).getContext('2d');
      const parts = painter.prepare({createElement: () => createCanvas(1,1)}, source, painter.describe({scene, flags:{}}));
      const frames = [.2,2,3.5].map(time => {
        ctx.drawImage(source,0,0,1000,562.5);
        painter.paint(ctx,parts,time,.8);
        return ctx.getImageData(0,0,1000,563).data;
      });
      for (const [name, [x,y,w,h]] of probes) {
        let changed = 0, max = 0;
        for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
          let diff = 0;
          for (let c = 0; c < 3; c++) {
            const k = 4 * (j * 1000 + i) + c;
            diff = Math.max(diff, Math.abs(frames[0][k] - frames[1][k]), Math.abs(frames[0][k] - frames[2][k]));
          }
          if (diff) changed++;
          max = Math.max(diff,max);
        }
        console.log(scene, name, [x,y,w,h].join(','), changed + '/' + w*h, 'max=' + max);
      }
    }
  } finally { fs.rmSync(scratch, {recursive:true,force:true}); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
