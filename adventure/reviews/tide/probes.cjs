// Independent sampling rectangles read from the final art at 1000 × 563 pixels.
// "dry" asserts equality to the base even after weather and local work are drawn.
// "solid" makes the same assertion beneath passing precipitation.
module.exports = [
  {scene:'beach', title:'Příboj u Graftonu', caption:'Leden 1864', flags:{},
   crop:[0,118,405,270], probes:[
    ['Čelo útesu','solid',[185,281,17,8]],
    ['Lišejník na balvanu','dry',[318,330,18,12]],
    ['Pěna v příboji','live',[2,252,125,49],100],
    ['Špičky trávy','live',[6,458,45,33],15]
   ]},
  {scene:'forest', title:'Sladká voda',caption:'Zima 1864',flags:{},
   crop:[116,234,263,175], probes:[
    ['Skalní římsa','solid',[220,286,10,22]],
    ['Mezi vodními prameny','solid',[201,292,3,27]],
    ['Větev nad kaskádou','dry',[187,15,15,10]],
    ['Kmen s lišejníkem','dry',[117,79,10,20]],
    ['Kořen u pěšiny','dry',[89,340,20,12]],
    ['Proud přes římsu','live',[191,285,24,75],65],
    ['Lístky kapradiny','live',[117,296,49,33],12]
   ]},
  {scene:'crossing',title:'Přes moře',caption:'Červenec 1865',flags:{},
   crop:[380,192,369,246], probes:[
    ['Zahnuté dřevo nad zábradlím','solid',[54,296,14,5]],
    ['Spára na stěžni','dry',[443,260,12,26]],
    ['Horní hrana pažení','dry',[523,340,58,7]],
    ['Povrch otevřeného moře','live',[524,262,255,65],130]
   ]}
];
