/* Optional reading table after the Grafton campaign. No campaign save mutations. */
(() => {
  'use strict';

  const art = 'assets/epilogue/';
  const book = 'https://en.wikisource.org/wiki/Castaway_on_the_Auckland_Isles/';
  const slips = {
    matches: {image: 'matches', title: 'The steward’s matches', note: 'The steward had kept a box dry enough to light a fire. Nineteen people shared the biscuit and pork found the next morning.', place: 'dalgarno'},
    boat: {image: 'skin-boat', title: 'A boat for two', note: 'They dried seal skins for shoes and leggings, then made a skin boat. In fine weather two men could cross to look for food.', place: 'smith'},
    slope: {image: 'slope', title: 'A mark on the slope', note: 'Flying Scud is coming back for Henry and George. From offshore, Musgrave thinks he may see smoke.', place: 'august'},
    wreck: {image: 'wreck', title: 'Timber on the rocks', note: 'Invercauld breaks up on a May night. Grafton’s five have already spent several months ashore.', place: 'wreckMay'},
    rescue: {image: 'julian', title: 'A ship seeking repairs', note: 'Julian puts in with a leak. Three men come aboard after a year on the island. The accounts disagree about the day in May.', place: 'rescueMay'}
  };
  const places = {
    dalgarno: {label: 'George Dalgarno', head: 'Captain · to the owners', clue: 'He counts the scant food the surf gave back and remembers who carried fire ashore.', stamp: 'Letter to the owners'},
    smith: {label: 'Andrew Smith', head: 'First mate · to his wife', clue: 'He tells her how they fashioned clothes and a way across the water from the same material.', stamp: 'Letter to his wife'},
    wreckMay: {label: 'May 1864', head: 'Northern coast', clue: 'Grafton’s first winter is approaching.', stamp: '10 May · Invercauld'},
    rescueMay: {label: 'May 1865', head: 'Northern islands', clue: 'The second May since Grafton struck.', stamp: 'May · Julian'},
    august: {label: 'August 1865', head: 'Return voyage', clue: 'Musgrave is aboard Flying Scud.', stamp: '23 August · Musgrave'}
  };
  const leaves = {
    letters: {items: ['matches', 'boat'], slots: ['dalgarno', 'smith'], title: 'Two letters from one wreck', instruction: 'Choose an illustrated slip, then place it with the letter that describes it.'},
    dates: {items: ['slope', 'wreck', 'rescue'], slots: ['wreckMay', 'rescueMay', 'august'], title: 'A year between two Mays', instruction: 'Choose a slip, then file it under the month when it happened.'}
  };

  let dialog, opener, page, selected, placed, message;
  function reset() {
    page = 'letters';
    selected = null;
    placed = new Set();
    message = '';
    if (dialog?.open) {
      render();
      focusTitle();
    }
  }
  reset();
  function picture(name) {
    return '<img alt="" draggable="false" src="' + art + name + '.webp">';
  }
  function mount() {
    dialog = document.createElement('dialog');
    dialog.id = 'witness-archive';
    dialog.setAttribute('aria-labelledby', 'ep-title');
    dialog.innerHTML = `
      <div class="ep-desk">
        <header class="ep-mast"><span>Until We Return <i>/</i> Epilogue</span><button type="button" data-ep-close>Back to the ending</button></header>
        <div class="ep-spread">
          <aside class="ep-chart">
            <h2>The Invercauld papers</h2>
            <p>On 10 May 1864, another ship struck Auckland Island. Neither crew knew the other was there.</p>
            <figure><img src="${art}islands-1865.webp" alt="Sketch map published with Musgrave’s account. The northern islands and Carnley Harbour appear on the same sheet."><figcaption>Sketch Map of the Auckland Isles, 1865<br>Published with Musgrave’s journal, 1866</figcaption></figure>
          </aside>
          <section class="ep-work"><div class="ep-content"></div><p class="ep-status" role="status" aria-live="polite" aria-atomic="true"></p></section>
        </div>
      </div>`;
    document.body.appendChild(dialog);
    dialog.addEventListener('click', handleClick);
    dialog.addEventListener('keydown', event => event.stopPropagation());
    dialog.addEventListener('close', () => {
      if (opener && opener.isConnected) opener.focus();
    });
  }
  function open() {
    if (!dialog) mount();
    if (dialog.open) return;
    opener = document.activeElement;
    render();
    dialog.showModal();
    focusTitle();
  }
  function focusTitle() {
    dialog.querySelector('#ep-title').focus();
    dialog.scrollTop = 0;
  }
  function title(text) { return '<h2 id="ep-title" tabindex="-1">' + text + '</h2>'; }
  function tab(label, attr) { return '<button type="button" class="ep-turn" ' + attr + '>' + label + '</button>'; }
  function allFiled() { return leaves[page].items.every(id => placed.has(id)); }
  function setMessage(text) {
    message = text;
    dialog.querySelector('.ep-status').textContent = text;
  }
  function printSlip(id) {
    const slip = slips[id];
    if (placed.has(id)) {
      return '<div class="ep-slip-space" aria-hidden="true">Filed</div>';
    }
    return `<button type="button" class="ep-slip" data-ep-slip="${id}" aria-pressed="${selected === id}">
      ${picture(slip.image)}<strong>${slip.title}</strong></button>`;
  }
  function printPocket(id) {
    const p = places[id], filed = leaves[page].items.find(s => placed.has(s) && slips[s].place === id);
    if (filed) {
      return `<article class="ep-pocket ep-filed"><small>${p.head}</small><h3>${p.label}</h3>
        <div class="ep-filed-insert">${picture(slips[filed].image)}<b>${slips[filed].title}</b></div>
        <span class="ep-stamp">${p.stamp}</span><details class="ep-reread"><summary>Read filed slip</summary><p>${slips[filed].note}</p></details></article>`;
    }
    return `<button type="button" class="ep-pocket" data-ep-place="${id}">
      <small>${p.head}</small><strong>${p.label}</strong><span>${p.clue}</span>
      <i>${selected ? 'Place slip here' : 'File a slip here'}</i></button>`;
  }
  function puzzle() {
    const leaf = leaves[page];
    const note = selected ? slips[selected].note : allFiled() ? 'The slips are filed. You can read them again below.' : leaf.instruction;
    let next = '';
    if (allFiled()) {
      next = page === 'letters' ? tab('Unfold the calendar →', 'data-ep-page="dates"') :
        tab('Examine the chart entry →', 'data-ep-page="mark"');
    }
    return `<div class="ep-leaf ep-${page}">${title(leaf.title)}
      <p class="ep-intro">${page === 'letters' ? 'After their rescue, the captain wrote to the ship’s owners. The mate wrote home to his wife. The illustrated slips retell a detail from each letter.' : 'The northern wreck, the rescue and Musgrave’s return appear together in print. Put a year beside each May before you read the last entry.'}</p>
      <div class="ep-items" aria-label="Illustrated slips">${leaf.items.map(printSlip).join('')}</div>
      <p class="ep-note">${note}</p>
      <div class="ep-pockets" aria-label="Filing pockets">${leaf.slots.map(printPocket).join('')}</div>
      ${next}
      </div>`;
  }
  function mark() {
    return `<div class="ep-leaf ep-mark">${title('The mark on the chart')}
      <figure class="ep-chart-crop"><img src="${art}chart-detail.webp" alt="Detail of the original printed chart. An asterisk by the eastern shore is labelled Smoke seen."><figcaption>Detail from the 1866 plate</figcaption></figure>
      <p>On 23 August, Captain Cross felt sure he saw smoke. Musgrave, on the same deck, was uncertain. In his next entry, Musgrave says Henry and George had stayed off the mountains since he left.</p>
      <p>The Melbourne Illustrated Post of 25 October 1865 attributed the smoke to Invercauld’s camp. Musgrave’s publishers reprinted the report in 1866. The three known survivors had already left aboard Julian in May 1865.</p>
      <fieldset class="ep-annotations"><legend>Which note belongs beside the printed mark?</legend>
      <button type="button" data-ep-finding="camp">Signal from Invercauld</button>
      <button type="button" data-ep-finding="unresolved">Possible smoke · origin unknown</button>
      <button type="button" data-ep-finding="fire">Fire lit by Henry and George</button></fieldset></div>`;
  }
  function conclusion() {
    return `<div class="ep-leaf ep-coda">${title('The letter that got home')}
      <p class="ep-last-mark">23 August 1865 · Possible smoke · Origin unknown</p>
      <div class="ep-pen">${picture('ink')}</div>
      <p>When Andrew Smith went looking for shellfish, he often thought of his wife and their children. We know because he lived to write to her.</p>
      <p>Julian carried <strong>George Dalgarno, Andrew Smith and Robert Holding</strong> to Callao. Of the twenty-five aboard Invercauld, nineteen reached shore. Those three alone returned from the island alive.</p>
      <p>On the southern shore, Grafton’s five could go back to their wreck for tools and a boat. In the north the ship came apart in minutes. Smith’s little skin boat took two men at a time, and only when the weather held.</p>
      <p>The two crews spent a winter on the same island without knowing each other. Even Henry and George, waiting together in the south, came close to parting. The crews meet only here, where their papers have reached the same table.</p>
      <details class="ep-sources"><summary>Read the witnesses</summary>
      <p>Each slip is a new summary. The object drawings are modern illustrations. The chart is reproduced from the published journal.</p>
      <ul><li><a href="${book}Appendix_3" target="_blank" rel="noopener noreferrer">Dalgarno’s letter and “Note by the Publishers” · newspaper reprint, pp. 173–174 ↗</a></li>
      <li><a href="https://paperspast.natlib.govt.nz/newspapers/ODT18651021.2.18" target="_blank" rel="noopener noreferrer">Smith’s letter to his wife · Otago Daily Times, 21 October 1865 ↗</a></li>
      <li><a href="${book}Chapter_10" target="_blank" rel="noopener noreferrer">Musgrave aboard Flying Scud · journal, 23 August ↗</a></li>
      <li><a href="https://archive.org/details/castawayonauckla01musg/page/117/mode/1up" target="_blank" rel="noopener noreferrer">Musgrave speaks to Henry and George · 24 August ↗</a></li>
      <li><a href="${art}islands-1865.webp" target="_blank" rel="noopener noreferrer">The printed sketch map · London edition, 1866 ↗</a></li></ul></details>
      <div class="ep-actions">${tab('Back to the ending', 'data-ep-close')}${tab('Refile the papers', 'data-ep-reset')}</div></div>`;
  }
  function render() {
    const html = page === 'mark' ? mark() : page === 'conclusion' ? conclusion() : puzzle();
    dialog.querySelector('.ep-content').innerHTML = html;
    dialog.querySelector('.ep-status').textContent = message;
  }
  function goTo(next) {
    selected = null;
    message = '';
    page = next;
    render();
    focusTitle();
  }
  function selectSlip(id) {
    selected = id;
    message = 'Selected ' + slips[id].title + '. ' + slips[id].note + ' Choose its filing pocket.';
    render();
    dialog.querySelector('[data-ep-place]').focus();
  }
  function fileAt(id) {
    if (!selected) {
      setMessage('Choose one of the illustrated slips first.');
      dialog.querySelector('[data-ep-slip]').focus();
      return;
    }
    if (slips[selected].place !== id) {
      setMessage(page === 'letters' ?
        (selected === 'matches' ? 'Read the captain’s account of the first morning ashore.' : 'The mate wrote home about clothes and a way across the water.') :
        (selected === 'wreck' ? 'The wreck came a year before Julian found the survivors.' : selected === 'rescue' ? 'Julian arrived a year after the wreck and before Flying Scud returned.' : 'Look for the month when Musgrave was returning for his two companions.'));
      return;
    }
    const slip = slips[selected];
    placed.add(selected);
    selected = null;
    message = slip.title + ' filed with ' + places[id].label + '.';
    if (allFiled()) message += page === 'letters' ? ' Both letters are ready to read together.' : ' The three events are in order.';
    render();
    dialog.querySelector(allFiled() ? '[data-ep-page]' : '[data-ep-slip]').focus();
  }
  function handleClick(e) {
    const b = e.target.closest('button');
    if (!b || !dialog.contains(b)) return;
    if ('epClose' in b.dataset) { dialog.close(); return; }
    if ('epReset' in b.dataset) { reset(); return; }
    if (b.dataset.epSlip) { selectSlip(b.dataset.epSlip); return; }
    if (b.dataset.epPlace) { fileAt(b.dataset.epPlace); return; }
    if (b.dataset.epPage) { goTo(b.dataset.epPage); return; }
    if (b.dataset.epFinding) {
      const finding = b.dataset.epFinding;
      if (finding === 'unresolved') { goTo('conclusion'); return; }
      setMessage(finding === 'camp' ?
        'Julian took the three known survivors away in May. By August they had reached Callao. The link to the camp appeared in the Melbourne Illustrated Post and was later reprinted in Musgrave’s book.' :
        'Musgrave put that question to Henry and George. Their answer did not establish who or what he had seen.');
    }
  }
  window.CastawayEpilogue = Object.freeze({open, reset, shown: () => Boolean(dialog && dialog.open)});
})();
