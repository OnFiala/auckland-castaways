/* Reveal the movie controls on interaction; keep the picture clear while watching. */
(function () {
  'use strict';
  const dialog = document.getElementById('story-film');
  if (!dialog) return;
  const playingFilm = () => dialog.open && dialog.dataset.mode === 'movie';
  let timer;
  let wakingPointer = false;

  function hide() {
    clearTimeout(timer);
    delete dialog.dataset.controls;
  }
  function show() {
    if (!playingFilm()) return;
    dialog.dataset.controls = 'shown';
    clearTimeout(timer);
    timer = setTimeout(hide, 3200);
  }

  dialog.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch') show();
  }, {passive:true});
  dialog.addEventListener('pointerdown', event => {
    if (!playingFilm()) return;
    const button = event.target.closest('button');
    // A touch can start on the picture and deliver its later click to a
    // freshly revealed control at that same position.
    wakingPointer = !dialog.dataset.controls && (!button || getComputedStyle(button).opacity === '0');
    show();
  }, {passive:true});
  dialog.addEventListener('click', event => {
    if (event.detail && wakingPointer && event.target.closest('button')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.getElementById('film-picture').focus({preventScroll:true});
    }
    wakingPointer = false;
  }, true);
  dialog.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') hide();
  });
  dialog.addEventListener('keydown', event => {
    if (!playingFilm()) return;
    show();
    if (event.code === 'Space' && !event.target.closest('button')) {
      event.preventDefault();
      if (!event.repeat) document.getElementById('film-pause').click();
    }
  });
  dialog.addEventListener('close', hide);
})();
