// Original painted fittings and full-width shipboard materials.
(function(root,factory){const ui=factory();if(typeof module==='object'&&module.exports)module.exports=ui;else{root.AdventureInterface=ui;ui.mount(document);}})(typeof window!=='undefined'?window:globalThis,function(){'use strict';
const assets={
  "timber-strip": {
    "file": "assets/ui/castaway-ui-atlas.png",
    "width": 1536,
    "height": 1024,
    "box": [
      12,
      182,
      493,
      191
    ]
  },
  "inventory-canvas": {
    "file": "assets/ui/castaway-ui-atlas.png",
    "width": 1536,
    "height": 1024,
    "box": [
      522,
      142,
      490,
      261
    ]
  },
  "dialog-paper": {
    "file": "assets/ui/castaway-ui-atlas.png",
    "width": 1536,
    "height": 1024,
    "box": [
      1031,
      94,
      491,
      353
    ]
  },
  "satchel": {
    "file": "assets/ui/castaway-ui-atlas.png",
    "width": 1536,
    "height": 1024,
    "box": [
      66,
      580,
      382,
      365
    ]
  },
  "brass-button": {
    "file": "assets/ui/castaway-ui-atlas.png",
    "width": 1536,
    "height": 1024,
    "box": [
      604,
      596,
      323,
      329
    ]
  },
  "paper-tab": {
    "file": "assets/ui/castaway-ui-atlas.png",
    "width": 1536,
    "height": 1024,
    "box": [
      1059,
      675,
      441,
      183
    ]
  }
};
function painting(id,cls='',fit='meet'){const a=assets[id];if(!a)return '';return `<svg class="painted ui-painting ${cls}" viewBox="${a.box.join(' ')}" preserveAspectRatio="xMidYMid ${fit}" aria-hidden="true" focusable="false"><svg class="atlas-clip" x="${a.box[0]}" y="${a.box[1]}" width="${a.box[2]}" height="${a.box[3]}" viewBox="${a.box.join(' ')}" overflow="hidden" style="width:${a.box[2]}px;height:${a.box[3]}px;overflow:hidden!important"><image href="${a.file}" width="${a.width}" height="${a.height}"/></svg></svg>`;}
const materials = {
 'timber-strip': 'timber', 'inventory-canvas': 'canvas', 'dialog-paper': 'paper', 'paper-tab': 'paper'
};
function mount(doc) {
 for (const node of doc.querySelectorAll('[data-material]')) {
  const material = materials[node.dataset.material];
  if (!material || node.dataset.materialMounted) continue;
  node.insertAdjacentHTML('afterbegin', `<span class="material-surface ship-${material}" aria-hidden="true"></span>`);
  node.dataset.materialMounted = 'true';
 }
 for (const node of doc.querySelectorAll('[data-ui-painting]')) {
  node.innerHTML = painting(node.dataset.uiPainting);
 }
}
return {assets,materials,painting,mount};
});
