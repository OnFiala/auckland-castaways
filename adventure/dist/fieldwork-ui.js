/* Working points on the plate have an optional named-list equivalent. */
(function (root) {
  'use strict';
  const model = root.CastawayFieldwork;
  const saveKey = 'until-we-return.fieldwork.1';
  const memory = new Map(), plates = new Map();
  function fileFor(id, state) {
    if (id === 'fastening') return sceneAsset('slipway.webp');
    if (id === 'roof' && (!state?.located || state.done)) return sceneAsset('cabin.webp');
    return 'assets/workplates/' + id + '.webp';
  }
  function prepare(id) {
    if (!model.puzzles[id] || !root.Image || plates.has(id)) return;
    const picture = new root.Image();
    plates.set(id,picture);
    picture.onerror = () => plates.delete(id);
    picture.src = fileFor(id);
  }
  function prepareForItem(item, scene) {
    const match = Object.entries(model.puzzles).find(([,p]) => p.item === item && p.scene === scene);
    if (match) prepare(match[0]);
  }

  let active = null, recording = null, muted = false;
  const muteKey = 'until-we-return.drip-muted';
  try { muted = localStorage.getItem(muteKey) === 'true'; } catch (_) { /* Muting still works here. */ }
  function quiet() {
    if (recording) { recording.pause(); recording = null; }
  }
  let visibilityChange = 0;
  document.addEventListener?.('visibilitychange', () => {
    visibilityChange++;
    if (document.hidden) quiet();
  });
  function listen() {
    quiet();
    if (muted || document.hidden || typeof root.Audio !== 'function') return;
    recording = new root.Audio(sceneAsset('drop-in-pan.wav'));
    recording.play()?.catch(() => {}); // The ring and its caption carry the same evidence.
  }

  function read(id) {
    let saved = memory.get(id);
    if (!saved) {
      try { saved = JSON.parse(localStorage.getItem(saveKey + '.' + id)); } catch (_) { /* Storage is optional. */ }
    }
    const clean = {state: model.initial(id), trail: [], hints: 0, feedback: ''};
    if (!saved || !Array.isArray(saved.trail) || saved.trail.length > 64) return clean;
    let current = clean.state, feedback = '';
    // Old roof sessions started at the exposed lap. Preserve their stitches on the new room view.
    const legacyLap = id === 'roof' && ['under','over'].includes(saved.trail[0]);
    const trail = legacyLap ? ['pan','wetSeam', ...saved.trail] : saved.trail;
    for (const action of trail) {
      if (!model.view(id, current).actions.some(a => a.id === action)) return clean;
      const replay = model.step(id, current, action);
      current = replay.state;
      feedback = replay.feedback;
    }
    return {state: current, trail: [...trail], feedback, hints: Math.max(0, Math.min(3, Number.isInteger(saved.hints) ? saved.hints : 0))};
  }
  function save(session) {
    const record = {trail: session.trail, hints: session.hints};
    memory.set(session.id, record);
    try { localStorage.setItem(saveKey + '.' + session.id, JSON.stringify(record)); } catch (_) { /* Keep the in-memory position. */ }
  }
  function remove(id) {
    memory.delete(id);
    try { localStorage.removeItem(saveKey + '.' + id); } catch (_) { /* No persistent storage. */ }
  }
  // Remove loops so any number of experiments can be saved in a small legal replay.
  function remember(session, action, next) {
    const wanted = JSON.stringify(next);
    let cursor = model.initial(session.id);
    if (JSON.stringify(cursor) === wanted) return [];
    for (let i = 0; i < session.trail.length; i++) {
      cursor = model.step(session.id, cursor, session.trail[i]).state;
      if (JSON.stringify(cursor) === wanted) return session.trail.slice(0, i + 1);
    }
    return [...session.trail, action];
  }

  const defs = `<defs>
    <linearGradient id="fw-hide" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#99805a"/><stop offset=".55" stop-color="#92714b"/><stop offset="1" stop-color="#675237"/></linearGradient>
    <pattern id="fw-soundings" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0H4M0 0V4" fill="none" stroke="#685838" stroke-width=".11" opacity=".36"/></pattern>
  </defs>`;
  function line(d, stroke, width, attributes = '') {
    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${attributes}/>`;
  }
  function rope(d, className = '') {
    return `<g class="${className}">${line(d, '#483929', 1.42)}${line(d, '#ac8656', .95)}${line(d, '#d4b78a', .52, 'stroke-dasharray=".28 .7"')}</g>`;
  }
  function chest(s, a) {
    if (!s.seated) return '';
    const pivot = s.pivot === 'near' ? [67, 61.5] : [46, 75];
    let block = '';
    if (s.pivot) block = `<g class="fw-place" transform="translate(${pivot.join(' ')})"><path d="M-4 4L-1 -1.5 3 -1 5 3 0 6Z" fill="#755737" stroke="#423323" stroke-width=".42"/>${line('M-3.5 3.5L0 1l4.1 1.6 M-1.5 3.5L1.8 1.8','#ad8d5f',.34)}</g>`;
    // Crop the same painted iron from the satchel and seat its hook in the nick.
    const bar = `<defs><clipPath id="fw-bar-crop"><rect x="31" y="57.6" width="44.5" height="28.1"/></clipPath></defs>
      <g clip-path="url(#fw-bar-crop)"><image href="assets/props/tools.png" x="26.64" y="26.94" width="155.7" height="59.58" preserveAspectRatio="none"/></g>`;
    return `${s.done ? '<path d="M18 60.6Q55 60.2 97.5 57.6l-.1 2.6q-27 .8-40 .4l-39.4.5Z" fill="#2c271e" opacity=".96"/>' : ''}${block}<g class="${a === 'press' ? 'fw-lever' : 'fw-place'}" style="transform-origin:${pivot[0]}% ${pivot[1]}%">${bar}</g>`;
  }
  const sceneAsset = name => 'assets/field-scenes/' + name;
  function tinAndStain(sealed) {
    const stain = '<path d="M35.8 34.6q2.8 1.2 3.5 4l-.7 4.1-1.2-.8-.6 4-1.1-1.4.1-3.7-1.1-2.4Z" fill="#543b25" opacity=".53" stroke="#a3885c" stroke-width=".27"/>';
    const pan = `<ellipse cx="66.5" cy="80" rx="5.9" ry="1.05" fill="#30251c" opacity=".47"/>
      <path d="M59.5 76.2q6.1 1.6 12.5-.1l-1 3.1q-4.8 1.8-10.3.1Z" fill="url(#fw-tin)" stroke="#423b31" stroke-width=".33"/>
      <ellipse cx="65.75" cy="76.2" rx="6.25" ry="1.34" fill="#68685b" stroke="#c1b39b" stroke-width=".42"/>
      ${line('M60.5 76.45q5.4.93 10.6-.05','#343e3b',.24)}
      ${line('M61.3 78.4q4 .9 8.2.12','#b6a88e',.25)}`;
    const water = sealed
      ? line('M28.2 20.2l-.8 3.6m.5.7-.55 3.1m-1 .7-.4 1.7', '#ccdbe0', .48, 'class="fw-runoff"')
      : `<path class="fw-drip" d="M65.8 23.4q-.85 1.65-.42 2.1.62.43.9-.4.1-.38-.48-1.7Z" fill="#c1d7d8" stroke="#5c7377" stroke-width=".17"/>
        <ellipse class="fw-pan-ring" cx="65.8" cy="76.2" rx="3.2" ry=".55" fill="none" stroke="#d5ddd0" stroke-width=".35"/>`;
    return stain + pan + water;
  }
  const tinGradient = '<defs><linearGradient id="fw-tin"><stop stop-color="#776a55"/><stop offset=".28" stop-color="#aba992"/><stop offset=".6" stop-color="#817b67"/><stop offset="1" stop-color="#504b3d"/></linearGradient></defs>';
  function cabinTraces(sealed) {
    // The detail crops native scene pixels [125, 0, 1325, 800] from a 1672 × 941 painting.
    return `<svg aria-hidden="true" class="fw-cabin-traces" viewBox="0 0 100 100" preserveAspectRatio="none">${tinGradient.replace('fw-tin','fw-room-tin')}${tinAndStain(sealed).replace('url(#fw-tin)','url(#fw-room-tin)')}</svg>`;
  }
  const reaches = {player: [301,377], musgrave: [338,508]};
  const poses = {
    player: {stand: [274,714,138,709], reach: [485,665,479,282], height:705},
    musgrave: {stand: [258,852,132,847], reach: [506,793,500,280], height:843}
  };
  // Anchor a standing figure at the boots and a working figure at the outstretched hand.
  function figure(id, pose, x, y, face, held='') {
    const sheet=poses[id], [w,h,ax,ay]=sheet[pose];
    const sy=48/sheet.height, sx=sy*2/3;
    const handOrFoot=`translate(${x} ${y}) scale(${face} 1)`;
    const footX = pose === 'stand' ? x : x - face * reaches[id][0] * sx;
    const footY = pose === 'stand' ? y : y + reaches[id][1] * sy;
    return `<g data-fw-actor="${id}" data-foot-x="${footX}" data-foot-y="${footY}"><g transform="${handOrFoot}"><image href="${sceneAsset(id+'-'+pose+'.webp')}" x="${-ax*sx}" y="${-ay*sy}" width="${w*sx}" height="${h*sy}" preserveAspectRatio="none"/></g>${held}</g>`;
  }
  function fasteningDescription(s) {
    if (s.done) return 'A narrow band of new timber now follows the curve of the hull.';
    if (s.clear) return 'Neither man is holding the board. Alick can put his weight on it now.';
    if (s.driven) return 'The hammer falls. The men are still supporting the wood between them.';
    if (s.handed) return 'Musgrave has the nails at the middle rib. Alick can move from one end of the plank to the other.';
    return model.puzzles.fastening.description;
  }
  function fastening(s, a) {
    const seated = s.brace === 'bow' || s.driven;
    const tip = seated ? 33 : s.tested ? 37.7 : 34.5;
    const board = `M23 40.4 Q47 44 77.2 ${tip}l.1 2.55Q47 46.9 23.1 42.8Z`;
    const light = `<path d="M45 42.2Q62 39 77.7 32.9l-.4 2.45Q63 42 47 43Z" fill="#b5a886" stroke="#614f39" stroke-width=".36"/>`;
    const wood = `<defs><clipPath id="fw-new-strake"><path d="${board}"/></clipPath></defs>
      ${s.tested && !seated ? light : ''}
      <g class="${a==='pressPlank' ? 'fw-board-test' : ''}">
        <path d="${board}" fill="#a17142" stroke="#5c402b" stroke-width=".65"/>
        <image href="${sceneAsset('timber.webp')}" clip-path="url(#fw-new-strake)" x="22" y="32" width="56" height="14" preserveAspectRatio="none"/>
        ${line(`M23.3 40.6Q47 44 77.1 ${tip+.15}`,'#d3ac78',.36)}
        ${line(`M23.4 42.5Q47 46.7 77.1 ${tip+2.4}`,'#614129',.36)}
      </g>`;
    const nail = (x,y) => `<g transform="translate(${x} ${y}) rotate(-14)">${line('M0 0L.3 2.4M-.6 0h1.1','#403931',.52)}${line('M-.48 -.12h.8','#c3b5a1',.22)}</g>`;
    const hammer = (x,y,hit) => `<g transform="translate(${x} ${y}) rotate(${a==='strike' && !s.driven ? 44 : 0})">
      <g class="${hit ? 'fw-hammer-strike' : ''}">
      <path d="M-.4.7q.05.35.43.38l1.85-5.3-.46-.21Z" fill="#876342" stroke="#483829" stroke-width=".2"/>
      ${line('M-.14 .68l1.74-4.9','#bd9569',.15)}
      <path d="M.41-4.9l.43-.95 1.02.43.25.45.25.12.47-.13.82.39-.41 1.2-.86-.42-.18-.35-.34-.13-.35.11Z" fill="#5c5549" stroke="#35342f" stroke-width=".18"/>
      ${line('M.88-5.6l.85.35m.82.47.84.38','#a49d8a',.21)}</g></g>`;
    let crew;
    if (!s.handed) {
      crew = figure('musgrave','reach',44.8,39,-1,hammer(48.7,42.3,false))
        + (s.tested ? figure('player','reach',43.7,39,1,nail(43,39)) : figure('player','reach',43,43,1,nail(43,43)));
    } else {
      const mate = s.clear ? figure('musgrave','stand',50,68,1)
        : figure('musgrave','reach',62,39,1,hammer(62.1,39.1,a==='strike' && s.driven) + (s.driven ? '' : nail(62,39)));
      const alick = s.brace === 'stern' ? figure('player','reach',27,42,1)
        : s.brace === 'bow' || s.done ? figure('player','reach',76,35,-1)
        : figure('player','stand',s.clear ? 86.5 : 31,s.clear ? 61 : 66,s.clear ? -1 : 1);
      crew = mate + alick;
    }
    const head = s.driven ? '<ellipse cx="62.2" cy="39.9" rx=".8" ry=".52" fill="#3a342a" stroke="#c4b08f" stroke-width=".2"/>' : '';
    return wood + head + crew;
  }
  function roof(s, a) {
    if (!s.located || s.done) {
      const repair = s.done ? `<path d="M61 19.7q4.8 1.3 9.4 1.3l-.4 3q-4.9.15-9.2-1.4Z" fill="#92795b" stroke="#65513d" stroke-width=".26"/>
        ${line('M61.4 22.3q4.3 1.35 8.5 1.35','#cfb88e',.23,'stroke-dasharray=".44 .46"')}` : '';
      return tinGradient + tinAndStain(s.done) + repair;
    }
    if (!s.lap) return '';
    const top = s.lap === 'under' ? 'M24.7 26.4Q42 31 59.7 39.8' : 'M24 23.1q8 1.7 12.1 3.4t7.2 1.9 14.5 4.4';
    const patch = top + 'Q60.7 45.4 61.8 49t1.7 7.9l1.3 4 .5 3.7-.4 2.1 1.9 4.4-2.2 3.4q-4.4-.4-7.9-1.7t-6.2-1.3l-6.3-1.8-6.8-1.3-4.9-1.6-.6-2.3q-.2-2.7-1.5-6.7l-1.8-8.4-1.8-6.8Z';
    const stitch = (x, y, direction) => `<g transform="translate(${x} ${y}) scale(${direction} 1)">${line('M-.7 1q.7-2.8 3-3.6m-1.6 4.5q.6-2.3 2.9-3.2', '#3d3026', .95)}${line('M-.7 .8q.7-2.8 3-3.6m-1.6 4.5q.6-2.3 2.9-3.2', '#d7b885', .48)}</g>`;
    let water = '';
    if (a === 'pour' || s.done) {
      const d = s.done ? 'M27.5 27q5 7 8 14t8 16 5 15 6 11' : 'M28 28q8 5 11 13t8 12 6 15';
      water = line(d, '#b5d5d4', .8, 'class="fw-flow"');
    }
    return `<defs><clipPath id="fw-patch-edge"><path d="${patch}"/></clipPath></defs><g class="fw-place">
      <path d="${patch}" fill="url(#fw-hide)" stroke="#57422f" stroke-width=".5"/>
      <image href="assets/voyage/props/workshop.png" x="-11.3" y="-41" width="354" height="526" preserveAspectRatio="none" clip-path="url(#fw-patch-edge)" opacity=".82"/>
      <path d="${patch}" fill="#756141" opacity=".19"/>${line('M33 65q13.4 4.3 30 6.7', '#c7ae7c', .34, 'stroke-dasharray="1 .7"')}${s.left ? stitch(33, 66, 1) : ''}${s.right ? stitch(65, 72, -1) : ''}</g>${water}`;
  }
  function drill(s) {
    if (!s.tested) return '';
    let svg = line('M49.2 35.7q.8 5.8 8.8 7.1', '#ebd9ae', .65, 'class="fw-draw"');
    if (s.scratch) svg += line('M49 36.6q1.6 6.5 8.7 6.9', '#b8a58c', .33);
    if (s.edge) svg += line('M31.3 69.7q-.6 4 1.8 9l1.4-.7', '#e2d6bb', .7, 'class="fw-draw"');
    if (s.done) svg += line('M32.9 77.9l2-1.1', '#49392c', .48);
    return svg;
  }
  function hull(s) {
    if (!s.found) return '';
    const d = 'M39 55.6q7.2 1.9 13.1 1.65t11.6 1.1 8.8 1.2';
    let svg = line(d, '#332720', 1.6);
    if (s.fill) svg += rope(d, 'fw-place');
    if (s.fill > 1) svg += rope('M39.3 55.95q9.9 2.1 14.1 1.9t10.2 1.15 9.1 1.16');
    if (s.fill > 2) svg += rope('M43.3 56.7q7.9-2.3 11.8.2t10.1 1.8');
    if (s.done) svg += line(d, '#332c25', 1.6, 'class="fw-draw"') + line('M43.5 56.5q12 .7 17 1.8', '#978073', .28);
    return svg;
  }
  function rig(s) {
    if (!s.reeved) return '';
    let d;
    if (!s.lead) d = 'M48.3 31.6q7 5 3.4 17t-2.5 17';
    else {
      const eye = s.lead === 'port' ? [35, 76] : [76, 72];
      const belly = s.quiet && !s.done ? 8 : 0;
      d = `M48.4 31.5Q${(48 + eye[0]) / 2 + belly} 57 ${eye.join(' ')}q1.2 4.5 3 2.8Q49 86 60 91`;
    }
    return rope(d, !s.quiet && !s.done ? 'fw-tug' : 'fw-place') + (s.done ? rope('M35 75q-3.2 3.9 1.8 3.8t.5-3.5') : '');
  }
  // Simplified contours read from the 1865 sketch map in Musgrave (source A001).
  // The published sheet has north at the left. Both game sketches use north up.
  const aucklandCoast = 'M113 442 Q129 427 137 448 L158 459 144 439 151 421 167 436 153 407 159 392 184 406 174 387 190 379 221 396 238 378 254 387 244 367 275 388 273 369 281 357 302 370 316 359 319 338 336 351 350 349 364 364 366 341 379 325 391 330 401 350 393 371 406 372 415 356 432 355 448 342 464 343 452 336 453 316 445 327 426 326 410 318 399 302 413 282 437 276 461 273 473 254 481 247 480 229 492 208 514 206 539 218 550 237 546 218 518 201 516 179 510 169 520 151 516 134 525 108 543 91 554 94 560 110 584 119 601 109 611 81 608 66 621 64 631 69 640 50 654 54 678 68 695 75 705 93 739 117 757 136 753 151 750 180 729 197 701 229 681 242 658 247 649 259 621 255 Q595 252 594 277 Q590 297 617 303 L641 307 658 295 672 302 681 317 677 331 689 338 697 351 694 365 678 377 659 391 647 388 637 368 623 363 609 336 593 324 571 346 555 360 551 378 537 381 531 364 529 390 515 408 504 416 497 433 482 448 480 461 506 472 520 486 516 508 504 520 509 543 523 552 552 561 558 541 579 523 571 508 571 478 582 457 584 433 Q587 413 607 411 L620 411 630 423 620 447 606 461 603 485 604 510 598 527 603 544 632 550 665 559 682 560 678 574 660 578 624 556 653 573 676 578 686 558 662 545 637 539 620 533 625 516 652 526 665 515 644 500 646 477 668 476 647 464 650 451 659 441 668 449 659 430 671 432 684 448 694 434 707 431 710 412 723 398 730 409 719 425 733 420 744 433 737 446 754 453 771 455 774 472 779 504 777 527 783 551 779 580 794 597 806 604 803 631 817 644 808 656 790 658 799 672 834 692 856 681 872 710 871 732 891 751 884 764 Q856 761 817 731 L780 706 747 692 741 674 709 690 682 673 673 656 650 660 626 662 599 653 589 628 568 621 543 630 511 632 479 622 465 605 458 581 430 583 420 597 407 587 413 581 389 573 365 565 337 566 324 550 311 551 306 562 286 548 269 547 255 536 247 516 220 521 207 513 177 512 162 492 146 484 133 471Z';
  const adamsCoast = 'M822 143 Q835 118 850 123 L863 136 868 151 873 137 886 149 898 145 909 164 916 203 920 218 934 233 934 251 941 267 938 298 950 319 946 345 952 376 946 407 958 435 947 454 941 472 957 500 966 526 955 561 946 575 949 603 961 626 945 641 959 660 963 691 977 721 968 736 949 744 924 741 907 751 888 729 891 707 880 693 891 681 887 658 867 634 842 622 828 602 824 576 822 547 829 517 848 485 841 467 818 452 820 422 834 412 848 404 827 393 824 367 803 370 792 361 763 366 755 352 778 335 792 332 785 311 795 269 801 241 816 213 818 185Z';
  function surveySketch(cx,top,scaleX,scaleY){
    return `<g transform="translate(${cx} ${top}) matrix(0 ${scaleY} ${-scaleX} 0 0 0)" stroke="#685f4d" stroke-width="9" stroke-linejoin="round" fill="#a79d80" fill-opacity=".62"><path d="${aucklandCoast}"/><path d="${adamsCoast}"/></g>`;
  }
  function chart(s) {
    const shore = (d) => `<path d="${d}" fill="#a3a487" stroke="#696c58" stroke-width=".45"/>`;
    const pin = (x, y) => `<ellipse cx="${x}" cy="${y}" rx=".91" ry="1.36" fill="#603f2e" stroke="#eee0bb" stroke-width=".32"/>`;
    const stewart = 'M66.9 27.7l1.4 1 .4 2.4 1.7-.1-.8 1.7 1.3 1.4-1.9.6.8 1.2-2 1.2-1.3-.7-1.6 1.4-2.5-.6.8-1.7-1.4-.8 1.7-2.1.4-2 1.1-.6Z';
    const label = (x, y, value) => `<text x="${x}" y="${y}" text-anchor="middle" fill="#413a2c" font-family="Georgia,serif" font-style="italic" font-size="2.45">${value}</text>`;
    let svg = `<path d="M22 24H80V80H22Z" fill="url(#fw-soundings)"/>${shore(stewart)}${surveySketch(42.4,58.6,.0112,.018)}${label(64, 24.8, 'Stewart I.')}${label(30, 79.1, 'Auckland Is.')}${line('M76 57v-11m-1.5 3.5L76 46l1.5 3.5','#625540',.38)}${label(76,44,'N')}`;
    // An original diagram in the blank margin communicates the approach before any pins are placed.
    const sketch = 'M63 58q8 .7 15-.2l-.6 17.7-14.9.5Z';
    svg += `<path d="${sketch}" fill="#cbbc98" opacity=".65" stroke="#897954" stroke-width=".24"/>
      ${surveySketch(71.4,62.2,.0063,.0125)}
      ${line('M75 64q-1.1 2.3-2 4.8t-3.6 2.9','#975c41',.42,'stroke-dasharray=".65 .38"')}
      ${line('M69.6 70.1l-.98 1.38 1.45-.32','#81523e',.32)}
      ${label(70.2,61.2,'Coast sketch')}`;
    if (s.origin) svg += pin(68, 33);
    if (s.via) {
      const v = s.via === 'east' ? [54, 56] : [25, 55];
      const endpoint = s.end === 'inlet' ? [39, 73] : [38, 62];
      const route = `M68 33L${v.join(' ')}${s.end ? 'L' + endpoint.join(' ') : ''}`;
      svg += line(route, s.done ? '#3f5948' : '#8e533c', .55, 'class="fw-draw"') + pin(...v);
    }
    if (s.end) svg += pin(s.end === 'inlet' ? 39 : 38, s.end === 'inlet' ? 73 : 62);
    return svg;
  }
  function landing(s, a) {
    if (!s.fast) return '';
    const sag = [55, 68, 83][s.slack] + (a === 'crest' ? 3 : a === 'trough' ? -3 : 0);
    const d = `M34.4 82q5.7 2.7 11.6-1.4t8-2.6Q68 ${sag} 79.3 34.6q2-1.5 4.7-1.2`;
    let svg = rope(d, 'fw-place') + rope('M78.1 33.7q3 2.2 6.8-.1m-6.5 1.4q2.4 1.8 6.3-.2');
    if (a === 'crest' || a === 'trough' || s.done) {
      const y = a === 'trough' ? 65 : 58;
      svg += line(`M60 ${y}q3-1.2 5.8.1t6.2-.2m1.7.3 2.7-.4`, '#d5d8bd', .43, 'class="fw-wake"');
    }
    return svg;
  }
  const painters = {chest, roof, drill, fastening, hull, rig, chart, landing};
  const artFor = (id, state, action) => defs + painters[id](state, action);

  // The same work can be done by laying the line or pencil across the plate.
  // Both endpoints are judged against the painted material in its own aspect ratio.
  function dragPlan(id,s) {
    if(s.done)return null;
    if(id==='rig')return s.reeved
      ? {start:[48,31], targets:['port','other'], rope:true}
      : {start:[60,91], targets:['clew'], rope:true};
    if(id==='landing'&&!s.fast)return {start:[33,81], targets:['high','low'], rope:true};
    if(id==='chart'&&s.origin&&!s.via)return {start:[68,33], targets:['west','east']};
    if(id==='chart'&&s.via&&!s.end)return {start:s.via==='east'?[54,56]:[25,55], targets:['north','inlet']};
    return null;
  }
  function bindDrawing(d) {
    const board=d.querySelector('.fw-board'), trace=d.querySelector('.fw-trace');
    let drag=null, skipClick=false;
    const local=e=>{const r=board.getBoundingClientRect();return [(e.clientX-r.left)*100/r.width,(e.clientY-r.top)*100/r.height];};
    const separation=(a,b)=>Math.hypot(a[0]-b[0],(a[1]-b[1])*2/3);
    function clear(){
      if(drag&&board.hasPointerCapture?.(drag.pointer))board.releasePointerCapture(drag.pointer);
      drag=null;trace.innerHTML='';
    }
    board.addEventListener('pointerdown',e=>{
      skipClick=false;if(!active||e.isPrimary===false||e.button>0)return;
      const plan=dragPlan(active.id,active.state),p=local(e);
      if(plan&&separation(plan.start,p)<6)drag={plan,pointer:e.pointerId,moved:false,context:active};
    });
    board.addEventListener('pointermove',e=>{
      if(!drag||drag.pointer!==e.pointerId||drag.context!==active)return;
      const p=local(e);if(!drag.moved&&separation(drag.plan.start,p)<1.3)return;
      if(!drag.moved){drag.moved=true;board.setPointerCapture?.(e.pointerId);}
      const [x,y]=drag.plan.start,[px,py]=p;
      const curve=`M${x} ${y} Q${(x+px)/2} ${(y+py)/2+(drag.plan.rope?6:0)} ${px} ${py}`;
      trace.innerHTML=drag.plan.rope?rope(curve):line(curve,'#86533c',.48,'stroke-dasharray="1.6 .6"');
      e.preventDefault();
    });
    board.addEventListener('pointerup',e=>{
      if(!drag||drag.pointer!==e.pointerId)return;
      const {plan,moved,context}=drag,p=local(e);clear();if(!moved||context!==active)return;
      e.preventDefault();skipClick=true;
      const actions=model.view(active.id,active.state).actions.filter(a=>plan.targets.includes(a.id));
      const ranked=actions.map(a=>({a,distance:separation(p,[a.x,a.y])})).sort((a,b)=>a.distance-b.distance);
      if(ranked[0]?.distance<7)play(d,ranked[0].a.id,true);
    });
    board.addEventListener('pointercancel',clear);
    d.addEventListener('close',clear);
    return e=>{const ignore=skipClick&&e.detail>0&&board.contains(e.target);skipClick=false;return ignore;};
  }
  function mount() {
    const d = document.getElementById('workbench');
    if (!d) return null;
    if (d.querySelector('.fw-sheet')) return d;
    d.setAttribute('aria-labelledby', 'fw-title');
    d.setAttribute('aria-describedby', 'fw-description');
    d.innerHTML = `<div class="fw-sheet">
      <header class="fw-top"><div><p class="fw-place-name"></p><h2 id="fw-title" tabindex="-1"></h2></div><button type="button" class="fw-close" data-fw-close aria-label="Stand back from the work">Stand back <span aria-hidden="true">×</span></button></header>
      <div class="fw-body"><div class="fw-board"><img class="fw-plate" alt="" width="1536" height="1024">
        <div class="fw-lid-surface" aria-hidden="true"></div><svg class="fw-drawing" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
        <svg class="fw-trace" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg><div class="fw-points"></div></div>
        <div class="fw-notes"><h3 class="fw-question"></h3><p id="fw-description"></p><div class="fw-end"></div>
          <p class="fw-feedback" role="status" aria-live="polite" aria-atomic="true"></p>
          <button type="button" class="fw-sound" data-fw-sound aria-label="Mute drip sound"></button><div class="fw-help"><button type="button" data-fw-hint></button><p class="fw-hint-text" aria-live="polite"></p></div><details class="fw-controls"><summary>Working controls</summary><div class="fw-actions"></div></details>
        </div></div></div>`;
    const afterDrag=bindDrawing(d);
    d.addEventListener('click', e => {
      if (!active||afterDrag(e)) return;
      const b = e.target.closest('button');
      if (!b || !d.contains(b)) return;
      if (b.hasAttribute('data-fw-close')) leave(false);
      else if (b.hasAttribute('data-fw-sound')) {
        muted = !muted;
        if (muted) quiet();
        try { localStorage.setItem(muteKey, String(muted)); } catch (_) { /* Session setting. */ }
        soundControl(d);
      } else if (b.hasAttribute('data-fw-finish')) leave(true);
      else if (b.hasAttribute('data-fw-hint')) {
        active.hints = Math.min(3, active.hints + 1);
        save(active);
        hintText(d);
      } else if (b.dataset.fwAction || b.dataset.fwPoint) play(d, b.dataset.fwAction || b.dataset.fwPoint, b.hasAttribute('data-fw-point'));
    });
    d.addEventListener('cancel', e => { e.preventDefault(); leave(false); });
    d.addEventListener('close', () => { if (active && !d.open) leave(false); });
    return d;
  }
  // Move in the same six painted walk frames as the room. The destination remains
  // clickable throughout; another instruction starts at the figure's visible foot.
  function walkCrew(d, previous) {
    const motion = root.CastawayMotion;
    const reduced = () => document.body.classList.contains('reduced') || root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!motion || !document.createElementNS || reduced()) return;
    const ns = 'http://www.w3.org/2000/svg';
    for (const figure of d.querySelectorAll('[data-fw-actor]')) {
      const id = figure.dataset.fwActor, start = previous.get(id);
      if (!start) continue;
      const end = [Number(figure.dataset.footX), Number(figure.dataset.footY)];
      const dx=end[0]-start[0], dy=end[1]-start[1], distance=Math.hypot(dx*1.5,dy);
      if (distance < 5) continue;
      const walking = document.createElementNS(ns,'g'), body = document.createElementNS(ns,'svg');
      const ink = document.createElementNS(ns,'image'), atlas=motion.WALKS[id];
      const [cx,cy,w,h]=atlas.commoncrop, [gx,gy]=atlas.groundanchor, sy=48/(gy-cy-8), sx=sy*2/3;
      body.setAttribute('x',String((cx-gx)*sx)); body.setAttribute('y',String((cy-gy)*sy));
      // Nested SVG lengths are in workplate units. Override the shared dialog icon size.
      body.style.width=(w*sx)+'px'; body.style.height=(h*sy)+'px';
      body.setAttribute('preserveAspectRatio','none'); body.setAttribute('overflow','hidden');
      ink.setAttribute('href',atlas.file); ink.setAttribute('width',atlas.width); ink.setAttribute('height',atlas.height);
      body.append(ink); walking.append(body); figure.after(walking);
      figure.style.visibility='hidden';
      const duration=Math.min(1500,290+distance*12), face=dx<0 ? -1 : 1;
      let elapsed=0, lastFrame=performance.now(), visibility=visibilityChange;
      function frame(now) {
        if (!figure.isConnected || !d.open) return;
        if (!document.hidden && visibility===visibilityChange) elapsed+=Math.max(0,now-lastFrame);
        lastFrame=now;
        visibility=visibilityChange;
        const t=reduced() ? 1 : Math.min(1,elapsed/duration), ease=t*t*(3-2*t);
        if (t>=1) { walking.remove(); figure.style.visibility=''; figure.dataset.footX=end[0]; figure.dataset.footY=end[1]; return; }
        const x=start[0]+dx*ease, y=start[1]+dy*ease;
        figure.dataset.footX=x; figure.dataset.footY=y;
        walking.setAttribute('transform',`translate(${x} ${y}) scale(${face} 1)`);
        body.setAttribute('viewBox',motion.frameBox(id,motion.frameIndex(distance*ease/48)).join(' '));
        root.requestAnimationFrame(frame);
      }
      frame(lastFrame);
    }
  }
  function soundControl(d) {
    const control = d.querySelector('[data-fw-sound]');
    control.hidden = !(active.id === 'roof' && !active.state.located);
    control.textContent = muted ? 'Drip sound muted' : 'Drip sound on';
    control.setAttribute('aria-pressed', String(muted));
  }
  function hintText(d) {
    const h = active.hints;
    const hint = d.querySelector('[data-fw-hint]');
    hint.textContent = h === 0 ? 'Look for a clue' : h < 3 ? 'Another clue · ' + h + '/3' : 'All three clues shown';
    hint.setAttribute('aria-disabled', String(h === 3));
    const puzzle = model.puzzles[active.id];
    const hints = active.id === 'roof' && !active.state.located ? puzzle.surveyHints : puzzle.hints;
    d.querySelector('.fw-hint-text').textContent = h ? hints[h - 1] : '';
    d.querySelector('.fw-help').hidden = active.state.done;
  }
  function draw(d, action) {
    const {id, state, feedback} = active, p = model.puzzles[id];
    const surveyEnd = active.survey && state.located;
    const v = surveyEnd ? {question: 'The seam above the bunk', actions: []} : model.view(id, state);
    d.dataset.fwPuzzle = id;
    d.dataset.fwDone = String(state.done);
    d.dataset.drawable = String(Boolean(dragPlan(id,state)));
    d.querySelector('.fw-place-name').textContent = p.place;
    d.querySelector('#fw-title').textContent = id === 'roof' && state.located && !surveyEnd ? (state.done ? 'Under the repaired roof' : 'The leaking lap') : p.title;
    d.querySelector('#fw-description').textContent = surveyEnd
      ? 'Bring the stitched hide to the leak when you are ready to work.'
      : id === 'roof' && state.located ? (state.done ? 'Alick steps back from the mended lap to watch the next shower.' : p.patchDescription)
      : id === 'fastening' ? fasteningDescription(state) : p.description;
    d.querySelector('.fw-question').textContent = v.question;
    const plate=d.querySelector('.fw-plate');
    const plateFile = surveyEnd ? sceneAsset('cabin.webp') : fileFor(id,state);
    if (plate.getAttribute('src') !== plateFile) plate.setAttribute('src',plateFile);
    const previousFeet = new Map();
    if (id === 'fastening' && action) for (const actor of d.querySelectorAll('[data-fw-actor]')) {
      previousFeet.set(actor.dataset.fwActor, [Number(actor.dataset.footX),Number(actor.dataset.footY)]);
    }
    d.querySelector('.fw-drawing').innerHTML = surveyEnd ? tinGradient + tinAndStain(false) : artFor(id, state, action);
    if (previousFeet.size) walkCrew(d, previousFeet);
    d.querySelector('.fw-points').innerHTML = v.actions.map(a =>
      `<button type="button" class="fw-point" data-fw-point="${a.id}" aria-label="${a.label}" style="left:${a.x}%;top:${a.y}%" ${a.selected === undefined ? '' : 'aria-pressed="' + a.selected + '"'}><span aria-hidden="true"></span></button>`).join('');
    d.querySelector('.fw-actions').innerHTML = v.actions.map(a =>
      `<button type="button" data-fw-action="${a.id}" ${a.selected === undefined ? '' : 'aria-pressed="' + a.selected + '"'}>${a.label}</button>`).join('');
    d.querySelector('.fw-end').innerHTML = state.done ? '<button type="button" class="fw-finish" data-fw-finish>Return to the scene <span aria-hidden="true">→</span></button>' : '';
    if (surveyEnd) d.querySelector('.fw-end').innerHTML = '<button type="button" class="fw-finish" data-fw-close>Back to the house <span aria-hidden="true">→</span></button>';
    d.querySelector('.fw-controls').hidden = state.done || surveyEnd;
    const status = d.querySelector('.fw-feedback');
    status.hidden = !feedback;
    status.textContent = feedback;
    hintText(d);
    if (surveyEnd) d.querySelector('.fw-help').hidden = true;
    soundControl(d);
  }
  function play(d, action, fromPlate) {
    const session = active, outcome = model.step(session.id, session.state, action);
    if (session.id === 'roof' && action === 'listen') listen();
    if (session.id === 'roof' && !session.state.located && outcome.state.located) {
      quiet();
      session.hints = 0;
    }
    session.trail = remember(session, action, outcome.state);
    session.state = outcome.state;
    session.feedback = outcome.feedback;
    save(session);
    draw(d, action);
    const attr = fromPlate ? 'data-fw-point' : 'data-fw-action';
    const next = d.querySelector('[' + attr + '="' + action + '"]') || d.querySelector('[' + attr + ']') || d.querySelector('[data-fw-finish]') || d.querySelector('.fw-end')?.querySelector('[data-fw-close]');
    next?.focus({preventScroll: true});
  }
  function leave(commit) {
    if (!active) return;
    const old = active, d = document.getElementById('workbench');
    active = null;
    quiet();
    if (d.open) d.close();
    if (commit && old.state.done) {
      old.callbacks.complete?.();
      remove(old.id);
    } else old.callbacks.close?.();
  }
  function open(id, callbacks = {}) {
    if (!model?.puzzles[id] || active) return false;
    const d = mount();
    if (!d) return false;
    active = {id, callbacks, survey: Boolean(callbacks.survey), ...read(id)};
    if (active.survey && active.state.located) active.feedback = 'A drop gathers above the pan at the seam you traced.';
    d.querySelector('.fw-controls').open = false;
    draw(d, '');
    d.showModal();
    d.querySelector('#fw-title').focus({preventScroll: true});
    return true;
  }
  function reset() {
    if (active) leave(false);
    for (const id of Object.keys(model.puzzles)) remove(id);
  }
  root.CastawayBench = {open, surveyRoof: () => open('roof', {survey:true}), cabinTraces, prepareForItem, shown: () => Boolean(active), reset};
})(globalThis);
