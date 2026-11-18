/* Original playable reconstructions. A workbench never mutates the voyage. */
(function (root, build) {
  const api = build();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CastawayFieldwork = api;
})(globalThis, function () {
  'use strict';

  const act = (id, label, x, y, selected) => ({id, label, x, y, selected});
  const move = (s, change, feedback) => ({state: {...s, ...change}, feedback});
  const stay = (s, feedback) => move(s, {}, feedback);
  const finish = (s, feedback) => move(s, {done: true}, feedback);

  const puzzles = {
    chest: {
      title: 'The swollen chest', place: 'The wreck', item: 'prybar', target: 'crate', scene: 'wreck', flag: 'crateOpen', chapter: 1,
      description: 'A hinged iron hasp hangs across the wet lid. Farther right, a splinter has broken away.',
      resolved: 'The lid gives. An axe and a tinderbox lie dry beneath it.',
      hints: ['Look for missing wood along the front edge.', 'The bar needs room for its tip and a pivot close to the load.', 'Seat the tip in the nick, put the block near the tip, then press the handle.'],
      start: {seated: false, pivot: ''},
      view(s) {
        if (!s.seated) return {question: 'Where will the iron get a purchase?', actions: [
          act('flat', 'Try the tight seam', 20, 60.9), act('strap', 'Try the iron hasp', 37.2, 60.5), act('notch', 'Try the broken nick', 73.4, 59.4)]};
        return {question: 'Where should the bar turn?', actions: [
          act('near', 'Block near the tip', 68, 64, s.pivot === 'near'), act('far', 'Block near the handle', 47, 77, s.pivot === 'far'), act('press', 'Press the handle', 34, 85)]};
      },
      play(s, a) {
        if (a === 'flat') return stay(s, 'The blade skates across two close-fitting boards.');
        if (a === 'strap') return stay(s, 'The hasp swings loose. The wood stays fast, with no lip for the bar here.');
        if (a === 'notch') return move(s, {seated: true}, 'The tip slips under the splintered lip. A small wood block will serve as a pivot.');
        if (a === 'near' || a === 'far') return move(s, {pivot: a}, a === 'near' ? 'The short end sits under the lid. Most of the iron now extends beyond the block.' : 'The block sits near your hand. Only a short length of handle extends beyond it.');
        if (s.pivot !== 'near') return stay(s, s.pivot ? 'The long end barely stirs. Shift the block toward the lid to give your hand more leverage.' : 'The whole bar drops with your hand. It needs a block to turn against.');
        return finish(s, this.resolved);
      }
    },
    roof: {
      title: 'Rain in Epigwaitt', place: 'Epigwaitt', item: 'weatherPatch', target: 'roof', scene: 'cabin', flag: 'roofSealed', chapter: 2,
      description: 'Rain rattles against the window. There is an old brown mark on the wall and a tin pan on the floor by the bunk.',
      patchDescription: 'A drop hangs from the upper sheet. A dark track runs down the cloth below. The hide has two loose ties.',
      resolved: 'The pan is still. Through the window you can see water spilling clear of the eave.',
      hints: ['Follow the drop downhill from the upper canvas.', 'The upper canvas should shed water onto the face of the hide. Both lower corners must lie flat.', 'Slip the hide underneath the upper sheet, stitch both corners, then pour water.'],
      surveyHints: ['Give each place a moment. Look for a change as the next drop falls.', 'The pan rings beside the bunk. Look straight up from its centre.', 'Watch the pan, then trace the join in the canvas above it.'],
      start: {observed: '', located: false, lap: '', left: false, right: false},
      view(s) {
        if (!s.located) return {question: 'Where is the rain getting in?', actions: [
          act('oldMark', 'Feel the mark on the wall', 37, 41), act('pan', 'Watch the tin pan', 59.8, 86.5),
          act('drySeam', 'Trace the seam by the window', 36, 15), act('wetSeam', 'Trace the seam above the bunk', 59.8, 22.2),
          act('listen', 'Listen inside the house', 49, 49)]};
        if (!s.lap) return {question: 'Which way should the hide overlap?', actions: [
          act('under', 'Slip beneath upper sheet', 29, 28), act('over', 'Lay over upper sheet', 58, 40)]};
        return {question: 'Fasten the hide and follow a drop.', actions: [
          act('left', 'Stitch left corner', 33, 68, s.left), act('right', 'Stitch right corner', 66, 73, s.right),
          act('pour', 'Pour from above', 28, 29), act('relay', 'Lift and relay hide', 53, 50)]};
      },
      play(s, a) {
        if (a === 'oldMark') return move(s, {observed: s.observed || 'mark'}, 'The stain feels dry. Its ragged edge stays the same shape as the rain falls.');
        if (a === 'drySeam') return stay(s, 'You run a finger under the seam by the window. It comes away dry. A little ring spreads across the pan farther along the wall.');
        if (a === 'pan' || a === 'listen') return move(s, {observed: 'pan'}, a === 'listen'
          ? 'Tick. A pause, then another tick from the tin beside the bunk. A ring opens in the water with each tap.'
          : 'A ring crosses the water and touches the rim. Another breaks the surface at the very same spot. There is a bead overhead.');
        if (a === 'wetSeam') return s.observed === 'pan'
          ? move(s, {located: true}, 'Above the pan, a bead swells under the overlapping sheets. This is where the hide has to go.')
          : stay(s, 'Several stitches are dark. Follow a falling drop all the way down to see which seam feeds it.');
        if (a === 'under' || a === 'over') return move(s, {lap: a}, a === 'under' ? 'The upper sheet covers the top of the hide. The two lower corners still lift.' : 'The top edge of the hide faces the falling water. The corners curl away.');
        if (a === 'left' || a === 'right') return move(s, {[a]: true}, s[a] ? 'That corner already lies snug against the canvas.' : 'The tie draws the ' + a + ' corner flat against the roof.');
        if (a === 'relay') return move(s, {lap: '', left: false, right: false}, 'You loosen the ties and lift the hide. The upper seam is accessible again.');
        if (!s.left || !s.right) return stay(s, 'A loose corner lifts, letting water run behind the hide. Feel along both lower corners.');
        if (s.lap === 'over') return stay(s, 'The stitches hold, but water dives behind the uphill edge. Lift the hide and reverse the lap.');
        return finish(s, this.resolved);
      }
    },
    drill: {
      title: 'A mark in hard wood', place: 'The forge', item: 'drillBlank', target: 'testBlock', scene: 'forge', flag: 'drillFailed', chapter: 3,
      description: 'An old, deep socket darkens the block. Beside it lies hard wood with only a pale surface mark. The trial bit rests below.',
      resolved: 'The lip has folded. The men set the trial aside and keep its iron for boat nails.',
      hints: ['An old hole can guide a bit without proving that it cuts.', 'Read the new mark and inspect the iron that made it.', 'Test the fresh wood, examine the scrape and the cutting lip, then reclaim the iron.'],
      start: {tested: false, scratch: false, edge: false},
      view(s) {
        if (!s.tested) return {question: 'Can this bit cut a new hole?', actions: [
          act('old', 'Try the existing socket', 37, 43), act('fresh', 'Turn in fresh wood', 54, 39)]};
        return {question: 'What did the trial tell you?', actions: [
          act('scratch', 'Examine the new scrape', 54, 39, s.scratch), act('edge', 'Inspect the cutting lip', 31.5, 73, s.edge), act('reclaim', 'Reclaim the iron', 78, 62)]};
      },
      play(s, a) {
        if (a === 'old') return stay(s, 'The bit follows the walls of the old socket and turns freely. What happens where there is no hole?');
        if (a === 'fresh') return move(s, {tested: true}, 'A few turns leave a bright crescent. No curl of wood rises from the block.');
        if (a === 'scratch') return move(s, {scratch: true}, 'The fibres are rubbed smooth. A fingernail finds no deepening hole.');
        if (a === 'edge') return move(s, {edge: true}, 'A little lip of iron has turned back on itself. The edge gave way under the load.');
        if (!s.scratch || !s.edge) return stay(s, 'Before giving up a tool, compare the new mark with the cutting lip.');
        return finish(s, this.resolved);
      }
    },
    fastening: {
      title: 'The last plank', place: 'The slipway', item: 'boatNails', target: 'boatFrame', scene: 'slipway', flag: 'hullFastened', chapter: 4,
      description: 'The last board lies against the ribs. Alick has the nails in his hand. Musgrave has the hammer.',
      resolved: 'The board stays against the ribs when Alick puts his weight on it. Musgrave runs his thumb over the head of the nail. The joint is ready for oakum.',
      hints: ['Push the board and watch the open sliver between the timber and the ribs.', 'Give Musgrave the nails. He needs both of Alick’s hands on the end that sprang clear.', 'Press the plank, pass the nails, brace the bow end and signal Musgrave. Step clear, then push the joint again.'],
      start: {tested: false, handed: false, brace: '', driven: false, clear: false},
      view(s) {
        if (!s.tested) return {question: 'Will the board sit against the ribs?', actions: [act('pressPlank', 'Push the loose board', 43, 43)]};
        if (!s.handed) return {question: 'Musgrave holds out his hand.', actions: [act('giveNails', 'Pass Musgrave the nails', 44, 47)]};
        if (s.driven) return s.clear
          ? {question: 'Will the joint hold on its own?', actions: [act('proveJoint', 'Put weight on the joint', 72, 38)]}
          : {question: 'Both men still have a hand on the work.', actions: [act('release', 'Take both hands away', 76, 36)]};
        return {question: 'Where should Alick hold the board?', actions: [
          act('stern', 'Brace the stern end', 27, 42, s.brace === 'stern'), act('bow', 'Brace the bow end', 76, 35, s.brace === 'bow'),
          act('strike', 'Signal Musgrave to drive the nail', 54, 35), ...(s.brace ? [act('loosen', 'Let the board go', 42, 55)] : [])]};
      },
      play(s, a) {
        if (a === 'pressPlank') return move(s, {tested: true}, 'Alick pushes. The stern stays put. At the bow, a strip of daylight opens between the plank and the ribs.');
        if (a === 'giveNails') return move(s, {handed: true}, 'Musgrave takes the nails and steps to the middle rib. Alick has both hands free.');
        if (a === 'stern') return move(s, {brace: 'stern'}, 'Alick leans on the stern end. The bow still stands proud of the rib at Musgrave’s hand.');
        if (a === 'bow') return move(s, {brace: 'bow'}, 'Alick leans his weight against the bow end. The sliver of daylight closes under Musgrave’s fingers.');
        if (a === 'loosen') return move(s, {brace: ''}, 'Alick steps clear. The bow springs out again. Musgrave keeps the nails.');
        if (a === 'strike') return s.brace === 'bow'
          ? move(s, {driven: true}, 'Musgrave drives the nail home while Alick holds the plank in place.')
          : stay(s, 'Musgrave lowers the hammer. The nail would cross open air before it reached the rib. The bow end needs a man on it.');
        if (a === 'release') return move(s, {clear: true, brace: ''}, 'They take their hands away. The head of the nail is flush. The board stays against the rib.');
        return finish(s, this.resolved);
      }
    },
    hull: {
      title: 'The hungry seam', place: 'The slipway', item: 'caulking', target: 'seams', scene: 'slipway', flag: 'boatSealed', chapter: 4,
      description: 'Three runs of dark plank meet at the bow. Two joints lie close. One opens into a pocket between fastenings.',
      resolved: 'Pitch lies in a thin continuous band over the packed fibres. The seam is closed.',
      hints: ['Look between the fastenings for a joint with daylight in it.', 'Fill the hollow with fibre. A shallow groove on top leaves room for the pitch.', 'Find the middle gap, press in two strands, then brush it with pitch. Lift a strand if it bulges.'],
      start: {found: false, fill: 0},
      view(s) {
        if (!s.found) return {question: 'Which joint needs the oakum?', actions: [
          act('upper', 'Feel the upper joint', 56, 26), act('middle', 'Feel the middle joint', 60, 58), act('lower', 'Feel the lower joint', 61, 90)]};
        return {question: 'How much fibre will the gap take?', actions: [
          act('pack', 'Press in a strand', 52, 57), act('lift', 'Lift out a strand', 68, 60), act('pitch', 'Brush on the pitch', 82, 63)]};
      },
      play(s, a) {
        if (a === 'upper' || a === 'lower') return stay(s, 'Your nail meets hard timber on both sides of the line. There is no pocket here.');
        if (a === 'middle') return move(s, {found: true}, 'The joint falls away under your thumb between two nails. Pitch alone would disappear inside.');
        if (a === 'lift' || a === 'pack') {
          const fill = Math.max(0, Math.min(3, s.fill + (a === 'pack' ? 1 : -1)));
          return move(s, {fill}, ['The pocket is empty.', 'The first twist sits deep. A hollow remains above it.', 'The fibre lies snug, with a shallow channel left for pitch.', 'The fibre bulges above the plank. A brush would snag here.'][fill]);
        }
        if (s.fill !== 2) return stay(s, s.fill < 2 ? 'The brush sinks into the gap. It needs a firmer bed of fibre.' : 'The brush catches on a raised twist. Lift a strand to leave a channel.');
        return finish(s, this.resolved);
      }
    },
    rig: {
      title: 'A fair lead', place: 'The open boat', item: 'stormLine', target: 'rigging', scene: 'crossing', flag: 'rigSecured', chapter: 5,
      description: 'The lower corner of the sail jerks above two timber eyes. Its loose end lashes the rail as each gust fills the canvas.',
      resolved: 'The next gust draws the line straight through the eye. The corner holds without sawing across the rail.',
      hints: ['Begin at the eye in the sail. Follow its pull downward.', 'The eye nearer the line of the pull gives the straighter lead. Feel the rope during a lull.', 'Reeve the sail eye, use the left timber eye, wait for a lull, then take up the slack.'],
      start: {reeved: false, lead: '', quiet: false},
      view(s) {
        if (!s.reeved) return {question: 'Where can the line catch the sail?', actions: [
          act('clew', 'Reeve the sail eye', 48, 31), act('tail', 'Pull the loose tail', 60, 91)]};
        const actions = [act('port', 'Lead to left eye', 35, 76, s.lead === 'port'), act('other', 'Lead to right eye', 76, 72, s.lead === 'other')];
        if (s.lead) actions.push(act('lull', 'Wait for a lull', 48, 30, s.quiet), act('haul', 'Take up the slack', 60, 91));
        return {question: s.lead ? 'Feel the pull before taking up slack.' : 'Which eye gives a straighter lead?', actions};
      },
      play(s, a) {
        if (a === 'tail') return stay(s, 'The tail runs through your hand. It cannot steady a sail it has not caught.');
        if (a === 'clew') return move(s, {reeved: true}, 'The line passes through the sail eye. Below it are two possible leads.');
        if (a === 'port' || a === 'other') return move(s, {lead: a, quiet: false}, a === 'port' ? 'The line drops nearly straight to the eye. The sail fills and the hemp draws taut.' : 'The line cuts sideways over the timber. Each pull rubs the same length of hemp.');
        if (a === 'lull') return move(s, {quiet: true}, 'The canvas hangs for a moment. You can take up slack at your own pace.');
        if (s.lead === 'other') return stay(s, 'The angle draws the line hard against the timber. Move it to the eye nearer the pull.');
        if (!s.quiet) return stay(s, 'The full sail pulls back harder than you can haul. Let this gust pass.');
        return finish(s, this.resolved);
      }
    },
    chart: {
      title: 'The return course', place: 'The chart room', item: 'markedChart', target: 'chartTable', scene: 'chartroom', flag: 'rescueRoute', chapter: 6,
      description: 'Plot the offshore leg, from Stewart Island back to Carnley Harbour. A small sketch in the margin marks the approach.',
      resolved: 'The pencil reaches Carnley Harbour. The cutter has a return course to the men waiting there.',
      hints: ['Find Port Pegasus on Stewart Island, the last stop before open water.', 'Keep the eastern side of the island in view and choose the long southern inlet.', 'Start at Stewart Island, choose the eastern approach and the southern inlet, then check the course.'],
      start: {origin: false, via: '', end: ''},
      view(s) {
        if (!s.origin) return {question: 'Pin the start of the offshore leg.', actions: [act('origin', 'Pin Port Pegasus', 68, 33), act('isles', 'Pin Auckland Island', 35, 63)]};
        if (!s.via) return {question: 'On which side will you approach?', actions: [act('west', 'Pin western approach', 25, 55), act('east', 'Pin eastern approach', 54, 56)]};
        if (!s.end) return {question: 'Where are the two men waiting?', actions: [act('north', 'Pin the northern cove', 38, 62), act('inlet', 'Pin the southern inlet', 39, 73)]};
        return {question: 'Does the pencilled course fit the journal?', actions: [act('waypoint', 'Move the approach pin', s.via === 'east' ? 54 : 25, 55), act('endpoint', 'Move the harbour pin', 38, s.end === 'inlet' ? 73 : 62), act('verify', 'Check the course', 69, 43)]};
      },
      play(s, a) {
        if (a === 'isles') return stay(s, 'That is the destination. The offshore passage begins much farther north.');
        if (a === 'origin') return move(s, {origin: true}, 'Port Pegasus, Stewart Island. This is the last stop after leaving Invercargill, before the open-sea passage.');
        if (a === 'east' || a === 'west') return move(s, {via: a}, a === 'east' ? 'The pencil reaches open water off the eastern shore.' : 'The pencil leads around the western shore.');
        if (a === 'north' || a === 'inlet') return move(s, {end: a}, a === 'north' ? 'The last leg ends at the little northern cove.' : 'The last leg reaches the long inlet at the southern end.');
        if (a === 'waypoint') return move(s, {via: ''}, 'Lift the offshore pin. The destination stays marked.');
        if (a === 'endpoint') return move(s, {end: ''}, 'Lift the harbour pin. The offshore approach stays marked.');
        if (s.via !== 'east') return stay(s, 'This approach is on the opposite side from the journal sketch. Move the offshore pin.');
        if (s.end !== 'inlet') return stay(s, 'That cove is too far north. The journal marks the inlet at the southern end.');
        return finish(s, this.resolved);
      }
    },
    landing: {
      title: 'Room for the swell', place: 'Carnley Harbour', item: 'rescueLine', target: 'rescueBoat', scene: 'landing', flag: 'boatMoored', chapter: 7,
      description: 'A dark tide mark rings the landing post. The boat rises and falls beside it. Enough line must run for the trough without letting the hull swing in on the crest.',
      resolved: 'The line carries the boat through both halves of the swell. The men can bring the supplies ashore.',
      hints: ['Choose a turn that will stay above the wet mark.', 'Watch both ends of a swell. A bar-tight line needs slack. A wandering bow has too much.', 'Take the high turn, pay out one turn, then try both the crest and the trough.'],
      start: {fast: false, slack: 0, crest: false, trough: false},
      view(s) {
        if (!s.fast) return {question: 'Where will the turn stay clear of the water?', actions: [act('high', 'Take a high turn', 81, 26), act('low', 'Take a low turn', 81, 47.5)]};
        return {question: 'Will the boat ride a whole swell?', actions: [
          act('pay', 'Pay out one turn', 12, 70), act('take', 'Take in one turn', 33, 81), act('crest', 'Try the crest', 67, 47, s.crest), act('trough', 'Try the trough', 66, 64, s.trough)]};
      },
      play(s, a) {
        if (a === 'low') return stay(s, 'Water covers that part of the post on each rise. The turn would be out of reach.');
        if (a === 'high') return move(s, {fast: true}, 'The turn holds above the tide mark. The line now runs straight from the post to the boat.');
        if (a === 'pay' || a === 'take') {
          const slack = Math.min(2, Math.max(0, s.slack + (a === 'pay' ? 1 : -1)));
          if (slack === s.slack) return stay(s, a === 'pay' ? 'That is all the spare line.' : 'The line is already taut.');
          return move(s, {slack, crest: false, trough: false}, ['The line draws straight. Try the swell again.', 'A little belly hangs in the line. Try both ends of the swell.', 'A broad loop trails toward the water. Try the swell.'][slack]);
        }
        if (a === 'trough' && s.slack === 0) return stay(s, 'As the boat drops, the straight line snubs the bow. Pay out a little hemp.');
        if (a === 'crest' && s.slack === 2) return stay(s, 'At the top of the swell, the loose bow swings close to the post. Take in a turn.');
        const tested = {...s, [a]: true};
        if (tested.crest && tested.trough) return finish(tested, this.resolved);
        return move(s, {[a]: true}, a === 'crest' ? 'At the crest the hull clears the post. Test the drop as well.' : 'At the trough the bow floats freely. Test the rise as well.');
      }
    }
  };

  function challenge(state, itemId, targetId, response) {
    if (!state?.inventory?.includes(itemId) || !response?.changed || !response.state?.flags) return null;
    for (const [id, p] of Object.entries(puzzles)) {
      if (state.chapter === p.chapter && state.scene === p.scene && p.item === itemId && p.target === targetId &&
          !state.flags[p.flag] && response.state.flags[p.flag]) return id;
    }
    return null;
  }
  function initial(id) { return {...puzzles[id].start, done: false}; }
  function view(id, s) { return s.done ? {question: 'Work complete', actions: []} : puzzles[id].view(s); }
  function step(id, s, action) {
    if (!view(id, s).actions.some(a => a.id === action)) return stay(s, s.done ? puzzles[id].resolved : 'Look over the work before trying that.');
    return puzzles[id].play(s, action);
  }
  return {challenge, initial, view, step, puzzles};
});
