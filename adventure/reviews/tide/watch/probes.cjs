// Coordinates measured against the current registered plates at 1000 × 563.
// "dry" includes precipitation; "solid" samples the material beneath it.
// "air" measures the difference introduced *after* the landscape was painted.
const dry=(name,box)=>({name,box,mode:'dry'});
const solid=(name,box)=>({name,box,mode:'solid'});
const live=(name,box,min)=>({name,box,min,mode:'land'});
const air=(name,box,min)=>({name,box,min,mode:'air'});
module.exports=[
  {scene:'beach',seconds:32,label:'Reef and flats',crop:[0,266,415,154],probes:[
    solid('Distant wreck hull',[97,324,16,5]),dry('Rātā branch',[727,185,17,6]),
    dry('Foreground stone',[226,506,23,13]),live('Shoreward breakers',[0,340,360,40],310),
    air('Rain above the flats',[29,187,160,104],90)]},
  {scene:'wreck',seconds:30,label:'Under the bow',crop:[0,224,270,178],probes:[
    dry('Plank face',[390,252,29,11]),dry('Iron strap on crate',[706,317,8,14]),
    solid('Rock below the bow',[72,378,9,5]),live('Bow surge',[0,291,65,80],120),
    live('Seaway at the stern',[694,252,77,28],50)]},
  {scene:'salvage',seconds:43,probes:[
    dry('Winter planking',[386,257,29,11]),dry('Salvage ledge',[416,405,20,7]),
    live('Swell beside the winter hull',[1,320,61,73],100)]},
  {scene:'slipway',seconds:41,label:'Stockyard cove',crop:[0,163,412,155],probes:[
    dry('Gunwale forward',[621,243,24,7]),dry('Forward stock',[722,399,17,11]),
    solid('Rock below the headland',[22,239,8,4]),live('Squall on the cove',[76,216,223,55],220)]},
  {scene:'slipway',flags:{sailRigged:true},seconds:41,probes:[
    dry('Mast step',[657,278,5,9]),dry('Foot of forward stock',[727,410,9,7]),
    live('Rigged sail lifting',[461,108,193,129],150)]},
  {scene:'forest',seconds:59,probes:[
    solid('Dark rock between streams',[201,292,3,27]),dry('Gully root',[89,340,20,12]),
    live('Falling water',[191,285,24,75],65),air('Snow under canopy',[625,201,125,102],75)]},
  {scene:'cabin',seconds:59,probes:[
    dry('Opaque central sash',[210,100,8,85]),dry('Bench timber',[439,307,21,9]),
    air('Sleet seen through west glass',[147,98,59,46],10)]},
  {scene:'crossing',seconds:46,label:'The gale at sea',crop:[445,184,431,163],probes:[
    dry('Mast wood',[416,211,10,41]),dry('Port tiller',[47,291,19,5]),
    dry('Gunwale abaft the mast',[542,339,29,6]),live('Foam on the long swell',[486,222,253,72],225),
    live('Standing water on the sole',[569,446,171,28],30),air('Squall over lookout',[8,126,145,132],130)]},
  {scene:'crossing',transitionAt:43,flags:{rigSecured:true,boatDry:true},seconds:46,probes:[
    dry('Tiller after bailing',[47,291,19,5]),dry('Board beneath the torn sail',[709,466,20,7]),
    live('Long swell beside the bailed boat',[486,222,253,72],225),air('Droplets forming on the board',[626,454,63,10],5)]},
  {scene:'crossing',transitionAt:43,flags:{rigSecured:true,boatDry:true,sailMended:true,courseSet:true},seconds:46,probes:[
    dry('Mast wood after repair',[416,211,10,41]),dry('Dry aft board',[709,466,20,7]),
    live('Same long swell after repair',[486,222,253,72],225),air('Beads at the floor seam',[626,454,63,10],5)]},
  {scene:'landing',seconds:43,probes:[
    dry('Keel',[474,318,27,10]),dry('Mooring post',[756,322,12,31]),
    live('Wash reaches below keel',[538,332,183,19],65)]}
];
