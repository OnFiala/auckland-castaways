/* Original game model. All units, dialogue and compressed weather are fiction. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CastawayEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 1;
  const PEOPLE = [
    { id: 'musgrave', name: 'Thomas', surname: 'Musgrave', role: 'Kapitán · navigace', initials: 'TM', color: '#697d7a' },
    { id: 'raynal', name: 'François', surname: 'Raynal', role: 'Řemeslo · experimenty', initials: 'FR', color: '#b2815b' },
    { id: 'alick', name: 'Alick', surname: 'Maclaren', role: 'Námořník · práce se dřevem', initials: 'AM', color: '#86917a' },
    { id: 'george', name: 'George', surname: 'Harris', role: 'Námořník · výpravy', initials: 'GH', color: '#8a8d9e' },
    { id: 'henry', name: 'Henry', surname: 'Forgés', role: 'Jídlo · chod domácnosti', initials: 'HF', color: '#a58a76' }
  ];
  const TASKS = {
    forage: { name: 'Potrava', icon: 'fish', description: 'Přinést jídlo z pobřeží. George získá jednu porci navíc.' },
    fuel: { name: 'Palivo', icon: 'wood', description: 'Zajistit suché palivo. Alick přinese jednu jednotku navíc.' },
    camp: { name: 'Tábor', icon: 'home', description: 'Opravit přístřeší, připravit jídlo a suché místo. Večer pomůže všem zotavit se.' },
    project: { name: 'Dílna', icon: 'hammer', description: 'Zkouška vrtáku potřebuje dva lidi, 2 paliva a 1 kus oceli.' },
    rest: { name: 'Odpočinek', icon: 'moon', description: 'Sníží únavu o 3 v suchém domě, jinak o 2. Nedostatek jídla zotavení zhorší.' }
  };
  const WEATHER = [
    { name: 'Přeháňky', summary: 'Pobřeží je dostupné. V dílně lze pracovat.', forage: 3, fuel: 3, rain: true },
    { name: 'Déšť slábne', summary: 'Večerní práce v táboře pomůže celé pětici.', forage: 3, fuel: 3 },
    { name: 'Chladné jasno', summary: 'Dobrá příležitost doplnit potravu před vichřicí.', forage: 4, fuel: 3 },
    { name: 'Vítr sílí', summary: 'Zítra se na pobřeží nedostanete. Myslete na rezervu.', forage: 3, fuel: 2, rain: true },
    { name: 'Vichřice', summary: 'Pobřeží je uzavřené. Dům bez údržby dál vlhne.', forage: 0, fuel: 2, storm: true, rain: true },
    { name: 'Vytrvalý déšť', summary: 'Pobřeží zůstává uzavřené. Dnes pomohou zásoby.', forage: 0, fuel: 2, storm: true, rain: true },
    { name: 'Mlha nad zátokou', summary: 'Pomalý návrat k práci venku. Kratší výpravy.', forage: 2, fuel: 2, rain: true },
    { name: 'Nízká oblačnost', summary: 'Člun potřebuje práci. Lidé potřebují odpočinek.', forage: 3, fuel: 3 },
    { name: 'Krátké vyjasnění', summary: 'Poslední den na přípravu další etapy.', forage: 4, fuel: 3 },
    { name: 'Déšť od moře', summary: 'Dokončete plán a dostaňte všech pět k večernímu stolu.', forage: 3, fuel: 2, rain: true }
  ];
  const CHAPTERS = [
    ['Ostří, které nepovolí', 'Velká loď zatím existuje hlavně v představách. Chybí nástroj, který dokáže provrtat připravené dřevo.'],
    ['Cena dalšího pokusu', 'Včerejší práce něco ukázala. Další pokus stojí palivo, ocel a síly, které mohou chybět jinde.'],
    ['Den uvnitř', 'Vítr zavřel pobřeží. V malém domě je o to víc slyšet, kdo komu co slíbil.'],
    ['Co už máme', 'Vrak není bezedný sklad. Člun, který vám dosud sloužil, ale pořád leží na břehu.'],
    ['Zítra začneme jinak', 'Únik je stále daleko. Dnes můžete mít společný plán, zásoby a ruce schopné dál pracovat.']
  ];
  const copy = x => JSON.parse(JSON.stringify(x));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const dayOf = s => Math.min(5, Math.floor(s.turn / 2) + 1);
  const fatigueLabel = n => n <= 1 ? 'Odpočatý' : n <= 3 ? 'Unavený' : n <= 5 ? 'Velmi unavený' : 'Vyčerpaný';
  function createGame() {
    return { version: VERSION, turn: 0, food: 12, fuel: 7, steel: 3, timber: 4, shelter: 3, trust: 3, trials: 0,
      knowledge: 0, project: 'cutter', boat: 0, hardship: 0, council: null, ending: null,
      crew: PEOPLE.map(p => ({ id: p.id, fatigue: p.id === 'raynal' ? 1 : 0 })), promises: [],
      log: [{ title: 'Epigwaitt · březen 1865', text: 'Pět zhuštěných dnů před změnou plánu. Počasí, dialogy a všechny číselné hodnoty jsou návrhem hry.' }],
      lastReport: null };
  }
  function initialPlan() { return { musgrave: 'fuel', raynal: 'project', alick: 'project', george: 'forage', henry: 'camp' }; }
  function getWeather(s) { return WEATHER[Math.min(s.turn, 9)]; }
  function taskProblem(s, id, task) {
    const person = s.crew.find(p => p.id === id);
    if (!person || !TASKS[task]) return 'Neplatná volba práce.';
    if (task === 'forage' && getWeather(s).forage === 0) return 'Pobřeží uzavřela vichřice.';
    if (['forage', 'project'].includes(task) && person.fatigue >= 5) return 'Na tuto práci už nemá dost sil. Potřebuje vystřídat.';
    return '';
  }
  function previewTurn(s, plan) {
    const errors = [];
    if (s.ending) errors.push('Tato kapitola už skončila.');
    if (s.council) errors.push('Nejprve dokončete večerní dohodu.');
    for (const p of PEOPLE) {
      const err = taskProblem(s, p.id, plan[p.id]);
      if (err) errors.push(`${p.name}: ${err}`);
    }
    if (errors.length) return { errors, warnings: [], next: null, notes: [] };
    return simulate(s, plan);
  }
  function simulate(s, plan) {
    const n = copy(s), weather = getWeather(s), day = dayOf(s), night = s.turn % 2 === 1;
    const notes = [], warnings = [], crew = n.crew;
    const assigned = task => crew.filter(p => plan[p.id] === task);
    const camp = assigned('camp').length, makers = assigned('project');
    let gatheredFood = 0, gatheredFuel = 0;
    for (const p of assigned('forage')) gatheredFood += weather.forage + (p.id === 'george' ? 1 : 0);
    for (const p of assigned('fuel')) gatheredFuel += weather.fuel + (p.id === 'alick' ? 1 : 0);
    n.food += gatheredFood; n.fuel += gatheredFuel;
    if (gatheredFood) notes.push(`Výpravy přinesou ${gatheredFood} porcí.`);
    if (gatheredFuel) notes.push(`Doplníte ${gatheredFuel} jednotek suchého paliva.`);
    if (camp) n.shelter = clamp(n.shelter + 1, 0, 4);
    else if (weather.storm) { n.shelter = clamp(n.shelter - 1, 0, 4); warnings.push('Bez údržby přístřeší ve vichřici zvlhne.'); }
    let trialDone = false;
    if (s.project === 'cutter' && makers.length) {
      if (makers.length < 2) warnings.push('Jeden člověk zkoušku vrtáku nezvládne. Práce dnes nepřinese nový výsledek.');
      else if (n.fuel < 2 || n.steel < 1) warnings.push('Na zkoušku chybí palivo nebo ocel. Přidělená práce nepřinese výsledek.');
      else {
        n.fuel -= 2; n.steel -= 1; n.trials++; trialDone = true;
        if (n.knowledge < 2) { n.knowledge++; notes.push('Zkouška přinese poznatek, nikoli funkční vrták.'); }
        else warnings.push('Za stejných podmínek získáte stejný výsledek. Další pokus už nepřidá poznání.');
      }
    } else if (s.project === 'boat' && makers.length) {
      const amount = Math.min(makers.length, 6 - n.boat, n.timber);
      n.boat += amount; n.timber -= amount;
      if (amount) notes.push(`Příprava člunu postoupí o ${amount} ${amount === 1 ? 'bod' : 'body'}.`);
      else notes.push(n.boat >= 6 ? 'Příprava je hotová. Další síly můžete uvolnit domácnosti.' : 'Na další úpravy chybí vhodné dřevo.');
    }
    let working = false;
    for (const p of crew) {
      const task = plan[p.id];
      if (task === 'rest') p.fatigue = Math.max(0, p.fatigue - (n.shelter >= 2 ? 3 : 2));
      else { p.fatigue += task === 'project' ? 2 : task === 'forage' && weather.forage <= 2 ? 2 : 1; working = true; }
    }
    const need = night ? 3 : 2, shortage = Math.max(0, need - n.food);
    n.food = Math.max(0, n.food - need);
    if (shortage) { n.hardship++; for (const p of crew) p.fatigue += 2; warnings.push('Na tuto směnu není dost jídla. Celá pětice hůře obnoví síly.'); }
    if (night) {
      const warm = n.fuel >= 1;
      if (warm) n.fuel--;
      else { for (const p of crew) p.fatigue++; warnings.push('Na večerní oheň nezbude palivo.'); }
      if (warm && camp && !shortage) { for (const p of crew) p.fatigue--; notes.push('Večerní práce v táboře pomůže všem snížit únavu o 1.'); }
      else if (!camp) warnings.push('Večer nikdo nezajistí chod tábora. Společné zotavení se neuskuteční.');
    }
    for (const p of crew) p.fatigue = clamp(p.fatigue, 0, 6);
    for (const promise of n.promises) {
      if (promise.day !== day || promise.status !== 'active') continue;
      if (promise.type === 'trial_limit' && trialDone) {
        promise.used++;
        if (promise.used > promise.limit) { promise.status = 'broken'; n.trust--; warnings.push('Další zkouška poruší slíbený limit.'); }
      }
      if (promise.type === 'rest' && plan[promise.person] === 'rest') promise.fulfilled = true;
      if (night && promise.status === 'active') {
        const kept = promise.type === 'trial_limit' ? promise.used <= promise.limit : promise.fulfilled;
        promise.status = kept ? 'kept' : 'broken';
        n.trust += kept ? 1 : -1;
        (kept ? notes : warnings).push(kept ? `Dodržíte dohodu: ${promise.label}` : `Nesplníte dohodu: ${promise.label}`);
      }
    }
    n.trust = clamp(n.trust, 0, 4);
    if (n.crew.some(p => p.fatigue >= 5)) warnings.push('Někteří potřebují vystřídat před další těžkou prací.');
    n.turn++;
    n.lastReport = { day, shift: night ? 'Odpoledne' : 'Dopoledne', notes, warnings, trialDone, plan: copy(plan) };
    n.log.push({ title: `Den ${day} · ${night ? 'odpoledne' : 'dopoledne'}`, text: [...notes, ...warnings].join(' ') || (working ? 'Den pokračuje drobnou prací.' : 'Pětice si dopřála čas na zotavení.') });
    if (n.turn >= 10) n.ending = outcome(n);
    else if (night) n.council = day;
    return { errors: [], warnings, notes, next: n };
  }
  function resolveTurn(s, plan) {
    const p = previewTurn(s, plan);
    if (p.errors.length) throw new Error(p.errors.join(' '));
    return p.next;
  }
  function getCouncil(s) {
    if (!s.council) return null;
    const tired = [...s.crew].sort((a,b) => b.fatigue - a.fatigue)[0];
    const person = PEOPLE.find(p => p.id === tired.id);
    const data = {
      1: { title: 'Ještě jeden pokus?', speaker: 'François Raynal', text: '„Jednu věc už víme: tohle ostří nestačí. Další zkouška potřebuje jasnou hranici.“',
        choices: [{ id: 'one_trial', title: 'Zítra nejvýš jedna zkouška', detail: 'Konkrétní slib: během druhého dne nejvýš jeden pokus ve výhni.' }, { id: 'pause', title: 'Zítra výheň necháme stát', detail: 'Slib dne bez zkoušek. Získáte čas pro zásoby a odpočinek.' }, { id: 'open', title: 'Rozhodneme se podle situace', detail: 'Bez nového slibu. Nejistota sníží soudržnost o jeden stupeň.' }] },
      2: { title: 'Ruce na zítřek', speaker: person.name + ' ' + person.surname, text: '„Zítra nebude možné chodit na pobřeží. Potřebujeme se vystřídat i uvnitř.“',
        choices: [{ id: 'rest_tired', title: `${person.name} dostane jednu směnu volna`, detail: `Slib pro třetí den: alespoň jedna směna odpočinku. Nynější únava ${tired.fatigue}/6.` }, { id: 'rest_george', title: 'Jednu směnu odpočinku dostane George', detail: 'Konkrétní závazek pro třetí den, i když ho budete potřebovat jinde.' }, { id: 'no_rest', title: 'Teď žádný odpočinek neslíbíme', detail: 'Práci budete moci měnit, ale soudržnost klesne o jeden stupeň.' }] },
      3: { title: 'Člun už máme', speaker: 'Thomas Musgrave', text: '„Velká loď potřebuje nástroj, který nemáme. Na břehu ale leží člun. Začneme tím, co skutečně dokážeme?“',
        choices: [{ id: 'boat', title: 'Připravit přestavbu člunu', detail: 'Změníte projekt. Čtyři prkna připravená pro větší loď se vrátí do zásoby.' }, { id: 'defer', title: 'Dát původnímu plánu ještě den', detail: 'Rozhodnutí odložíte. Do konce kapitoly pak zbude méně času na nový projekt.' }] },
      4: { title: s.project === 'boat' ? 'Práce, která zůstala' : 'Poslední den na změnu', speaker: 'Henry Forgés', text: s.project === 'boat' ? '„Nejdřív jsme viděli nepovedený nástroj. Teď víme, na čem můžeme dál pracovat. Zítra potřebujeme všechny u stolu.“' : '„Zásoby a ruce nejsou bez konce. Co budeme skutečně dělat zítra?“',
        choices: s.project === 'boat' ? [{ id: 'credit', title: 'Uznat práci všech a dokončit přípravu', detail: 'Soudržnost se zlepší o jeden stupeň. Stále musíte zajistit jídlo a odpočinek.' }, { id: 'rest_tired_final', title: `Slíbit odpočinek: ${person.name}`, detail: 'Pátý den mu dopřejete alespoň jednu směnu volna.' }] : [{ id: 'boat', title: 'Přejít k člunu', detail: 'Zbývají dvě směny. Příprava potřebuje celkem šest pracovních bodů.' }, { id: 'persist', title: 'Pokračovat ve větší lodi', detail: 'Přijmete, že závěr tohoto pokusu může skončit bez použitelného plánu úniku.' }] }
    };
    return { ...data[s.council], day: s.council };
  }
  function chooseCouncil(s, id) {
    const c = getCouncil(s);
    if (!c || !c.choices.some(x => x.id === id)) throw new Error('Neplatná volba večerní dohody.');
    const n = copy(s), day = s.council;
    const addRest = (who, targetDay) => n.promises.push({ type:'rest', person:who, day:targetDay, fulfilled:false, status:'active', label:`${PEOPLE.find(p=>p.id===who).name}: jedna směna odpočinku, den ${targetDay}.` });
    if (id === 'one_trial' || id === 'pause') n.promises.push({ type:'trial_limit', limit:id === 'pause' ? 0 : 1, used:0, day:2, status:'active', label:id === 'pause' ? 'Druhý den bez zkoušek vrtáku.' : 'Druhý den nejvýš jedna zkouška vrtáku.' });
    if (id === 'rest_tired' || id === 'rest_tired_final') addRest([...s.crew].sort((a,b)=>b.fatigue-a.fatigue)[0].id, day + 1);
    if (id === 'rest_george') addRest('george', 3);
    if (['open','no_rest'].includes(id)) n.trust = clamp(n.trust-1,0,4);
    if (id === 'credit') n.trust = clamp(n.trust+1,0,4);
    if (id === 'boat' && n.project !== 'boat') { n.project='boat'; n.timber+=4; }
    const choice = c.choices.find(x=>x.id===id);
    n.log.push({ title:`Večerní dohoda · den ${day}`, text:choice.title + '. ' + choice.detail });
    n.council=null;
    return n;
  }
  function outcome(s) {
    const checks = { learning: s.knowledge >= 1, plan: s.project === 'boat' && s.boat >= 6, strength: s.crew.every(p=>p.fatigue<6), food: s.hardship < 3, trust: s.trust >= 1 };
    const success = Object.values(checks).every(Boolean);
    return { success, checks, title:success ? 'Zítra začneme tím, co máme.' : 'Tenhle plán potřebuje změnu.',
      text:success ? 'Pět lidí zůstává spolu. Máte připravený nový postup a síly pokračovat. Člun ještě není hotový a moře vás teprve čeká.' : 'Tato herní varianta nepřipravila skupinu na další etapu. Můžete se vrátit o směnu nebo zkusit jinak rozdělit práci. Není to skutečný osud historických lidí.' };
  }
  function restoreGame(raw) {
    if (!raw || raw.version !== VERSION || !Number.isInteger(raw.turn) || raw.turn < 0 || raw.turn > 10) return null;
    const numeric=['food','fuel','steel','timber','shelter','trust','trials','knowledge','boat','hardship'];
    if (!numeric.every(k=>Number.isFinite(raw[k]) && raw[k]>=0 && raw[k]<=1000)) return null;
    if (!Array.isArray(raw.crew) || raw.crew.length!==5 || !PEOPLE.every(p=>raw.crew.filter(c=>c.id===p.id && Number.isInteger(c.fatigue) && c.fatigue>=0 && c.fatigue<=6).length===1)) return null;
    if (!['boat','cutter'].includes(raw.project) || !Array.isArray(raw.promises) || !Array.isArray(raw.log) || raw.log.length>100) return null;
    if (raw.council!==null && ![1,2,3,4].includes(raw.council)) return null;
    if (raw.promises.some(p=>!['rest','trial_limit'].includes(p.type) || !['active','kept','broken'].includes(p.status) || ![2,3,5].includes(p.day) || typeof p.label!=='string')) return null;
    if (raw.promises.some(p=>p.type==='rest' ? !PEOPLE.some(x=>x.id===p.person) || typeof p.fulfilled!=='boolean' : ![0,1].includes(p.limit) || !Number.isInteger(p.used) || p.used<0 || p.used>10)) return null;
    if (raw.shelter>4 || raw.trust>4 || raw.knowledge>2 || raw.boat>6 || (raw.turn===10 && !raw.ending) || (raw.turn<10 && raw.ending)) return null;
    if (!raw.log.length || raw.log.some(x=>!x || typeof x.title!=='string' || typeof x.text!=='string')) return null;
    if (raw.council!==null && (raw.turn!==raw.council*2 || raw.turn>=10)) return null;
    const restored=copy(raw);
    if (restored.turn===10) restored.ending=outcome(restored);
    return restored;
  }
  return { VERSION,PEOPLE,TASKS,WEATHER,CHAPTERS,createGame,initialPlan,dayOf,getWeather,fatigueLabel,taskProblem,previewTurn,resolveTurn,getCouncil,chooseCouncil,outcome,restoreGame };
});
