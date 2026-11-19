/* Small, static grazing-light accents registered to the existing work plates.
   This does not alter the source image or add interactive hit targets. */
(function (host, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else host.CastawayWorkLighting = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  // Paths are percentages of the 3:2 plate. Each follows a visible feature;
  // colour is deliberately restrained to preserve the original brushwork.
  const plates = {
    chest:{material:'iron hasp', path:'M30 49 L45 49 L45 58 L42 58 L41 77 L37 84 L34 77 L34 58 L30 58 Z',color:'#e6d4ae',opacity:.16},
    chestOpen:{material:'iron hinge and axe',path:'M20 25 L32 25 L32 37 L20 37 Z M78 25 L90 25 L90 37 L78 37 Z M42 44 L59 40 L63 57 L42 58 Z',color:'#e5d2ae',opacity:.10},
    roof:{material:'damp canvas seam',path:'M35 24 Q49 32 62 39 L68 63 Q59 58 47 48 Z',color:'#c9d7d2',opacity:.09},
    roofSurvey:{material:'tin pan',path:'M54 84 Q60 82 66 84 L66 89 Q60 92 54 89 Z',color:'#c5d6d4',opacity:.12},
    drill:{material:'iron drill bit',path:'M30 70 Q33 59 47 60 L100 48 L100 59 L50 74 Q39 84 30 77 Z',color:'#d6c8af',opacity:.12},
    fastening:{material:'hull strakes',path:'M7 39 Q47 49 85 30 L86 34 Q48 52 7 43 Z',color:'#edc690',opacity:.06},
    hull:{material:'damp seam between planks',path:'M12 55 Q40 58 88 53 L88 57 Q48 62 12 59 Z',color:'#c2d1c8',opacity:.09},
    rig:{material:'sail fibres',path:'M3 4 L48 4 L54 36 Q36 46 5 54 Z',color:'#e9d7a8',opacity:.06},
    chart:{material:'brass dividers',path:'M90 34 L94 33 L99 72 L96 73 Z',color:'#f1d69d',opacity:.12},
    landing:{material:'rope on thwart',path:'M0 59 Q16 56 30 70 L35 76 L18 80 L0 73 Z',color:'#dfc496',opacity:.07}
  };
  function registration(id, state) {
    state = state || {};
    if (id === 'chest' && state.done) return plates.chestOpen;
    if (id === 'roof' && (!state.located || state.done || state.surveyEnd || state.review)) return plates.roofSurvey;
    return plates[id] || null;
  }
  // Called after the work surface is drawn or replaced. enabled=false is the
  // Original rendering setting. No animation or event listener is installed.
  function update(dialog, id, state, enabled) {
    if (!dialog || !dialog.querySelector) return null;
    const board = dialog.querySelector('.fw-board');
    if (!board) return null;
    let layer = board.querySelector('.fw-material-light');
    const entry = enabled === false ? null : registration(id,state);
    if (!entry) { if (layer) layer.remove(); return null; }
    if (!layer) {
      if (typeof board.ownerDocument?.createElementNS !== 'function' || typeof board.insertBefore !== 'function') return null;
      layer = board.ownerDocument.createElementNS('http://www.w3.org/2000/svg','svg');
      layer.setAttribute('class','fw-material-light');
      layer.setAttribute('aria-hidden','true');
      layer.setAttribute('viewBox','0 0 100 100');
      layer.setAttribute('preserveAspectRatio','none');
      board.insertBefore(layer,board.querySelector('.fw-drawing'));
    }
    // A broad directional falloff is clipped to the painted material shape.
    layer.innerHTML = `<defs><linearGradient id="fw-material-glance" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${entry.color}" stop-opacity="${entry.opacity}"/><stop offset="1" stop-color="${entry.color}" stop-opacity="0"/></linearGradient></defs><path d="${entry.path}" fill="url(#fw-material-glance)"/>`;
    layer.dataset.material=entry.material;
    return layer;
  }
  return {update, registration, plates:Object.keys(plates)};
});
