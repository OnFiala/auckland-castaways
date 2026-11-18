/* Alick puts down the sewing roll in July. Musgrave can find its trace in August. */
(function (root) {
  'use strict';
  const art = 'assets/voyage/promise/';
  const places = {
    peg: {
      x: 20, y: 32, name: 'Wooden peg',
      placed: 'George · I can reach that on my way out. Thank you, Alick.',
      untouched: 'The wood is pale where a loop once rubbed it. There is nothing hanging here.',
      found: 'George · See that blue stripe, Captain? Our roll split at the fold. I stitched the patch on and hung it back up.'
    },
    board: {
      x: 84, y: 49, name: 'Loose shelf board',
      placed: 'Henry · It will keep dry under there. Either of us can find it.',
      untouched: 'A little dust stirs beneath the board. The grain is smooth all the way back.',
      found: 'Henry · I cut the patch square and turned the edges under. It took the last of the thread. Here, feel the hem.'
    }
  };
  let session = null;
  const el = id => document.getElementById(id);

  function open(options) {
    const dialog = el('repair-roll');
    if (!dialog || dialog.open) return;
    const returning = options.phase === 'return';
    let place = options.place || null;
    let seen = Boolean(options.seen);
    let folded = Boolean(place);
    const previousFocus = document.activeElement;
    session = options;
    dialog.innerHTML = '<section class="roll-frame">' +
      '<header class="roll-header"><div><small>Epigwaitt · ' + (returning ? 'August' : 'July') +
      ' 1865</small><h2 id="roll-title">' + (returning ? 'Where Alick left it' : 'For the two who stay') +
      '</h2></div><button type="button" data-roll-close aria-label="Back to the scene">×</button></header>' +
      '<div class="roll-paint"><img class="roll-background" alt=""><img class="roll-object" src="' + art +
      'roll.webp" alt="" hidden>' + (returning ? '' :
        '<button type="button" class="roll-spot roll-fold" data-roll-fold aria-label="Fold the sewing things into the cloth"><span>Fold the cloth</span></button>') +
      Object.entries(places).map(([key,p]) =>
        '<button type="button" class="roll-spot" data-roll-spot="' + key + '" style="left:' + p.x + '%;top:' + p.y +
        '%" aria-label="' + (returning ? 'Look at ' : 'Leave the roll at ') + p.name.toLowerCase() +
        '"><span>' + p.name + '</span></button>').join('') + '</div>' +
      '<footer class="roll-footer"><p aria-live="polite" id="roll-line"></p>' +
      '<button type="button" data-roll-leave>' + (returning ? 'Step back' : 'Go to the boat') + '</button></footer></section>';
    const picture = dialog.querySelector('.roll-background');
    const bundle = dialog.querySelector('.roll-object');
    const leave = dialog.querySelector('[data-roll-leave]');
    const fold = dialog.querySelector('[data-roll-fold]');
    const returnArt = () => art + 'return-' + place + '.webp';
    function draw() {
      picture.src = returning ? returnArt() : art + (folded ? 'bench-cleared.webp' : 'bench.webp');
      picture.alt = returning
        ? 'Daylight across the sewing bench, with the wooden peg at the left and a loose board at the right.'
        : 'A sewing bench. A peg sticks out on the left, and a loose shelf board makes a dry nook on the right.';
      bundle.hidden = returning || !folded;
      if (!bundle.hidden) {
        bundle.dataset.place = place || 'table';
        bundle.style.left = (place === 'peg' ? 20 : place === 'board' ? 83 : 49) + '%';
        bundle.style.top = (place === 'peg' ? 32 : place === 'board' ? 52 : 73) + '%';
      }
      if(fold)fold.hidden=folded;
      leave.hidden = !returning && !place;
      for (const button of dialog.querySelectorAll('[data-roll-spot]')) {
        if (!returning) button.setAttribute('aria-pressed',String(button.dataset.rollSpot === place));
        if (returning && place === 'peg' && button.dataset.rollSpot === 'peg') {
          button.style.left='21%';button.style.top='44%';button.style.height='33%';
        }
      }
    }
    function say(message) { el('roll-line').textContent = message; }
    if(fold)fold.onclick=()=>{
      folded=true;draw();
      say('Alick · Thread round the cloth, and the needle tucked inside. Now, where will you keep it?');
      dialog.querySelector('[data-roll-spot]').focus();
    };
    for (const button of dialog.querySelectorAll('[data-roll-spot]')) {
      button.onclick = () => {
        const key = button.dataset.rollSpot;
        if (returning) {
          if (key !== place) { say(places[key].untouched); return; }
          if (!seen) { options.discover(key); seen = true; }
          say(places[key].found); return;
        }
        if (place !== key) options.store(key);
        place = key;folded=true;
        draw();
        say(places[key].placed);
      };
    }
    dialog.querySelector('[data-roll-close]').onclick = () => dialog.close();
    leave.onclick = () => {
      if (!returning && !place) return;
      dialog.close();
      if (!returning) options.depart();
    };
    dialog.onclose = () => {
      if (session !== options) return;
      session = null;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
    draw();
    say(returning
      ? (seen ? places[place].found : 'Musgrave · One of them has been sewing here. What have they made?')
      : (place ? places[place].placed : 'Alick · A needle, thread and a piece of our spare cloth. Where shall I leave them for you?'));
    dialog.showModal();
    dialog.querySelector('[data-roll-close]').focus();
  }
  root.CastawayRepairRoll = {open, shown: () => Boolean(el('repair-roll')?.open)};
})(typeof window === 'undefined' ? globalThis : window);
