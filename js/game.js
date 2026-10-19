// Math Quest Legends: overworld, dialogs, menus, math battles and saving.
// All player-facing text is kept short and plain for K-3 readers, and can be
// read aloud with the device's built-in voice.
(() => {
  'use strict';

  const W = 160, H = 144, TS = 16, STEP_MS = 170;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const SAVE_KEY = 'mql:save:v1';

  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  const ui = document.getElementById('ui');
  const fadeEl = document.getElementById('fade');

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // ---------------------------------------------------------------- state

  let S = null; // the saved game
  let mode = 'title'; // title | world | battle
  let busy = false; // a script is running in the world
  let B = null; // current battle

  function newState(name, grade) {
    return {
      v: 1, name, grade,
      map: 'house', x: 3, y: 4, dir: 'down',
      party: [], box: [], orbs: 0,
      flags: {}, seen: {}, caught: {}, stats: {},
      voice: grade <= 1,
    };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      return Object.assign(newState(s.name || 'Hero', s.grade || 0), s);
    } catch (e) { return null; }
  }
  function writeSave() {
    if (!S) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode !== 'title') writeSave(); });

  // ---------------------------------------------------------------- creatures

  const maxHp = (c) => SPECIES[c.sp].hp + c.lv * 3;
  const atkOf = (c) => SPECIES[c.sp].atk + c.lv;
  const xpNeed = (lv) => lv * 12;
  const nameOf = (c) => SPECIES[c.sp].name;
  const alive = (c) => c.hp > 0;
  function mon(sp, lv) { const c = { sp, lv, xp: 0, hp: 0 }; c.hp = maxHp(c); return c; }
  function effect(atkType, defType) {
    if ((STRONG[atkType] || []).includes(defType)) return 1.5;
    if ((STRONG[defType] || []).includes(atkType)) return 0.75;
    return 1;
  }
  function damage(power, atk, eff, bonus = 1) {
    return Math.max(1, Math.round((power * atk / 55) * eff * bonus * (0.9 + Math.random() * 0.2)));
  }
  function healAll() { S.party.forEach((c) => { c.hp = maxHp(c); }); }

  // ---------------------------------------------------------------- sound + voice

  let soundOn = true;
  try { soundOn = localStorage.getItem('mql:sound') !== 'off'; } catch (e) { /* ignore */ }
  let actx = null;
  const TUNES = {
    blip: [[1100, 0.03]], move: [[700, 0.035]], select: [[660, 0.05], [990, 0.07]],
    good: [[523, 0.08], [659, 0.08], [784, 0.14]], bad: [[311, 0.12], [233, 0.2]],
    hit: [[180, 0.06], [110, 0.09]], faint: [[440, 0.1], [330, 0.1], [220, 0.22]],
    level: [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.22]],
    catch: [[784, 0.1], [988, 0.1], [1319, 0.28]], wobble: [[392, 0.06]],
    heal: [[523, 0.1], [659, 0.1], [784, 0.1], [659, 0.1], [1047, 0.3]],
  };
  function sfx(name) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      let t = actx.currentTime;
      for (const [f, d] of TUNES[name] || []) {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = 'square';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(actx.destination);
        o.start(t);
        o.stop(t + d + 0.02);
        t += d;
      }
    } catch (e) { /* no audio */ }
  }

  // Turns math symbols into words so the voice reads "3 plus 4 equals what".
  function spoken(text) {
    return text
      .replace(/\p{Extended_Pictographic}|️|🔟|🔹/gu, ' ')
      .replace(/(^|[\s,])\?(?=[\s,]|$)/g, '$1 what ')
      .replace(/−/g, ' minus ').replace(/×/g, ' times ').replace(/÷/g, ' divided by ')
      .replace(/\+/g, ' plus ').replace(/=/g, ' equals ').replace(/☐/g, ' box ')
      .replace(/</g, ' is less than ').replace(/>/g, ' is more than ')
      .replace(/\b(?!XP\b|HP\b)([A-Z])([A-Z]+)\b/g, (m, a, b) => a + b.toLowerCase())
      .replace(/\bLv\b/g, 'level').replace(/\bXP\b/g, 'X P')
      .replace(/\s+/g, ' ').trim();
  }
  function speak(text, force) {
    if (!(force || (S && S.voice)) || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(spoken(text));
      u.rate = 0.9;
      u.pitch = 1.05;
      speechSynthesis.speak(u);
    } catch (e) { /* no voice */ }
  }
  function hush() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* ignore */ } }

  // ---------------------------------------------------------------- input

  let handler = null; // UI that currently owns the buttons
  const held = []; // directions held down, newest last

  let tapped = null; // a direction tapped too quickly to be seen as held

  function press(btn) {
    if (handler) handler(btn);
    else if (mode === 'world') {
      if (DIRS[btn]) tapped = btn;
      worldButton(btn);
    }
  }

  const KEYS = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    z: 'a', ' ': 'a', x: 'b', Escape: 'b', Backspace: 'b', m: 'start',
    1: 'n1', 2: 'n2', 3: 'n3', 4: 'n4',
  };
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const btn = key === 'Enter' ? (handler ? 'a' : 'start') : KEYS[key];
    if (!btn) return;
    e.preventDefault();
    document.body.classList.add('kb');
    if (DIRS[btn] && !held.includes(btn)) held.push(btn);
    if (!e.repeat || handler) press(btn);
  });
  window.addEventListener('keyup', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const i = held.indexOf(KEYS[key]);
    if (i >= 0) held.splice(i, 1);
  });
  window.addEventListener('blur', () => { held.length = 0; });
  window.addEventListener('pointerdown', () => document.body.classList.remove('kb'));

  document.querySelectorAll('[data-btn]').forEach((b) => {
    const btn = b.dataset.btn;
    const release = () => {
      b.classList.remove('on');
      const i = held.indexOf(btn);
      if (i >= 0) held.splice(i, 1);
    };
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { b.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      b.classList.add('on');
      if (DIRS[btn] && !held.includes(btn)) held.push(btn);
      press(btn);
    });
    b.addEventListener('pointerup', release);
    b.addEventListener('pointercancel', release);
    b.addEventListener('lostpointercapture', release);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  // ---------------------------------------------------------------- UI pieces

  const fill = (t) => t.replace(/\{name\}/g, S ? S.name : '');

  let dialogEl = null;
  function showDialog() {
    if (!dialogEl) {
      dialogEl = el('div', 'box dialog');
      dialogEl.append(el('div', 'txt'), el('div', 'more', '▼'));
      dialogEl.addEventListener('pointerdown', (e) => {
        if (dialogEl && dialogEl.dataset.wait === '1') { e.preventDefault(); press('a'); }
      });
      ui.append(dialogEl);
    }
    return dialogEl;
  }
  function hideDialog() { if (dialogEl) { dialogEl.remove(); dialogEl = null; } }

  function sayLine(text) {
    return new Promise((res) => {
      const box = showDialog();
      const txt = box.querySelector('.txt');
      const full = fill(text);
      let i = 0;
      box.classList.remove('done', 'split');
      box.dataset.wait = '1';
      txt.textContent = '';
      speak(full);
      const finish = () => { i = full.length; txt.textContent = full; clearInterval(tm); box.classList.add('done'); };
      const tm = setInterval(() => {
        i += 1;
        txt.textContent = full.slice(0, i);
        if (i >= full.length) finish();
      }, 22);
      handler = (btn) => {
        if (btn !== 'a' && btn !== 'b') return;
        if (i < full.length) return finish();
        handler = null;
        box.dataset.wait = '0';
        sfx('blip');
        res();
      };
    });
  }
  async function say(lines, opts = {}) {
    for (const line of [].concat(lines)) await sayLine(line);
    if (!opts.keep) hideDialog();
  }

  // A list of choices. Items are strings or { label, sub, icon, dim }.
  // Resolves to the chosen index, or -1 when cancelled with B.
  function choose(items, opts = {}) {
    const { cancel = true, cols = 1, cls = '', start = 0, head } = opts;
    return new Promise((res) => {
      const box = el('div', 'box menu ' + cls);
      box.style.setProperty('--cols', cols);
      if (head) { const h = el('div', 'head', head); h.style.gridColumn = '1 / -1'; box.append(h); }
      let sel = Math.min(start, items.length - 1);
      const done = (i) => { handler = null; box.remove(); sfx(i < 0 ? 'blip' : 'select'); res(i); };
      const els = items.map((it, i) => {
        const o = typeof it === 'string' ? { label: it } : it;
        const b = el('button', 'item');
        if (o.icon) { const img = el('img'); img.src = o.icon; img.alt = ''; b.append(img); }
        const span = el('span', null, fill(o.label));
        if (o.sub) span.append(el('small', null, o.sub));
        b.append(span);
        if (o.dim) b.classList.add('dim');
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); done(i); });
        box.append(b);
        return b;
      });
      const draw = () => {
        els.forEach((b, i) => b.classList.toggle('sel', i === sel));
        els[sel].scrollIntoView({ block: 'nearest' });
      };
      ui.append(box);
      draw();
      handler = (btn) => {
        const n = items.length;
        if (btn === 'up') sel = (sel - cols + n) % n;
        else if (btn === 'down') sel = (sel + cols) % n;
        else if (btn === 'left' && cols > 1) sel = (sel - 1 + n) % n;
        else if (btn === 'right' && cols > 1) sel = (sel + 1) % n;
        else if (btn === 'a') return done(sel);
        else if (btn === 'b' && cancel) return done(-1);
        else return;
        sfx('move');
        draw();
      };
    });
  }

  async function yesNo(question) {
    await say(question, { keep: true });
    const i = await choose(['Yes', 'No']);
    hideDialog();
    return i === 0;
  }

  // Shows a math problem. Resolves to { correct, ms }.
  let currentProblem = null;
  function ask(p) {
    currentProblem = p;
    return new Promise((res) => {
      const box = el('div', 'box quiz' + (p.visual ? ' has-vis' : ''));
      const top = el('div', 'tag', p.tag || '');
      top.append(' ');
      if (window.speechSynthesis) {
        const hear = el('span', 'hear', '🔊');
        hear.setAttribute('role', 'button');
        hear.setAttribute('aria-label', 'Read the question out loud');
        hear.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); speak(`${p.text} ${p.tag || ''}`, true); });
        top.append(hear);
      }
      box.append(top);
      const q = el('div', 'q' + (p.text.length > 16 ? ' long' : ''), p.text);
      box.append(q);
      if (p.visual) box.append(el('div', 'vis', p.visual));
      const grid = el('div', 'answers' + (p.choices.length === 3 ? ' three' : ''));
      box.append(grid);
      let sel = 0, locked = false;
      const t0 = performance.now();
      const btns = p.choices.map((c, i) => {
        const b = el('button', 'ans', String(c));
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); choosePick(i); });
        grid.append(b);
        return b;
      });
      const draw = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
      async function choosePick(i) {
        if (locked) return;
        locked = true;
        handler = null;
        hush();
        const ms = performance.now() - t0;
        const correct = p.choices[i] === p.answer;
        btns.forEach((b) => b.classList.remove('sel'));
        btns[i].classList.add(correct ? 'right' : 'wrong');
        if (!correct) btns[p.choices.indexOf(p.answer)].classList.add('right');
        sfx(correct ? 'good' : 'bad');
        await sleep(correct ? 600 : 1300);
        box.remove();
        res({ correct, ms });
      }
      ui.append(box);
      draw();
      speak(`${p.text} ${p.tag || ''}`);
      handler = (btn) => {
        const n = btns.length;
        if (btn === 'left') sel = (sel + n - 1) % n;
        else if (btn === 'right') sel = (sel + 1) % n;
        else if (btn === 'up') sel = n === 4 ? (sel + 2) % 4 : (sel + n - 1) % n;
        else if (btn === 'down') sel = n === 4 ? (sel + 2) % 4 : (sel + 1) % n;
        else if (btn === 'a') return choosePick(sel);
        else if (/^n[1-4]$/.test(btn)) { const i = Number(btn[1]) - 1; if (i < n) choosePick(i); return; }
        else return;
        sfx('move');
        draw();
      };
    });
  }

  // A read-only page (info, progress). Closes on A, B or a tap.
  function panel(build) {
    return new Promise((res) => {
      const box = el('div', 'box panel');
      build(box);
      box.append(el('div', 'hint', 'Tap or press A to close'));
      const close = () => { handler = null; box.remove(); sfx('blip'); res(); };
      box.addEventListener('pointerdown', (e) => { e.preventDefault(); close(); });
      ui.append(box);
      handler = (btn) => { if (btn === 'a' || btn === 'b') close(); };
    });
  }

  function popCreature(id) {
    const box = el('div', 'box pop');
    const img = el('img');
    img.src = Art.creatureURL(id);
    img.alt = SPECIES[id].name;
    box.append(img);
    ui.append(box);
    return () => box.remove();
  }

  async function fade(fn) {
    fadeEl.classList.add('on');
    await sleep(230);
    await fn();
    await sleep(80);
    fadeEl.classList.remove('on');
    await sleep(230);
  }

  // ---------------------------------------------------------------- world

  const P = { x: 0, y: 0, px: 0, py: 0, dir: 'down', moving: false, fx: 0, fy: 0, tx: 0, ty: 0, t: 0, step: 0 };
  const map = () => MAPS[S.map];

  function tileAt(x, y) {
    const t = map().tiles;
    if (y < 0 || y >= t.length || x < 0 || x >= t[0].length) return null;
    return t[y][x];
  }
  function npcAt(x, y) { return map().npcs.find((n) => n.x === x && n.y === y); }
  function blocked(x, y) {
    const t = tileAt(x, y);
    return t === null || SOLID.has(t) || !!npcAt(x, y);
  }
  function placePlayer(mapId, x, y, dir) {
    S.map = mapId; S.x = x; S.y = y;
    if (dir) S.dir = dir;
    Object.assign(P, { x, y, px: x * TS, py: y * TS, dir: S.dir, moving: false });
  }
  function startStep(nx, ny) {
    Object.assign(P, { moving: true, t: 0, fx: P.x, fy: P.y, tx: nx, ty: ny });
  }

  function updateWorld(dt) {
    if (P.moving) {
      P.t += dt;
      const k = Math.min(1, P.t / STEP_MS);
      P.px = (P.fx + (P.tx - P.fx) * k) * TS;
      P.py = (P.fy + (P.ty - P.fy) * k) * TS;
      if (k >= 1) {
        P.moving = false;
        P.x = S.x = P.tx;
        P.y = S.y = P.ty;
        P.step++;
        arrived();
      }
      return;
    }
    if (busy || handler) { tapped = null; return; }
    const d = held[held.length - 1] || tapped;
    tapped = null;
    if (!d) return;
    P.dir = S.dir = d;
    const [dx, dy] = DIRS[d];
    if (!blocked(P.x + dx, P.y + dy)) startStep(P.x + dx, P.y + dy);
  }

  async function arrived() {
    const m = map();
    const w = m.warps.find((v) => v.x === P.x && v.y === P.y);
    if (w) {
      busy = true;
      if (w.need && !S.flags[w.need]) {
        await runScript(w.block);
        const [dx, dy] = DIRS[P.dir];
        startStep(P.x - dx, P.y - dy);
      } else {
        sfx('move');
        await fade(() => { placePlayer(w.to, w.tx, w.ty, w.dir); writeSave(); });
      }
      busy = false;
      return;
    }
    if (tileAt(P.x, P.y) === ',' && m.wild && S.party.some(alive) && Math.random() < 0.13) {
      busy = true;
      await wildBattle();
      busy = false;
    }
  }

  function worldButton(btn) {
    if (busy || P.moving) return;
    if (btn === 'a') interact();
    else if (btn === 'start') openMenu();
  }

  async function interact() {
    const [dx, dy] = DIRS[P.dir];
    const x = P.x + dx, y = P.y + dy;
    let n = npcAt(x, y);
    if (!n && tileAt(x, y) === 'c') n = npcAt(x + dx, y + dy); // talk across a counter
    const t = tileAt(x, y);
    const sign = map().signs[`${x},${y}`];
    if (!n && !sign && !(t && '123'.includes(t))) return;
    busy = true;
    try {
      if (n) {
        n.dir = OPPOSITE[P.dir];
        await runScript(n.script);
      } else if (sign) {
        await say(sign);
      } else {
        await runScript('starter', Number(t));
      }
    } finally {
      busy = false;
    }
  }

  function drawWorld() {
    const m = map();
    const camX = Math.round(P.px) - 72, camY = Math.round(P.py) - 64;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const x0 = Math.floor(camX / TS), y0 = Math.floor(camY / TS);
    for (let ty = y0; ty <= y0 + 9; ty++) {
      for (let tx = x0; tx <= x0 + 10; tx++) {
        const img = Art.tile(tileAt(tx, ty) ?? m.border);
        if (img) ctx.drawImage(img, tx * TS - camX, ty * TS - camY);
      }
    }
    const ents = m.npcs.map((n) => ({ y: n.y * TS, img: Art.person(LOOKS[n.look], n.dir, 0), x: n.x * TS }));
    const frame = P.moving && P.t < STEP_MS * 0.6 ? 1 + (P.step % 2) : 0;
    ents.push({ y: P.py, x: Math.round(P.px), img: Art.person(LOOKS.hero, P.dir, frame), hero: true });
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) ctx.drawImage(e.img, e.x - camX, Math.round(e.y) - camY - 3);
    // Tall grass hides the hero's feet.
    if (!P.moving && tileAt(P.x, P.y) === ',') {
      ctx.drawImage(Art.tile(','), 0, 9, 16, 7, P.x * TS - camX, P.y * TS - camY + 9, 16, 7);
    }
  }

  // ---------------------------------------------------------------- scripts

  async function runScript(name, arg) {
    const fn = SCRIPTS[name];
    if (fn) await fn(arg);
  }

  const SCRIPTS = {
    mom: () => say(S.flags.starter
      ? ['Your team looks happy!', 'If they get tired, go to the Rest Center.', 'It has a pink roof.']
      : ['Good morning, {name}!', 'Professor Pi wants to see you.', 'The lab has a blue roof.']),

    prof: () => {
      if (!S.flags.starter) return say(['Hi, {name}! I am Professor Pi.', 'Legends get strong when you do math.', 'Pick a partner from my table!']);
      if (!S.flags.badge1) return say(['Ranger Rowan is at the end of Route 1.', 'Beat Rowan to win a badge!', 'Tip: a fast answer gives extra power.']);
      return say(['You got the Sum Badge! Great job!', 'Route 2 will open soon.']);
    },

    async starter(n) {
      const id = STARTERS[n - 1], sp = SPECIES[id];
      if (S.flags.starter) {
        await say(S.party.some((c) => c.sp === id) || S.box.some((c) => c.sp === id)
          ? `This is where ${sp.name} came from!`
          : `Professor Pi takes care of this ${sp.name}.`);
        return;
      }
      const close = popCreature(id);
      const ok = await yesNo([
        `This is ${sp.name}!`,
        `It is a ${TYPES[sp.type].name} Legend.`,
        `Its math: ${sp.moves.map((m) => TOPICS[m.topic].toLowerCase()).join(' and ')}.`,
        `Do you want ${sp.name}?`,
      ]);
      if (!ok) { close(); return; }
      S.party.push(mon(id, 5));
      S.flags.starter = true;
      STARTERS.forEach((s) => { S.seen[s] = true; });
      S.caught[id] = true;
      S.orbs = 5;
      sfx('catch');
      await say([`You picked ${sp.name}!`]);
      close();
      await say([
        'PROF. PI: Great choice!',
        'Here are 5 Quest Orbs.',
        'Use them to catch wild Legends.',
        'Make a Legend weak first. Then throw an orb!',
        'Route 1 is north of town. Have fun!',
      ]);
      writeSave();
    },

    nurse: async () => {
      await say(['Welcome to the Rest Center!', 'Let me help your team.']);
      healAll();
      sfx('heal');
      await sleep(900);
      const lines = ['Your team feels great now!'];
      if (S.flags.starter && S.orbs < 5) { S.orbs = 5; lines.push('I gave you more Quest Orbs, too.'); }
      lines.push('Come back any time!');
      await say(lines);
      writeSave();
    },

    kid: () => say(S.flags.starter
      ? ['Press MENU to see your team.', 'You can pick who goes first!']
      : ['Wild Legends hide in tall grass.', 'You need a Legend to go there.']),

    kidBlock: () => say(['Wait! Stop!', 'Wild Legends are in the tall grass.', 'Get a Legend from Professor Pi first.']),

    girl: () => say(['Did you get one wrong? That is OK!', 'The game shows you the right answer.', 'Then you know it next time!']),

    hiker: () => say(['Answer fast for a stronger hit!', 'But getting it right is the most important.']),

    routeKid: () => say(['Weak Legends are easy to catch.', 'Lower their HP first.', 'Then throw a Quest Orb!']),

    ranger: async () => {
      if (S.flags.badge1) return say(['Great job, {name}!', 'Keep training your team!']);
      await say(['I am Ranger Rowan.', 'I keep Route 2 safe.', 'Show me your math power!']);
      const result = await battle([mon('hootsum', 5), mon('gridrex', 6)], { trainer: 'Ranger Rowan' });
      if (result === 'win') {
        S.flags.badge1 = true;
        S.orbs += 3;
        sfx('level');
        await say(['RANGER ROWAN: Wow! You are strong!', 'Here is the Sum Badge!', 'And take 3 Quest Orbs.', 'Route 2 is not ready yet.', 'Come back soon for more!']);
        writeSave();
      }
    },
  };

  // ---------------------------------------------------------------- battle

  function hud(side) {
    const box = el('div', 'box hud ' + side);
    const nm = el('div', 'nm');
    nm.append(el('span', 'n'), el('span', 'lv'));
    const bar = el('div', 'bar');
    bar.append(el('span', null, 'HP'));
    const hp = el('div', 'hp');
    hp.append(el('i'));
    bar.append(hp);
    const xp = el('div', 'xp');
    xp.append(el('i'));
    box.append(nm, bar, el('div', 'hpn'), xp);
    ui.append(box);
    return box;
  }
  function updHud() {
    for (const [box, c] of [[B.eh, B.enemy], [B.ph, B.me]]) {
      const m = maxHp(c), f = Math.max(0, c.hp) / m;
      box.querySelector('.n').textContent = nameOf(c);
      box.querySelector('.lv').textContent = 'Lv ' + c.lv;
      const bar = box.querySelector('.hp i');
      bar.style.width = f * 100 + '%';
      bar.style.backgroundColor = f > 0.5 ? '#4cc760' : f > 0.2 ? '#f2c84b' : '#e8506a';
      box.querySelector('.hpn').textContent = `${Math.max(0, c.hp)} / ${m}`;
      box.querySelector('.xp i').style.width = Math.min(100, (c.xp / xpNeed(c.lv)) * 100) + '%';
    }
  }

  function drawBattle(now) {
    ctx.fillStyle = '#f8f4e8';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#eef0d8';
    ctx.fillRect(0, 40, W, 60);
    ctx.drawImage(Art.platform(32, 8), 92, 48);
    ctx.drawImage(Art.platform(34, 8), 4, 84);
    const bob = Math.round(Math.sin(now / 300));
    const fe = B.fx.e, fp = B.fx.p;
    if (!fe.hide) ctx.drawImage(Art.creature(B.enemy.sp), 100 + fe.dx, 8 + fe.dy);
    if (!fp.hide) {
      ctx.save();
      ctx.translate(14 + 48 + fp.dx, 44 + fp.dy + (B.idle ? bob : 0));
      ctx.scale(-1, 1);
      ctx.drawImage(Art.creature(B.me.sp), 0, 0);
      ctx.restore();
    }
    if (B.orb) ctx.drawImage(Art.questOrb(), Math.round(B.orb.x) - 6, Math.round(B.orb.y) - 6);
  }

  async function lunge(who) {
    B.fx[who].dx = who === 'p' ? 8 : -8;
    await sleep(110);
    B.fx[who].dx = 0;
    await sleep(80);
  }
  async function flash(who) {
    for (let i = 0; i < 3; i++) {
      B.fx[who].hide = true; await sleep(70);
      B.fx[who].hide = false; await sleep(70);
    }
  }
  async function faintAnim(who) {
    sfx('faint');
    for (let i = 0; i <= 8; i++) { B.fx[who].dy = i * 6; await sleep(30); }
    B.fx[who].hide = true;
    B.fx[who].dy = 0;
  }
  async function hurt(c, n, who) {
    await lunge(who === 'e' ? 'p' : 'e');
    sfx('hit');
    await flash(who);
    c.hp = Math.max(0, c.hp - n);
    updHud();
    await sleep(500);
  }

  function record(topic, correct) {
    const s = S.stats[topic] || (S.stats[topic] = [0, 0]);
    if (correct) s[0]++;
    s[1]++;
  }
  // Time limit for the "so fast" bonus. Slow answers are never punished.
  function fastLimit(topic) {
    return [9000, 8000, 9000, 8000][S.grade] + (['add', 'sub'].includes(topic) && S.grade >= 2 ? 5000 : 0);
  }

  async function encounterFlash() {
    sfx('select');
    for (let i = 0; i < 3; i++) {
      fadeEl.classList.add('flash'); await sleep(80);
      fadeEl.classList.remove('flash'); await sleep(80);
    }
  }

  async function battle(foes, opts = {}) {
    await encounterFlash();
    await fade(() => {
      mode = 'battle';
      B = {
        foes, ei: 0, enemy: foes[0], me: S.party.find(alive), trainer: opts.trainer || null,
        fx: { e: { dx: 0, dy: 0, hide: false }, p: { dx: 0, dy: 0, hide: false } }, orb: null, idle: true,
      };
      foes.forEach((f) => { S.seen[f.sp] = true; });
      B.eh = hud('enemy');
      B.ph = hud('me');
      updHud();
    });
    if (B.trainer) await say([`${B.trainer} wants to battle!`, `${B.trainer} sends out ${nameOf(B.enemy)}!`]);
    else await say(`A wild ${nameOf(B.enemy)} jumped out!`);
    await say(`Go, ${nameOf(B.me)}!`);

    let result = null;
    while (!result) result = await turn();

    await fade(() => {
      B.eh.remove();
      B.ph.remove();
      hideDialog();
      B = null;
      mode = 'world';
      if (result === 'lose') { healAll(); placePlayer('center', 3, 3, 'up'); }
    });
    if (result === 'lose') {
      await say(['NURSE ADA: Your team feels great now!', 'Wrong answers help you learn.', 'You can do it. Try again!']);
    }
    writeSave();
    return result;
  }

  const foeName = () => `${B.trainer ? '' : 'Wild '}${nameOf(B.enemy)}`;

  async function turn() {
    B.idle = true;
    await say(`What will ${nameOf(B.me)} do?`, { keep: true });
    dialogEl.classList.add('split');
    const act = await choose(['ATTACK', 'TEAM', 'ORB', 'RUN'], { cancel: false, cols: 2, cls: 'battle-menu' });
    B.idle = false;
    if (act === 0) return attack();
    if (act === 1) return switchTeam();
    if (act === 2) return throwOrb();
    hideDialog();
    if (B.trainer) { await say('You can\'t run from this battle!'); return null; }
    sfx('move');
    await say('You got away!');
    return 'run';
  }

  async function attack() {
    const sp = SPECIES[B.me.sp];
    const mi = await choose(sp.moves.map((m) => ({ label: m.name, sub: TOPICS[m.topic] })), { cls: 'battle-menu moves' });
    hideDialog();
    if (mi < 0) return null;
    const move = sp.moves[mi];
    await say(`${nameOf(B.me)} uses ${move.name}!`);
    const p = MathGen.make(move.topic, S.grade);
    const r = await ask(p);
    record(move.topic, r.correct);
    if (r.correct) {
      const fast = r.ms < fastLimit(move.topic);
      const eff = effect(sp.type, SPECIES[B.enemy.sp].type);
      await hurt(B.enemy, damage(move.power, atkOf(B.me), eff, fast ? 1.5 : 1), 'e');
      const lines = ['Correct!'];
      if (fast) lines.push('So fast! Extra power!');
      if (eff > 1) lines.push('It is super strong!');
      if (eff < 1) lines.push('It is not very strong.');
      await say(lines);
    } else {
      await say(['Not quite.', p.explain, 'The attack missed!']);
    }
    if (!alive(B.enemy)) return foeFainted();
    return foeTurn(r.correct);
  }

  async function switchTeam() {
    hideDialog();
    const i = await teamPicker('Who goes in?');
    if (i < 0 || S.party[i] === B.me) return null;
    const c = S.party[i];
    if (!alive(c)) { await say(`${nameOf(c)} is too tired.`); return null; }
    await say(`Come back, ${nameOf(B.me)}!`);
    B.me = c;
    B.fx.p.hide = false;
    updHud();
    await say(`Go, ${nameOf(B.me)}!`);
    return foeTurn(true);
  }

  async function throwOrb() {
    hideDialog();
    if (B.trainer) { await say('You can\'t catch someone else\'s Legend!'); return null; }
    if (S.orbs <= 0) { await say(['You have no Quest Orbs left.', 'Get more at the Rest Center.']); return null; }
    S.orbs--;
    await say(['You throw a Quest Orb!', 'Answer right to power it up!']);
    const topic = pick(SPECIES[B.enemy.sp].moves).topic;
    const p = MathGen.make(topic, S.grade);
    const r = await ask(p);
    record(topic, r.correct);

    // fly the orb to the enemy
    for (let i = 0; i <= 12; i++) {
      const k = i / 12;
      B.orb = { x: 50 + (124 - 50) * k, y: 80 + (30 - 80) * k - Math.sin(k * Math.PI) * 30 };
      await sleep(25);
    }
    if (!r.correct) {
      B.orb = null;
      await say(['The orb did not work.', p.explain]);
      return foeTurn(false);
    }
    B.fx.e.hide = true;
    B.orb.y = 44;
    const ratio = B.enemy.hp / maxHp(B.enemy);
    const caught = Math.random() < Math.min(0.95, 0.3 + 0.7 * (1 - ratio));
    const wobbles = caught ? 3 : rnd(1, 2);
    for (let i = 0; i < wobbles; i++) {
      await sleep(350);
      sfx('wobble');
      B.orb.x += 3; await sleep(90);
      B.orb.x -= 6; await sleep(90);
      B.orb.x += 3;
    }
    await sleep(300);
    if (caught) {
      sfx('catch');
      const c = B.enemy;
      S.caught[c.sp] = true;
      await say(`You caught ${nameOf(c)}!`);
      if (S.party.length < 6) S.party.push(c);
      else { S.box.push(c); await say(['Your team is full.', `${nameOf(c)} went to Professor Pi's lab.`]); }
      B.orb = null;
      return 'catch';
    }
    B.orb = null;
    B.fx.e.hide = false;
    await say('Oh no! It got out!');
    return foeTurn(true);
  }

  // The foe attacks. A correct answer this turn means our Legend was ready
  // and only takes half the hit.
  async function foeTurn(ready) {
    const e = B.enemy, sp = SPECIES[e.sp];
    const mv = pick(sp.moves);
    await say(`${foeName()} uses ${mv.name}!`);
    const eff = effect(sp.type, SPECIES[B.me.sp].type);
    await hurt(B.me, Math.max(1, Math.round(damage(mv.power, atkOf(e), eff) * (ready ? 0.5 : 1))), 'p');
    if (eff > 1) await say('It is super strong!');
    if (alive(B.me)) return null;

    await faintAnim('p');
    await say(`${nameOf(B.me)} is too tired to fight!`);
    if (!S.party.some(alive)) {
      await say(['Your whole team is tired.', 'You run back to the Rest Center.']);
      return 'lose';
    }
    let i = await teamPicker('Pick another Legend.', false, S.party.findIndex(alive));
    while (!alive(S.party[i])) {
      await say(`${nameOf(S.party[i])} is too tired.`);
      i = await teamPicker('Pick another Legend.', false, S.party.findIndex(alive));
    }
    B.me = S.party[i];
    B.fx.p.hide = false;
    updHud();
    await say(`Go, ${nameOf(B.me)}!`);
    return null;
  }

  async function foeFainted() {
    await faintAnim('e');
    await say(`${foeName()} is too tired to fight!`);
    const gain = Math.round(B.enemy.lv * 6 * (B.trainer ? 1.5 : 1));
    await gainXp(B.me, gain);
    B.ei++;
    if (B.ei < B.foes.length) {
      B.enemy = B.foes[B.ei];
      B.fx.e = { dx: 0, dy: 0, hide: false };
      updHud();
      await say(`${B.trainer} sends out ${nameOf(B.enemy)}!`);
      return null;
    }
    if (B.trainer) await say(`You beat ${B.trainer}!`);
    return 'win';
  }

  async function gainXp(c, n) {
    c.xp += n;
    updHud();
    await say(`${nameOf(c)} got ${n} XP!`);
    while (c.xp >= xpNeed(c.lv)) {
      c.xp -= xpNeed(c.lv);
      c.lv++;
      c.hp = Math.min(maxHp(c), c.hp + 3);
      updHud();
      sfx('level');
      await say(`${nameOf(c)} is now level ${c.lv}!`);
    }
  }

  async function wildBattle() {
    const table = map().wild;
    let roll = Math.random(), entry = table[table.length - 1];
    for (const w of table) { if ((roll -= w.p) <= 0) { entry = w; break; } }
    await battle([mon(entry.sp, rnd(entry.min, entry.max))]);
  }

  // ---------------------------------------------------------------- menus

  function teamItems() {
    return S.party.map((c) => ({
      label: `${nameOf(c)}  Lv ${c.lv}`,
      sub: alive(c) ? `HP ${c.hp} / ${maxHp(c)}` : 'Too tired',
      icon: Art.creatureURL(c.sp),
      dim: !alive(c),
    }));
  }
  function teamPicker(head, cancel = true, start = 0) {
    return choose(teamItems(), { cls: 'full', head, cancel, start });
  }

  function creatureInfo(c) {
    const sp = SPECIES[c.sp];
    return panel((box) => {
      const img = el('img', 'pic');
      img.src = Art.creatureURL(c.sp);
      img.alt = '';
      box.append(img, el('h3', null, sp.name));
      box.append(el('p', null, `${TYPES[sp.type].name} Legend · Level ${c.lv}`));
      box.append(el('p', null, `HP ${c.hp} / ${maxHp(c)}`));
      box.append(el('p', null, `XP ${c.xp} / ${xpNeed(c.lv)}`));
      for (const m of sp.moves) {
        const r = el('div', 'row');
        r.append(el('span', null, m.name), el('span', null, TOPICS[m.topic]));
        box.append(r);
      }
      box.append(el('p', null, sp.dex));
    });
  }

  async function teamMenu() {
    if (!S.party.length) { await say('You have no Legends yet.'); return; }
    for (;;) {
      const i = await teamPicker('Your team');
      if (i < 0) return;
      const c = S.party[i];
      const a = await choose(['Look', 'Go first', 'Back'], { cls: 'start-menu' });
      if (a === 0) await creatureInfo(c);
      if (a === 1 && i > 0) {
        S.party.splice(i, 1);
        S.party.unshift(c);
        await say(`${nameOf(c)} will go first!`);
      }
    }
  }

  async function dexMenu() {
    const count = DEX_ORDER.filter((id) => S.caught[id]).length;
    for (;;) {
      const items = DEX_ORDER.map((id) => {
        const seen = S.seen[id] || S.caught[id];
        return {
          label: seen ? SPECIES[id].name : '???',
          sub: S.caught[id] ? 'Caught!' : seen ? 'Seen' : 'Not found yet',
          icon: seen ? Art.creatureURL(id) : undefined,
          dim: !seen,
        };
      });
      const i = await choose(items, { cls: 'full', head: `Legendex: ${count} of ${DEX_ORDER.length} caught` });
      if (i < 0) return;
      const id = DEX_ORDER[i];
      if (!(S.seen[id] || S.caught[id])) { await say('You have not found this one yet.'); continue; }
      const sp = SPECIES[id];
      await panel((box) => {
        const img = el('img', 'pic');
        img.src = Art.creatureURL(id);
        img.alt = '';
        box.append(img, el('h3', null, sp.name), el('p', null, `${TYPES[sp.type].name} Legend`));
        box.append(el('p', null, `Math: ${sp.moves.map((m) => TOPICS[m.topic].toLowerCase()).join(', ')}`));
        box.append(el('p', null, sp.dex));
      });
    }
  }

  function progressPage() {
    return panel((box) => {
      box.append(el('h3', null, 'For grown-ups'));
      box.append(el('p', null, `${S.name} · ${GRADES[S.grade]}`));
      const topics = Object.keys(TOPICS).filter((t) => S.stats[t]);
      if (!topics.length) box.append(el('p', null, 'No answers yet. Progress shows up here after a few battles.'));
      let right = 0, total = 0;
      for (const t of topics) {
        const [ok, n] = S.stats[t];
        right += ok; total += n;
        const r = el('div', 'row');
        r.append(el('span', null, TOPICS[t]), el('span', null, `${ok} / ${n} right (${Math.round((ok / n) * 100)}%)`));
        box.append(r);
      }
      if (total) {
        const r = el('div', 'row');
        r.style.fontWeight = '600';
        r.append(el('span', null, 'All'), el('span', null, `${right} / ${total} right (${Math.round((right / total) * 100)}%)`));
        box.append(r);
      }
      box.append(el('p', null, `Legends caught: ${DEX_ORDER.filter((id) => S.caught[id]).length} · Badges: ${S.flags.badge1 ? 1 : 0}`));
    });
  }

  async function settingsMenu() {
    for (;;) {
      const i = await choose([
        `Grade: ${GRADES[S.grade]}`,
        `Read aloud: ${S.voice ? 'On' : 'Off'}`,
        `Sound: ${soundOn ? 'On' : 'Off'}`,
        'Back',
      ], { cls: 'start-menu' });
      if (i === 0) {
        const g = await choose(GRADES, { cls: 'start-menu', start: S.grade });
        if (g >= 0) S.grade = g;
      } else if (i === 1) {
        S.voice = !S.voice;
        if (S.voice) speak('Read aloud is on.');
        else hush();
      } else if (i === 2) {
        soundOn = !soundOn;
        try { localStorage.setItem('mql:sound', soundOn ? 'on' : 'off'); } catch (e) { /* ignore */ }
      } else {
        writeSave();
        return;
      }
    }
  }

  async function openMenu() {
    busy = true;
    sfx('select');
    let i = 0;
    for (;;) {
      i = await choose(['Team', 'Legendex', 'Bag', 'Grown-ups', 'Settings', 'Save', 'Close'], { cls: 'start-menu', start: Math.max(0, i) });
      if (i === 0) await teamMenu();
      else if (i === 1) await dexMenu();
      else if (i === 2) await say([`Quest Orbs: ${S.orbs}`, S.flags.badge1 ? 'Badges: Sum Badge' : 'Badges: none yet']);
      else if (i === 3) await progressPage();
      else if (i === 4) await settingsMenu();
      else if (i === 5) { writeSave(); await say('Your game is saved!'); }
      else break;
    }
    busy = false;
  }

  // ---------------------------------------------------------------- title + new game

  function drawTitle(now) {
    const off = Math.floor(now / 70) % TS;
    for (let ty = -1; ty < 10; ty++) {
      for (let tx = -1; tx < 11; tx++) {
        const ch = (tx + ty) % 4 === 0 ? ',' : (tx * 7 + ty * 3) % 11 === 0 ? 'f' : '.';
        ctx.drawImage(Art.tile(ch), tx * TS + off, ty * TS + (off >> 1));
      }
    }
    STARTERS.forEach((id, i) => {
      const bob = Math.round(Math.sin(now / 280 + i * 2) * 2);
      ctx.drawImage(Art.platform(22, 5), 4 + i * 52 + 2, 90);
      ctx.drawImage(Art.creature(id), 4 + i * 52, 50 + bob);
    });
  }

  function askName() {
    return new Promise((res) => {
      const box = el('form', 'box namebox');
      box.append(el('label', null, 'What is your name?'));
      const input = el('input');
      input.maxLength = 10;
      input.autocomplete = 'off';
      input.setAttribute('aria-label', 'Your name');
      const ok = el('button', 'ok', 'OK');
      ok.type = 'submit';
      box.append(input, ok);
      box.addEventListener('submit', (e) => {
        e.preventDefault();
        input.blur();
        handler = null;
        box.remove();
        sfx('select');
        res(input.value.trim().replace(/\s+/g, ' ').slice(0, 10) || 'Hero');
      });
      ui.append(box);
      handler = (btn) => { if (btn === 'a') box.requestSubmit(); };
      // Wait for the key that opened this box to be released, so it isn't typed.
      setTimeout(() => { input.value = ''; input.focus(); }, 200);
      speak('What is your name?', true);
    });
  }

  async function title() {
    mode = 'title';
    const save = loadSave();
    const logo = el('div', 'title');
    const big = el('div', 'logo', 'MATH QUEST');
    big.append(el('span', null, 'LEGENDS'));
    logo.append(big);
    ui.append(logo);
    const i = await choose(save ? ['Continue', 'New Game'] : ['New Game'], { cancel: false, cls: 'title-menu' });
    logo.remove();
    if (save && i === 0) {
      S = save;
      await fade(() => { placePlayer(S.map, S.x, S.y, S.dir); mode = 'world'; });
      return;
    }
    if (save) {
      S = save;
      const sure = await yesNo(['Start a new game?', 'Your old game will be gone.']);
      S = null;
      if (!sure) return title();
    }
    await newGame();
  }

  async function newGame() {
    const name = await askName();
    S = newState(name, 0);
    S.voice = true; // read the intro aloud; the grade picks the default below
    await say(['Hello, {name}!', 'Welcome to Math Quest Legends!', 'Legends are creatures that love math.', 'When you solve problems, they get strong!', 'What grade are you in?'], { keep: true });
    const g = await choose(GRADES, { cancel: false });
    hideDialog();
    S.grade = g;
    S.voice = g <= 1;
    await say(['Great!', 'A grown-up can change this in MENU.', 'Now go see Professor Pi.', 'Walk out the door to start!']);
    await fade(() => { placePlayer('house', 3, 4, 'down'); mode = 'world'; });
    writeSave();
  }

  // ---------------------------------------------------------------- main loop

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last);
    last = now;
    if (mode === 'world') { updateWorld(dt); drawWorld(); }
    else if (mode === 'battle' && B) drawBattle(now);
    else if (mode === 'title') drawTitle(now);
    requestAnimationFrame(frame);
  }

  ctx.imageSmoothingEnabled = false;
  requestAnimationFrame(frame);
  title();

  // Exposed for debugging in the browser console.
  window.MQL = { get state() { return S; }, get problem() { return currentProblem; }, MathGen };
})();
