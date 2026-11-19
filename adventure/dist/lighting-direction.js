/* Screen-relative lighting direction for the existing painted plates.
   These are visual interpretations of the paintings, not weather observations
   or reconstructed historical light. x/y place the apparent light source in
   the image (0..1); they do not indicate a geographic bearing. */
(function (host, factory) {
  const direction = factory();
  if (typeof module === 'object' && module.exports) module.exports = direction;
  else host.CastawayLightingDirection = direction;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  // key x, y, RGB, intensity; exposure multiplier; warmth offset; ambient;
  // lens (subtle edge falloff); bloom. Each baseline belongs to its plate.
  const rooms = {
    beach:       {key:[.17,.16,[.76,.83,.91],.68], exposure:1.00,warmth:-.04,ambient:.72,lens:.12,bloom:.08},
    wreck:       {key:[.15,.12,[.85,.86,.84],.67], exposure:1.00,warmth:-.02,ambient:.73,lens:.10,bloom:.06},
    camp:        {key:[.38,.18,[.95,.78,.60],.57], exposure:1.00,warmth:.05,ambient:.68,lens:.13,bloom:.05},
    cabin:       {key:[.21,.25,[.66,.80,.94],.65], exposure:.96,warmth:-.03,ambient:.58,lens:.15,bloom:.06},
    forest:      {key:[.46,.09,[.77,.86,.91],.63], exposure:1.00,warmth:.01,ambient:.66,lens:.13,bloom:.08},
    forge:       {key:[.06,.34,[.70,.82,.92],.67], exposure:.96,warmth:-.02,ambient:.56,lens:.15,bloom:.06},
    charcoal:    {key:[.27,.14,[.87,.86,.72],.57], exposure:.98,warmth:.03,ambient:.64,lens:.14,bloom:.07},
    slipway:     {key:[.15,.12,[.82,.86,.90],.62], exposure:1.00,warmth:-.03,ambient:.72,lens:.10,bloom:.06},
    salvage:     {key:[.17,.12,[.76,.81,.87],.58], exposure:.97,warmth:-.05,ambient:.72,lens:.11,bloom:.04},
    crossing:    {key:[.16,.34,[.91,.76,.67],.59], exposure:.96,warmth:.00,ambient:.64,lens:.14,bloom:.08},
    harbour:     {key:[.04,.41,[1,.68,.45],.72], exposure:1.02,warmth:.10,ambient:.66,lens:.11,bloom:.12},
    chartroom:   {key:[.12,.27,[.93,.80,.61],.69], exposure:1.00,warmth:.07,ambient:.58,lens:.14,bloom:.07},
    landing:     {key:[.38,.16,[.82,.85,.88],.62], exposure:1.00,warmth:-.02,ambient:.71,lens:.10,bloom:.07},
    return_camp: {key:[.21,.25,[1,.72,.51],.65], exposure:1.00,warmth:.08,ambient:.59,lens:.14,bloom:.09}
  };
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const finite = n => typeof n === 'number' && Number.isFinite(n) ? n : 0;
  function resolve(scene, conditions, flags) {
    const base = rooms[scene];
    if (!base) return null;
    const shade = clamp(finite(conditions?.shade),0,1);
    const rain = clamp(finite(conditions?.rain),0,1);
    flags = flags || {};
    // The rain and cloud are already represented in Weather's chapter clock.
    // They modulate daylight, never select a new location or create a storm.
    const indoor = scene === 'cabin' || scene === 'forge' || scene === 'chartroom' || scene === 'return_camp';
    const influence = indoor ? .55 : 1;
    let practical = null;
    if (scene === 'camp' && flags.fireLit) practical = {x:.275,y:.655,color:[1,.55,.27],intensity:.30,radius:.22};
    if (scene === 'cabin' && flags.warmthReady) practical = {x:.14,y:.59,color:[1,.55,.25],intensity:.39,radius:.27};
    if (scene === 'forge' && flags.forgeLit) practical = {x:.415,y:.452,color:[1,.48,.19],intensity:.46,radius:.25};
    if (scene === 'landing' && flags.landingMarked) practical = {x:.778,y:.355,color:[1,.69,.38],intensity:.16,radius:.12};
    if (scene === 'return_camp') practical = {x:.14,y:.59,color:[1,.56,.28],intensity:.36,radius:.27};
    const [x,y,color,intensity] = base.key;
    return {
      key:{x,y,color:[...color],intensity:intensity*(1-.22*shade*influence)},
      practical,
      exposure:base.exposure*(1-.10*shade*influence),
      warmth:base.warmth-.025*rain*influence,
      ambient:base.ambient*(1-.08*shade*influence),
      lens:base.lens,
      // Shaft visibility follows the same daylight and shade, not a new light.
      volume:clamp((indoor ? .16 : .09)*(1-.45*shade),0,1),
      bloom:base.bloom*(1-.30*shade*influence)
    };
  }
  return {resolve, rooms: Object.keys(rooms)};
});
