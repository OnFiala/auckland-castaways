/* Original narration for the eight film reels. Historical notes live in artwork/story-film/HISTORY.md. */
(function (root, factory) {
  const script = factory();
  if (typeof module === 'object' && module.exports) module.exports = script;
  if (root) root.CastawayFilmScript = script;
})(typeof window === 'undefined' ? undefined : window, function () {
  'use strict';

  return {
    version: 2,
    timeline: [
      {
        id: 'prologue',
        title: 'Soundings',
        dateline: 'Sydney, November 1863 · Carnley Harbour, 1–3 January 1864',
        shots: [
          {
            plate: 'outfit', dateline: 'Sydney · 12 November 1863', seconds: 14, action: 'wind',
            line: 'They loaded four months of food in Sydney. If the Grafton was still missing then, friends would send help. Five men sailed south for Campbell Island in search of tin.'
          },
          {
            plate: 'schooner', dateline: 'Carnley Harbour · 1 January 1864', seconds: 11, action: 'sea',
            line: 'They found no tin. On New Year’s Day the Grafton entered Carnley Harbour. Twenty fathoms of line hung beside the cliffs without touching bottom.'
          },
          {
            plate: 'wreck', seconds: 10, action: 'wind',
            line: 'An anchor chain snapped at seven the next evening. Each swell brought the schooner nearer the rocks. At midnight she struck.'
          },
          {
            plate: 'cabin-table', seconds: 10, action: 'lantern',
            line: 'Pieces of keel floated past. The men abandoned the pumps to save their food. A quarter of an hour later the sea had reached the cabin table.'
          },
          {
            plate: 'shore-dawn', seconds: 11, action: 'sea',
            line: 'In daylight all five reached the beach. Thomas Musgrave, François Raynal, Alick McLaren, Henry Forgés and George Harris. Their boat survived the landing too.'
          },
          {
            plate: 'beach', seconds: 10, action: 'wind',
            line: 'Raynal was ill. He walked a hundred yards that day, from the beach to their shelter under the Grafton’s own mainsail.'
          }
        ]
      },
      {
        id: 'winter',
        title: 'Two squares of glass',
        dateline: 'Epigwaitt · Winter 1864',
        shots: [
          {
            plate: 'camp-shelter', dateline: 'Epigwaitt · Winter 1864', seconds: 10, action: 'rain',
            line: 'They planted ship’s spars three feet deep. Wind still came through the walls, so the men tied up bundles of grass for thatch.'
          },
          {
            plate: 'cabin', seconds: 11, action: 'hearth',
            line: 'Two panes from the cabin let in daylight. Raynal carved chessmen with his pocketknife. He used soot for the black squares and lime for the white.'
          }
        ]
      },
      {
        id: 'forge',
        title: 'The hole for a bolt',
        dateline: 'Epigwaitt · Early 1865',
        shots: [
          {
            plate: 'forge-cold', dateline: 'Epigwaitt · Early 1865', seconds: 9, action: 'still',
            line: 'A year went by without a rescue ship. They made an anvil of iron ballast. They would build a vessel themselves.'
          },
          {
            plate: 'forge-lit', seconds: 11, action: 'ember',
            line: 'Raynal made a saw and chisels. The keel was ready, but its bolts needed deep holes. All the steel he had came from their mining tools.'
          }
        ]
      },
      {
        id: 'boat',
        title: 'What the dinghy could carry',
        dateline: 'Carnley Harbour · July 1865',
        shots: [
          {
            plate: 'slipway', dateline: 'Carnley Harbour · July 1865', seconds: 10, action: 'wind',
            line: 'Raynal gave the auger three days. It still would not bore the timber. They turned to a boat already built, the Grafton’s dinghy.'
          },
          {
            plate: 'slipway-ready', seconds: 10, action: 'sail',
            line: 'They raised her sides. On trial, a shift of weight nearly tipped her over. Three could sail. Henry and George would have to stay.'
          }
        ]
      },
      {
        id: 'crossing',
        title: 'A hand for the pump',
        dateline: 'From Camp Cove to Stewart Island · 19–24 July 1865',
        shots: [
          {
            plate: 'crossing-wet', dateline: 'Camp Cove · 19 July 1865', seconds: 11, action: 'sea',
            line: 'On July the nineteenth, Musgrave, Raynal and Alick left Camp Cove on a fair wind. Within twenty miles it had risen to a gale.'
          },
          {
            plate: 'crossing-bailed', seconds: 10, action: 'sail',
            line: 'Raynal and Alick steered in turns. Musgrave pumped one-handed, clinging to a rope. Nearly half their time went into simply riding out the storm.'
          }
        ]
      },
      {
        id: 'promise',
        title: 'The wet streets',
        dateline: 'Port Adventure and Invercargill · July 1865',
        shots: [
          {
            plate: 'harbour', dateline: 'Port Adventure · 24 July 1865', seconds: 11, action: 'sea',
            line: 'Five nights later they reached Stewart Island. Captain Cross took them in. Next morning Musgrave gave him the little boat that had carried them.'
          },
          {
            plate: 'chartroom', dateline: 'Invercargill · Late July 1865', seconds: 11, action: 'chart',
            line: 'In Invercargill, John Macpherson walked the muddy streets for Henry and George. By the second evening he had raised over a hundred pounds, with blankets besides.'
          }
        ]
      },
      {
        id: 'return',
        title: 'Within sight of the house',
        dateline: 'Carnley Harbour · 24 August 1865',
        shots: [
          {
            plate: 'landing', dateline: 'Carnley Harbour · 24 August 1865', seconds: 10, action: 'sea',
            line: 'The wind eased. Under shortened sail, Flying Scud carried Captain Cross and Musgrave up the harbour. The house appeared a mile ahead.'
          },
          {
            plate: 'return-camp', seconds: 9, action: 'hearth',
            line: 'One man ran indoors for the other. Cross and Musgrave landed. The cutter stayed under sail. It was too rough to anchor.'
          }
        ]
      },
      {
        id: 'epilogue',
        title: 'A letter from Callao',
        dateline: 'Camp Cove, August 1865 · The northern coast, 1864–65 · Carnley Harbour today',
        shots: [
          {
            plate: 'ending', seconds: 10, action: 'still',
            line: 'Now Henry and George could sit down to fish and potatoes. Bread and butter, too. After nearly twenty months, all five were safe.'
          },
          {
            plate: 'invercauld-wreck', dateline: 'Northern Auckland Island · 10 May 1864', seconds: 12, action: 'wind',
            line: 'The year before, the Invercauld had struck the northern coast. Captain Dalgarno reckoned she broke up in twenty minutes. Of twenty-five men, nineteen reached the rocks.'
          },
          {
            plate: 'skin-boat', seconds: 11, action: 'still',
            line: 'Neither crew knew of the other. Smith wrote to his wife that on calm days two men crossed to nearby islands for seals in a boat of skins.'
          },
          {
            plate: 'julian', dateline: 'Northern Auckland Island · May 1865', seconds: 12, action: 'sea',
            line: 'In May a leaking ship, the Julian, sent a boat ashore. Only George Dalgarno, Andrew Smith and Robert Holding survived to sail with her to Callao.'
          },
          {
            plate: 'hearth-remains', dateline: 'Carnley Harbour · Then and now', seconds: 14, action: 'still',
            line: 'The Grafton’s anchors are still there, under the water. A few ribs lie in the shingle. On shore, the stones of a hearth mark where the five made a home.'
          }
        ]
      }
    ]
  };
});
