/* Original narration for the eight film reels. Historical notes live in artwork/story-film/HISTORY.md. */
(function (root, factory) {
  const script = factory();
  if (typeof module === 'object' && module.exports) module.exports = script;
  if (root) root.CastawayFilmScript = script;
})(typeof window === 'undefined' ? undefined : window, function () {
  'use strict';

  return {
    version: 1,
    timeline: [
      {
        id: 'prologue',
        title: 'Soundings',
        dateline: 'Sydney, November 1863 · Carnley Harbour, 1–3 January 1864',
        shots: [
          {
            plate: 'outfit', dateline: 'Sydney · November 1863', seconds: 14, action: 'wind',
            line: 'In November eighteen sixty-three, five men left Sydney to look for tin on Campbell Island. They found none. They took a few skins and turned for home.'
          },
          {
            plate: 'schooner', dateline: 'Carnley Harbour · 1 January 1864', seconds: 11, action: 'sea',
            line: 'On New Year’s Day the Grafton entered Carnley Harbour. Close under the rocks, twenty fathoms of line still found no bottom.'
          },
          {
            plate: 'wreck', seconds: 10, action: 'wind',
            line: 'By the second evening one anchor chain had snapped. The other dragged. At midnight the schooner struck.'
          },
          {
            plate: 'cabin-table', seconds: 10, action: 'lantern',
            line: 'A quarter of an hour after the men left the pumps, the sea was level with the cabin table.'
          },
          {
            plate: 'shore-dawn', seconds: 11, action: 'sea',
            line: 'In daylight all five made it onto the stones. Thomas Musgrave and François Raynal came ashore with Alick McLaren, Henry Forgés and George Harris.'
          },
          {
            plate: 'beach', seconds: 10, action: 'wind',
            line: 'Raynal could scarcely walk. From the wreck the men brought the mainsail. That night they would sleep under it.'
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
            line: 'They took the spars down from the Grafton and set them in the ground. By winter they had a house.'
          },
          {
            plate: 'cabin', seconds: 11, action: 'hearth',
            line: 'Two squares of cabin glass let in the daylight. At the table Raynal carved chessmen from thin strips of wood, red against white.'
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
            line: 'A block of iron that once lay in the schooner’s belly became the anvil for another vessel.'
          },
          {
            plate: 'forge-lit', seconds: 11, action: 'ember',
            line: 'Raynal could make chisels and a saw. Out in the yard lay the heavy timbers he still had to bore for bolts.'
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
            line: 'Three days at the forge had failed to produce an auger for those timbers. There was still the schooner’s dinghy.'
          },
          {
            plate: 'slipway-ready', seconds: 10, action: 'sail',
            line: 'They raised her sides. She would carry three. Henry and George would need another boat to come back for them.'
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
            line: 'On the nineteenth of July, Musgrave, Raynal and Alick sailed from Camp Cove. The gale caught them within twenty miles of the island.'
          },
          {
            plate: 'crossing-bailed', seconds: 10, action: 'sail',
            line: 'Raynal and Alick took turns at the helm. Musgrave held a rope with one hand and pumped with the other.'
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
            line: 'Five days and nights brought them to Port Adventure. Musgrave needed an arm to reach Captain Cross’s house. He could barely eat.'
          },
          {
            plate: 'chartroom', dateline: 'Invercargill · Late July 1865', seconds: 11, action: 'chart',
            line: 'In Invercargill, John Macpherson walked the wet streets collecting money for the return. People gave blankets and clothes for the two men.'
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
            line: 'Musgrave came back with Captain Cross aboard Flying Scud. The house only came into view when they were about a mile off.'
          },
          {
            plate: 'return-camp', seconds: 9, action: 'hearth',
            line: 'One man saw the cutter and ran inside to tell the other. Both came down to the beach.'
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
            line: 'That night Henry and George ate fish and potatoes aboard Flying Scud. All five who left the Grafton had survived.'
          },
          {
            plate: 'invercauld-wreck', dateline: 'Northern Auckland Island · 10 May 1864', seconds: 12, action: 'wind',
            line: 'On the tenth of May the year before, the Invercauld had broken up on the island’s northern coast. Nineteen of twenty-five reached land.'
          },
          {
            plate: 'skin-boat', seconds: 11, action: 'still',
            line: 'Neither crew knew of the other. Andrew Smith wrote to his wife about their sealskin boat. Two could take it out for food.'
          },
          {
            plate: 'julian', dateline: 'Northern Auckland Island · May 1865', seconds: 12, action: 'sea',
            line: 'In May of eighteen sixty-five, the Julian put in for repairs. Only George Dalgarno, Andrew Smith and Robert Holding lived to go aboard.'
          },
          {
            plate: 'hearth-remains', dateline: 'Carnley Harbour · Present day', seconds: 14, action: 'still',
            line: 'A few ribs of the Grafton still lie in the shingle at Carnley Harbour. Nearby, the stones of the hearth mark where the five made their home.'
          }
        ]
      }
    ]
  };
});
