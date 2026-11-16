// Original painted voyage props. All crop metadata and generation provenance live in assets/voyage/props/manifest.json.
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./art.js'));
 else root.AdventureArt=factory(root.AdventureArt);
})(typeof window!=='undefined'?window:globalThis,function(base){'use strict';
 const additions={
  "hide": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      7,
      53,
      401,
      348
    ]
  },
  "flask": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      480,
      15,
      318,
      394
    ]
  },
  "metalPipe": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      871,
      74,
      363,
      310
    ]
  },
  "charcoal": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      15,
      495,
      387,
      274
    ]
  },
  "ironScrap": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      429,
      458,
      383,
      358
    ]
  },
  "bellows": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      836,
      432,
      411,
      376
    ]
  },
  "boatNails": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      28,
      862,
      350,
      378
    ]
  },
  "planks": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      418,
      842,
      404,
      388
    ]
  },
  "oakum": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      836,
      867,
      409,
      366
    ]
  },
  "resin": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      56,
      6,
      295,
      404
    ]
  },
  "bailer": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      435,
      68,
      376,
      299
    ]
  },
  "compass": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      874,
      2,
      335,
      415
    ]
  },
  "chart": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      3,
      452,
      403,
      384
    ]
  },
  "journal": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      453,
      424,
      332,
      400
    ]
  },
  "provisions": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      869,
      423,
      356,
      401
    ]
  },
  "lantern": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      92,
      836,
      237,
      415
    ]
  },
  "caulking": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      418,
      904,
      405,
      318
    ]
  },
  "sailRoll": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      836,
      911,
      414,
      292
    ]
  },
  "weatherPatch": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      7,
      53,
      401,
      348
    ]
  },
  "filledFlask": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      480,
      15,
      318,
      394
    ]
  },
  "leather": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      7,
      53,
      401,
      348
    ]
  },
  "sailcloth": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      836,
      911,
      414,
      292
    ]
  },
  "spareSail": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      836,
      911,
      414,
      292
    ]
  },
  "markedChart": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      3,
      452,
      403,
      384
    ]
  },
  "rescueProvisions": {
    "file": "assets/voyage/props/voyage.png",
    "width": 1254,
    "height": 1254,
    "box": [
      869,
      423,
      356,
      401
    ]
  },
  "drillBlank": {
    "file": "assets/voyage/props/workshop.png",
    "width": 1254,
    "height": 1254,
    "box": [
      871,
      74,
      363,
      310
    ]
  }
};
 additions.kettle={"file": "assets/voyage/props/kettle.png", "width": 1254, "height": 1254, "box": [76, 78, 1019, 1082]};
 for(const [id,source]of Object.entries({twine:'rope',stormLine:'rope',rescueLine:'rope',canvasPatch:'canvas'}))additions[id]=base.props[source];
 return {...base,props:{...base.props,...additions}};
});
