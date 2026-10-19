// Math Quest Legends: overworld, dialogs, menus, math battles and saving.
// All player-facing text is kept short and plain for K-3 readers, and can be
// read aloud with the device's built-in voice (off by default).
(() => {
  'use strict';

  const W = 160, H = 144, TS = 16, STEP_MS = 170;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const SAVE_KEY = 'mql:save:v2';
  const DAY = 24 * 60 * 60 * 1000;
  // How each kind of puzzle is named in battle: "It loves take-away puzzles!"
  const FAMILY_PHRASE = {
    add: 'adding', sub: 'take-away', compare: 'bigger-number',
    mult: 'equal-groups', div: 'sharing', mixed: 'all kinds of',
  };
  const FAMILY_LABEL = {
    add: 'Adding', sub: 'Taking away', compare: 'Comparing numbers',
    mult: 'Equal groups and times', div: 'Sharing equally', mixed: 'All kinds of math',
  };

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
      v: 2, name, grade,
      map: 'house', x: 3, y: 4, dir: 'down',
      party: [], box: [], sidekick: null,
      flags: {}, seen: {}, caught: {},
      skills: {}, // per math skill: { attempts, correct, ms, n }
      review: [], // missed problems that come back later
      voice: false,
      visited: { town: true }, // places you can quick-travel to
      healMap: 'town', // the last place with a Rest Center
      lastArea: 'meadow', // the last area with wild Legends
      ret: null, // where the Rest Center door leads back to
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
  const buddyName = () => (S.sidekick ? SPECIES[S.sidekick].name : 'Buddy');
  function mon(sp, lv, skill) {
    const c = { sp, lv, xp: 0, hp: 0 };
    if (skill) c.skill = skill;
    c.hp = maxHp(c);
    return c;
  }
  function damage(power, atk, mult = 1) {
    return Math.max(1, Math.round((power * atk / 55) * mult * (0.9 + Math.random() * 0.2)));
  }
  function healAll() { S.party.forEach((c) => { c.hp = maxHp(c); }); }
  function puzzleLabel(sp) {
    const s = SPECIES[sp];
    return s.sidekick ? 'Buddy: helps with every kind of math' : `Puzzles: ${FAMILY_LABEL[s.family]}`;
  }

  // ---------------------------------------------------------------- sound + voice

  let soundOn = true;
  try { soundOn = localStorage.getItem('mql:sound') !== 'off'; } catch (e) { /* ignore */ }
  let actx = null;
  const TUNES = {
    blip: [[1100, 0.03]], move: [[700, 0.035]], select: [[660, 0.05], [990, 0.07]],
    good: [[523, 0.08], [659, 0.08], [784, 0.14]], bad: [[311, 0.12], [233, 0.2]],
    hint: [[880, 0.06], [1175, 0.1]],
    hit: [[180, 0.06], [110, 0.09]], faint: [[440, 0.1], [330, 0.1], [220, 0.22]],
    level: [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.22]],
    friend: [[784, 0.1], [988, 0.1], [1319, 0.28]],
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
      .replace(/\p{Extended_Pictographic}|️|̶/gu, ' ')
      .replace(/(^|[\s,])\?(?=[\s,]|$)/g, '$1 what ')
      .replace(/−/g, ' minus ').replace(/×/g, ' times ').replace(/÷/g, ' divided by ')
      .replace(/\+/g, ' plus ').replace(/=/g, ' equals ')
      .replace(/\b(?!XP\b|HP\b)([A-Z])([A-Z]+)\b/g, (m, a, b) => a + b.toLowerCase())
      .replace(/\bLv\b/g, 'level').replace(/\bXP\b/g, 'X P')
      .replace(/\s+/g, ' ').trim();
  }
  // Browsers often default to a flat, robotic voice even when the device has
  // natural ones installed, so rank the English voices and use the best.
  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|eddy|flo|fred|good news|grandma|grandpa|hysterical|jester|junior|kathy|organ|ralph|reed|rocko|sandy|shelley|superstar|trinoids|whisper|wobble|zarvox/i;
  function voiceScore(v) {
    const n = v.name;
    let score = 0;
    if (NOVELTY.test(n)) return -100;
    if (/natural|neural/i.test(n)) score += 60; // Edge / Windows natural voices
    if (/premium|enhanced|siri/i.test(n)) score += 50; // Apple high-quality voices
    if (/google/i.test(n)) score += 30; // Chrome's online voices
    if (/compact|espeak/i.test(n)) score -= 30;
    if (/samantha|ava|allison|evan|nathan|zoe|susan|karen|serena|aria|jenny|guy|libby|sonia/i.test(n)) score += 15;
    if (/en[-_]US/i.test(v.lang)) score += 5;
    return score;
  }
  let voices = [];
  function loadVoices() {
    if (!window.speechSynthesis) return;
    voices = speechSynthesis.getVoices()
      .filter((v) => /^en/i.test(v.lang) && voiceScore(v) > -100)
      .sort((x, y) => voiceScore(y) - voiceScore(x));
  }
  if (window.speechSynthesis) {
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }
  const currentVoice = () => (S && S.voiceName && voices.find((v) => v.name === S.voiceName)) || voices[0] || null;

  function speak(text, force) {
    if (!(force || (S && S.voice)) || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(spoken(text));
      const v = currentVoice();
      if (v) { u.voice = v; u.lang = v.lang; }
      // Natural voices sound best near normal speed; basic ones a touch slower.
      u.rate = v && voiceScore(v) >= 30 ? 0.95 : 0.88;
      u.pitch = 1;
      speechSynthesis.speak(u);
    } catch (e) { /* no voice */ }
  }
  function hush() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  function hearButton(getText) {
    const b = el('button', 'hear', '🔊');
    b.type = 'button';
    b.setAttribute('aria-label', 'Read this out loud');
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); speak(getText(), true); });
    return b;
  }

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
    z: 'a', ' ': 'a', x: 'b', Escape: 'b', Backspace: 'b', m: 'start', h: 'b',
    1: 'n1', 2: 'n2', 3: 'n3', 4: 'n4',
  };
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (keyInput) {
      const code = /^[0-9]$/.test(key) ? key : key === 'Backspace' ? 'del' : key === 'Enter' ? 'ok' : null;
      if (code) { e.preventDefault(); document.body.classList.add('kb'); keyInput(code); return; }
    }
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
  // iPhone/iPad: two quick taps on the controls must never zoom the page.
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd < 400 && e.target.closest && e.target.closest('.pad, .start')) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  // ---------------------------------------------------------------- number keypad
  // While a question wants a typed answer, the D-pad and A/B buttons swap
  // for a big number keypad (like Math Quest's).
  const consoleEl = document.querySelector('.console');
  let keyInput = null;
  const keypad = (() => {
    const k = el('div', 'keypad');
    k.hidden = true;
    for (const key of ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']) {
      const label = key === 'del' ? '⌫' : key === 'ok' ? '✓' : key;
      const b = el('button', 'key' + (key === 'del' || key === 'ok' ? ' ' + key : ''), label);
      b.type = 'button';
      b.setAttribute('aria-label', key === 'del' ? 'Erase' : key === 'ok' ? 'Check my answer' : key);
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        b.classList.add('on');
        if (keyInput) keyInput(key);
      });
      const up = () => b.classList.remove('on');
      b.addEventListener('pointerup', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('pointerleave', up);
      k.append(b);
    }
    document.querySelector('.pad').after(k);
    return k;
  })();
  function showKeypad(fn) { keyInput = fn; keypad.hidden = false; consoleEl.classList.add('typing'); }
  function hideKeypad() { keyInput = null; keypad.hidden = true; consoleEl.classList.remove('typing'); }

  // Grades 1-3 type their answers (recall builds memory better than picking);
  // Kindergarten picks from big choices. Grown-ups can change it in Settings.
  function typedAnswers(p) {
    if (p.op === 'or') return false;
    const mode = (S && S.answerMode) || 'auto';
    return mode === 'type' || (mode === 'auto' && S.grade > 0);
  }

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

  const fill = (t) => t.replace(/\{name\}/g, S ? S.name : '').replace(/\{buddy\}/g, S ? buddyName() : '');

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
      let sel = Math.max(0, Math.min(start, items.length - 1));
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

  // ---------------------------------------------------------------- math pictures

  // Ten-frames (K-1), base-ten blocks (2) and arrays (2-3), like Math Quest.
  function renderVisual(v) {
    if (!v) return null;
    const wrap = el('div', 'vis ' + v.kind);
    if (v.kind === 'tenframe') {
      const total = v.mode === 'add' ? v.a + v.b : v.a;
      const frames = Math.ceil(total / 10);
      if (frames > 2) return null;
      for (let f = 0; f < frames; f++) {
        const frame = el('div', 'frame');
        for (let i = 0; i < 10; i++) {
          const n = f * 10 + i;
          const cell = el('span', 'cell');
          if (v.mode === 'add') {
            if (n < v.a) cell.classList.add('dot', 'a');
            else if (n < v.a + v.b) cell.classList.add('dot', 'b');
          } else if (n < v.a) {
            cell.classList.add('dot', 'a');
            if (n >= v.a - v.b) cell.classList.add('gone');
          }
          frame.append(cell);
        }
        wrap.append(frame);
      }
      return wrap;
    }
    if (v.kind === 'baseten') {
      if (v.a >= 100 || v.b >= 100) return null;
      const group = (n, cls) => {
        const g = el('div', 'grp ' + cls);
        for (let i = 0; i < Math.floor(n / 10); i++) g.append(el('span', 'rod'));
        const ones = el('div', 'ones');
        for (let i = 0; i < n % 10; i++) ones.append(el('span', 'cube'));
        g.append(ones);
        return g;
      };
      wrap.append(group(v.a, 'a'), el('span', 'sign', v.mode === 'add' ? '+' : '−'), group(v.b, v.mode === 'add' ? 'b' : 'x'));
      return wrap;
    }
    if (v.kind === 'array') {
      // Keep the whole array about 17cqw tall so the answers stay on screen.
      const size = Math.min(3.6, 17 / v.rows - 0.6, 70 / v.cols - 0.6);
      wrap.style.setProperty('--dot', size + 'cqw');
      for (let r = 0; r < v.rows; r++) {
        const row = el('div', 'row');
        for (let c = 0; c < v.cols; c++) row.append(el('span', 'dot'));
        wrap.append(row);
      }
      return wrap;
    }
    return null;
  }

  // ---------------------------------------------------------------- asking a problem (with hints)

  let currentProblem = null;

  // Shows a problem with the buddy's help. Resolves to
  // { result: 'first' | 'helped' | 'miss', ms }.
  //   Hint button (or B): 1st press shows a tip (and the picture), 2nd press opens Teach me.
  //   Wrong once: a mistake hint and a second try. Wrong twice: the answer, then Teach me or OK.
  function ask(p, opts = {}) {
    const { canTeach = true, head = '' } = opts;
    currentProblem = p;
    return new Promise((res) => {
      const box = el('div', 'box quiz');
      const top = el('div', 'qhead');
      top.append(el('span', null, head || p.label));
      top.append(hearButton(() => `${p.text} ${bubbleText.textContent}`));
      const q = el('div', 'q' + (p.text.length > 22 ? ' long' : ''), p.text);
      box.append(top, q);
      let visEl = null;
      const showVisual = () => {
        if (visEl || !p.visual) return;
        visEl = renderVisual(p.visual);
        if (visEl) q.after(visEl);
      };
      if (p.visualMode === 'always') showVisual();

      const bubble = el('div', 'bubble');
      const face = el('img');
      face.src = Art.creatureURL(S.sidekick || 'sproutle');
      face.alt = '';
      const bubbleText = el('span');
      bubble.append(face, bubbleText);
      bubble.hidden = true;
      const sayBubble = (text) => {
        bubble.hidden = false;
        bubbleText.textContent = text;
        speak(text);
        grid.scrollIntoView({ block: 'nearest' });
      };

      const grid = el('div', 'answers' + (p.choices.length === 4 ? ' four' : p.choices.length === 3 ? ' three' : ' two'));
      const foot = el('div', 'qfoot');
      const hintBtn = el('button', 'hintbtn', '💡 Hint');
      hintBtn.type = 'button';
      foot.append(hintBtn);
      const typing = typedAnswers(p);
      const entry = el('div', 'entry empty', '?');
      let typed = '';
      const setEntry = () => { entry.textContent = typed || '?'; entry.classList.toggle('empty', !typed); };
      box.append(bubble, typing ? entry : grid, foot);

      let sel = 0, tries = 0, hints = 0, locked = false;
      const t0 = performance.now();
      const btns = typing ? [] : p.choices.map((c, i) => {
        const b = el('button', 'ans', String(c));
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); answer(i); });
        grid.append(b);
        return b;
      });
      const live = () => btns.map((b, i) => i).filter((i) => !btns[i].disabled);
      const draw = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));

      const finish = (result) => {
        locked = true;
        handler = null;
        hideKeypad();
        box.remove();
        res({ result, ms: performance.now() - t0 });
      };

      async function teachThenTwin() {
        locked = true;
        handler = null;
        hideKeypad();
        box.remove();
        const lesson = MathEngine.teach(p);
        if (lesson) await teachPanel(lesson);
        const t = MathEngine.twin(p);
        await say(`${buddyName()}: Your turn! Try one just like it.`);
        const r = await ask(t, { canTeach: false, head: 'Your turn!' });
        res({ result: r.result === 'miss' ? 'miss' : 'helped', ms: performance.now() - t0, taught: true });
      }

      function hint() {
        if (locked) return;
        hints++;
        sfx('hint');
        if (hints === 1) {
          showVisual();
          sayBubble(MathEngine.tip(p));
          if (!canTeach) hintBtn.remove();
          else hintBtn.textContent = '🦉 Teach me';
        } else if (canTeach) {
          teachThenTwin();
        }
      }
      hintBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); hint(); });

      // i is the chosen button for multiple choice; typed answers pass the value.
      async function answer(i, value = p.choices[i]) {
        if (locked || (!typing && btns[i].disabled)) return;
        const correct = value === p.answer;
        btns.forEach((b) => b.classList.remove('sel'));
        if (correct) {
          locked = true;
          hush();
          (typing ? entry : btns[i]).classList.add('right');
          sfx('good');
          await sleep(600);
          return finish(tries === 0 && hints === 0 ? 'first' : 'helped');
        }
        tries++;
        sfx('bad');
        if (typing) {
          entry.classList.add('wrong');
        } else {
          btns[i].classList.add('wrong');
          btns[i].disabled = true;
        }
        if (tries === 1) {
          showVisual();
          sayBubble(MathEngine.mistakeHint(p, value) || (p.visual ? 'Almost! Look at the picture and give it another try.' : 'Almost! Give it another try. You\'ve got this!'));
          if (typing) {
            locked = true;
            await sleep(700);
            locked = false;
            entry.classList.remove('wrong');
            typed = '';
            setEntry();
          } else {
            sel = live()[0];
            draw();
          }
          return;
        }
        // Second miss: show the answer and offer a lesson.
        locked = true;
        hush();
        if (typing) {
          hideKeypad();
          await sleep(500);
          entry.classList.remove('wrong', 'empty');
          entry.classList.add('right');
          entry.textContent = String(p.answer);
        } else {
          btns[p.choices.indexOf(p.answer)].classList.add('right');
          btns.forEach((b) => { b.disabled = true; });
        }
        sayBubble(`Here's the answer: ${p.explain}`);
        foot.textContent = '';
        const okBtn = el('button', 'hintbtn', 'OK');
        okBtn.type = 'button';
        okBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); finish('miss'); });
        if (canTeach && MathEngine.teach(p)) {
          const teachBtn = el('button', 'hintbtn teach', '🦉 Teach me');
          teachBtn.type = 'button';
          teachBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); teachThenTwin(); });
          foot.append(teachBtn);
          handler = (btn) => { if (btn === 'a') teachThenTwin(); else if (btn === 'b') finish('miss'); };
        } else {
          handler = (btn) => { if (btn === 'a' || btn === 'b') finish('miss'); };
        }
        foot.append(okBtn);
      }

      ui.append(box);
      draw();
      speak(p.text);
      if (typing) {
        showKeypad((k) => {
          if (locked) return;
          if (k === 'ok') { if (typed) answer(-1, Number(typed)); return; }
          if (k === 'del') typed = typed.slice(0, -1);
          else if (typed.length < 5) typed = (typed === '0' ? '' : typed) + k;
          sfx('move');
          setEntry();
        });
        handler = (btn) => { if (btn === 'b') hint(); else if (btn === 'a' && typed) answer(-1, Number(typed)); };
        return;
      }
      handler = (btn) => {
        const ids = live(), n = btns.length;
        if (btn === 'b') return hint();
        if (btn === 'a') return answer(sel);
        if (/^n[1-4]$/.test(btn)) { const i = Number(btn[1]) - 1; if (i < n) answer(i); return; }
        const step = { left: -1, right: 1, up: -1, down: 1 }[btn];
        if (!step) return;
        let next = sel;
        for (let k = 0; k < n; k++) { next = (next + step + n) % n; if (ids.includes(next)) break; }
        sel = next;
        sfx('move');
        draw();
      };
    });
  }

  // Step-by-step lesson from the buddy (Math Quest's "Teach me" tutor).
  function teachPanel(lesson) {
    return new Promise((res) => {
      const box = el('div', 'box teach');
      const head = el('div', 'qhead');
      head.append(el('span', null, `🦉 ${lesson.title}`));
      const intro = el('p', 'intro', lesson.intro);
      const work = el('pre', 'work');
      const prompt = el('p', 'prompt');
      head.append(hearButton(() => `${intro.hidden ? '' : intro.textContent} ${prompt.textContent}`));
      const grid = el('div', 'answers three');
      const note = el('p', 'note');
      const next = el('button', 'hintbtn', 'Next ▶');
      next.type = 'button';
      box.append(head, intro, work, prompt, grid, note, next);
      ui.append(box);

      let step = 0, sel = 0, solved = false, btns = [];
      function show() {
        const s = lesson.steps[step];
        solved = false;
        intro.hidden = step > 0;
        work.textContent = s.work.join('\n');
        prompt.textContent = s.prompt;
        note.textContent = '';
        next.hidden = true;
        grid.textContent = '';
        grid.className = 'answers ' + (s.choices.length === 2 ? 'two' : 'three');
        box.scrollTop = 0;
        btns = s.choices.map((c, i) => {
          const b = el('button', 'ans', String(c));
          b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); pickStep(i); });
          grid.append(b);
          return b;
        });
        sel = 0;
        draw();
        speak((step === 0 ? lesson.intro + ' ' : '') + s.prompt);
      }
      const draw = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
      function pickStep(i) {
        if (solved || btns[i].disabled) return;
        const s = lesson.steps[step];
        if (s.choices[i] === s.answer) {
          solved = true;
          btns[i].classList.add('right');
          btns.forEach((b) => { b.disabled = true; });
          note.textContent = '✓ ' + s.after;
          next.hidden = false;
          next.textContent = step === lesson.steps.length - 1 ? 'Done ✓' : 'Next ▶';
          next.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          sfx('good');
          speak(s.after);
        } else {
          btns[i].classList.add('wrong');
          btns[i].disabled = true;
          note.textContent = '💡 ' + s.hint;
          sfx('bad');
          speak(s.hint);
        }
      }
      function go() {
        if (!solved) return;
        sfx('blip');
        if (++step >= lesson.steps.length) {
          handler = null;
          box.remove();
          res();
        } else show();
      }
      next.addEventListener('pointerdown', (e) => { e.preventDefault(); go(); });
      handler = (btn) => {
        if (solved && (btn === 'a' || btn === 'b')) return go();
        const n = btns.length;
        if (btn === 'a') return pickStep(sel);
        if (/^n[1-3]$/.test(btn)) { const i = Number(btn[1]) - 1; if (i < n) pickStep(i); return; }
        if (btn === 'left' || btn === 'up') sel = (sel + n - 1) % n;
        else if (btn === 'right' || btn === 'down') sel = (sel + 1) % n;
        else return;
        sfx('move');
        draw();
      };
      show();
    });
  }

  // ---------------------------------------------------------------- learning record

  function record(p, result, ms) {
    const s = S.skills[p.skillId] || (S.skills[p.skillId] = { attempts: 0, correct: 0, ms: 0, n: 0 });
    s.attempts++;
    if (result === 'first') { s.correct++; s.ms += Math.min(ms, 120000); s.n++; }
    // Missed problems come back after 1, 3, then 7 days (Math Quest's schedule).
    const key = `${p.a}${p.op}${p.b}`;
    const existing = S.review.find((x) => x.key === key);
    if (result === 'first') {
      if (existing) {
        existing.box++;
        if (existing.box > 3) S.review.splice(S.review.indexOf(existing), 1);
        else existing.due = Date.now() + [1, 3, 7][existing.box - 1] * DAY;
      }
    } else if (!existing) {
      S.review.push({
        key, skillId: p.skillId, a: p.a, b: p.b, op: p.op, answer: p.answer,
        missing: p.missing, total: p.total, visual: p.visual, visualMode: p.visualMode,
        box: 1, due: Date.now() + DAY,
      });
      if (S.review.length > 30) S.review.shift();
    }
  }

  // The next problem for a battle against `foe`.
  function problemFor(foe) {
    const fam = SPECIES[foe.sp].family;
    const due = S.review.filter((x) => x.due <= Date.now() && (fam === 'mixed' || MathEngine.SKILLS[x.skillId].family === fam));
    if (due.length && Math.random() < 0.3) {
      const p = MathEngine.fromReview(pick(due));
      p.review = true;
      return p;
    }
    const skill = foe.skill || MathEngine.pickSkill(S.grade, S.skills);
    return MathEngine.make(skill, S.grade, S.skills);
  }

  // ---------------------------------------------------------------- world

  const P = { x: 0, y: 0, px: 0, py: 0, dir: 'down', moving: false, fx: 0, fy: 0, tx: 0, ty: 0, t: 0, step: 0 };
  // The buddy walks one step behind the player.
  const F = { x: 0, y: 0, px: 0, py: 0, fx: 0, fy: 0, tx: 0, ty: 0, dir: 'down', stacked: true };
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
    const m = MAPS[mapId];
    if (m.heal) { S.healMap = mapId; S.visited[mapId] = true; }
    if (m.area) S.lastArea = m.area;
    if (dir) S.dir = dir;
    Object.assign(P, { x, y, px: x * TS, py: y * TS, dir: S.dir, moving: false });
    Object.assign(F, { x, y, px: x * TS, py: y * TS, fx: x, fy: y, tx: x, ty: y, dir: S.dir, stacked: true });
  }
  function startStep(nx, ny) {
    Object.assign(P, { moving: true, t: 0, fx: P.x, fy: P.y, tx: nx, ty: ny });
    // The buddy steps into the tile the player just left.
    Object.assign(F, { fx: F.x, fy: F.y, tx: P.x, ty: P.y });
    if (F.tx !== F.x || F.ty !== F.y) {
      F.dir = F.tx > F.x ? 'right' : F.tx < F.x ? 'left' : F.ty > F.y ? 'down' : 'up';
    }
  }

  function updateWorld(dt) {
    if (P.moving) {
      P.t += dt;
      const k = Math.min(1, P.t / STEP_MS);
      P.px = (P.fx + (P.tx - P.fx) * k) * TS;
      P.py = (P.fy + (P.ty - P.fy) * k) * TS;
      F.px = (F.fx + (F.tx - F.fx) * k) * TS;
      F.py = (F.fy + (F.ty - F.fy) * k) * TS;
      if (k >= 1) {
        P.moving = false;
        P.x = S.x = P.tx;
        P.y = S.y = P.ty;
        F.x = F.tx;
        F.y = F.ty;
        F.stacked = F.x === P.x && F.y === P.y;
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
        await runScript(w.block, w);
        const [dx, dy] = DIRS[P.dir];
        startStep(P.x - dx, P.y - dy);
      } else {
        sfx('move');
        if (w.ret) S.ret = { map: S.map, x: w.ret[0], y: w.ret[1] };
        await fade(() => {
          if (w.to === '@return') {
            const r = S.ret || { map: 'town', x: 15, y: 10 };
            placePlayer(r.map, r.x, r.y, 'down');
          } else placePlayer(w.to, w.tx, w.ty, w.dir);
          writeSave();
        });
      }
      busy = false;
      return;
    }
    if (ENCOUNTER.has(tileAt(P.x, P.y)) && m.wild && S.party.some(alive) && Math.random() < 0.13) {
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
    const buddyHere = S.sidekick && !F.stacked && F.x === x && F.y === y;
    let n = npcAt(x, y);
    if (!n && tileAt(x, y) === 'c') n = npcAt(x + dx, y + dy); // talk across a counter
    const t = tileAt(x, y);
    const sign = map().signs[`${x},${y}`];
    if (!buddyHere && !n && !sign && !(t && '123'.includes(t))) return;
    busy = true;
    try {
      if (buddyHere) {
        F.dir = OPPOSITE[P.dir];
        await buddyTalk();
      } else if (n) {
        n.dir = OPPOSITE[P.dir];
        await runScript(n.script, n.arg);
      } else if (sign) {
        await say(sign);
      } else {
        await runScript('starter', Number(t));
      }
    } finally {
      busy = false;
    }
  }

  // The buddy points the player at the skill they most need.
  async function buddyTalk() {
    if (!S.sidekick) return;
    const weak = MathEngine.weakestSkill(S.grade, S.skills);
    const s = S.skills[weak];
    const fam = MathEngine.SKILLS[weak].family;
    const legend = SPECIES[speciesFor(fam)].name;
    const allMastered = MathEngine.gradeSkills(S.grade).every((id) => MathEngine.stretchLevel(S.skills[id]) === 2);
    if (allMastered) {
      await say([`${buddyName()}: You're a math star!`, 'Maybe ask a grown-up about trying the next grade.']);
      return;
    }
    await say([
      `${buddyName()}: Let's practice ${MathEngine.SKILLS[weak].label.toLowerCase()}!`,
      !s || s.attempts < 3 ? `${legend} loves those puzzles.` : `${legend} loves those puzzles. We're getting better at them!`,
      'Let\'s go find one in the tall grass!',
    ]);
  }

  function drawWorld(now) {
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
    const ents = m.npcs.map((n) => ({ y: n.y * TS, x: n.x * TS, img: Art.person(LOOKS[n.look], n.dir, 0), oy: -3 }));
    if (S.sidekick && !F.stacked) {
      const hop = P.moving ? (P.t < STEP_MS / 2 ? 1 : 0) : Math.floor(now / 500) % 2;
      const img = Art.creatureSmall(S.sidekick, hop);
      ents.push({ y: F.py - 0.5, x: Math.round(F.px) - 2, img, oy: -5, flip: F.dir === 'right' });
    }
    const frame = P.moving && P.t < STEP_MS * 0.6 ? 1 + (P.step % 2) : 0;
    ents.push({ y: P.py, x: Math.round(P.px), img: Art.person(LOOKS.hero, P.dir, frame), oy: -3 });
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) {
      const x = e.x - camX, y = Math.round(e.y) - camY + e.oy;
      if (e.flip) {
        ctx.save();
        ctx.translate(x + e.img.width, y);
        ctx.scale(-1, 1);
        ctx.drawImage(e.img, 0, 0);
        ctx.restore();
      } else ctx.drawImage(e.img, x, y);
    }
    // Tall grass hides feet.
    for (const [gx, gy, still] of [[P.x, P.y, !P.moving], [F.x, F.y, !P.moving && !F.stacked]]) {
      const t = tileAt(gx, gy);
      if (still && ENCOUNTER.has(t)) ctx.drawImage(Art.tile(t), 0, 9, 16, 7, gx * TS - camX, gy * TS - camY + 9, 16, 7);
    }
  }

  // ---------------------------------------------------------------- scripts

  async function runScript(name, arg) {
    const fn = SCRIPTS[name];
    if (fn) await fn(arg);
  }

  const SCRIPTS = {
    mom: () => say(S.flags.starter
      ? ['{buddy} is so cute!', 'If your team gets tired, the Rest Center can help.', 'It\'s the building with the pink roof.']
      : ['Good morning, {name}!', 'Professor Pi was looking for you.', 'The lab is the building with the blue roof.']),

    prof: () => {
      if (!S.flags.starter) return say(['Hi, {name}! I\'m Professor Pi.', 'Wild Legends love math puzzles.', 'Go ahead and pick a buddy from my table.', 'Your buddy will help you think things through!']);
      if (!S.flags.badge1) return say(['Ranger Rowan is waiting at the end of Route 1.', 'Rowan likes to pick the puzzles you need most.', 'Win, and you\'ll earn a badge!']);
      const n = badgeCount();
      if (n < 5) return say([`You have ${n} badge${n === 1 ? '' : 's'}! Way to go!`, 'Each place up north has a new boss to beat.', 'Check the MENU map to travel fast.']);
      return say(['All five badges! You\'re a true Math Quest Legend!', 'I\'m so proud of you and your buddy.']);
    },

    async starter(n) {
      const id = STARTERS[n - 1], sp = SPECIES[id];
      if (S.flags.starter) {
        await say(S.sidekick === id ? `${sp.name} used to sleep right here!` : `${sp.name} is taking a nap. Professor Pi looks after it.`);
        return;
      }
      const close = popCreature(id);
      const ok = await yesNo([`This is ${sp.name}!`, sp.dex, `Want ${sp.name} to be your buddy?`]);
      if (!ok) { close(); return; }
      S.party.push(mon(id, 5));
      S.sidekick = id;
      S.flags.starter = true;
      STARTERS.forEach((s) => { S.seen[s] = true; });
      S.caught[id] = true;
      sfx('friend');
      await say(`You and ${sp.name} are buddies now!`);
      close();
      await say([
        'PROF. PI: Great choice!',
        'Your buddy will go everywhere with you.',
        'Out in the wild, Legends love math puzzles.',
        'Solve their puzzles, and they calm down.',
        'Some might even want to be your friend!',
        'If a puzzle feels hard, press HINT.',
        `${sp.name} will help you out.`,
        'Route 1 is just north of town. Have fun!',
      ]);
      writeSave();
    },

    nurse: async () => {
      await say(['Welcome to the Rest Center!', 'Let\'s get your team feeling better.']);
      healAll();
      sfx('heal');
      await sleep(900);
      await say(['All better! Your team is ready to go.', 'Come back any time!']);
      writeSave();
    },

    kid: () => say(S.flags.starter
      ? ['Your buddy follows you everywhere!', 'Turn around and press A to talk to it.']
      : ['Wild Legends hide in the tall grass.', 'You\'ll need a buddy before you go in there.']),

    kidBlock: () => say(['Wait, stop!', 'There are wild Legends in that tall grass.', 'Get a buddy from Professor Pi first.']),

    girl: () => say(['Stuck on a puzzle? Press HINT.', 'Press it again, and your buddy will show you how.', 'One step at a time!']),

    hiker: () => say(['Every wild Legend has its own kind of puzzle.', 'Hootsum loves adding.', 'Snipsnap loves taking away.']),

    routeKid: () => say(['Try to solve puzzles on the first try.', 'Legends really like that. They might want to be friends!']),

    shoreKid: () => say(['Every place has its own Legends.', 'Out here, Octogroup loves equal groups.', 'It has eight arms to count with!']),
    canyonHiker: () => say(['Hot out here, huh?', 'Arraydillo rolls up in neat rows.', 'Perfect for times tables!']),
    snowKid: () => say(['Brrr! Meltling loves take-away puzzles.', 'A little bit melts away each time!']),
    caveKid: () => say(['Crystling asks which number is bigger.', 'Look at the biggest place first!']),

    // The way to the next area is closed until you beat this area's boss.
    gate: (w) => {
      const boss = Object.values(BOSSES).find((b) => b.flag === w.need);
      return say(['This way is closed for now.', `Beat ${boss.name} to open it!`]);
    },

    // Each boss opens with the Legend for your weakest skill, then its own partner.
    boss: async (areaId) => {
      const b = BOSSES[areaId], area = AREAS[areaId];
      if (S.flags[b.flag]) return say(b.after);
      await say(b.intro);
      const weak = MathEngine.weakestSkill(S.grade, S.skills);
      const first = area.species[MathEngine.SKILLS[weak].family];
      const result = await battle([mon(first, area.base + 3, weak), mon(area.boss, area.base + 4)], { trainer: b.name });
      if (result === 'win') {
        S.flags[b.flag] = true;
        sfx('level');
        await say([`${b.name.toUpperCase()}: ${b.win[0]}`, ...b.win.slice(1)]);
        writeSave();
      }
    },
  };

  const badgeCount = () => BADGE_FLAGS.filter((f) => S.flags[f]).length;
  // The Legend that asks this kind of math where you are (or where you last were).
  function speciesFor(fam) {
    const area = AREAS[(map() && map().area) || S.lastArea] || AREAS.meadow;
    return area.species[fam] || AREAS.meadow.species[fam];
  }

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

  // Battle colors for each area: sky, ground band, platform dark and light.
  const BATTLE_LOOK = {
    meadow: ['#f8f4e8', '#eef0d8', '#a8c878', '#c4dc94'],
    shore: ['#e4f4fc', '#f6e8bc', '#e0c27a', '#f2dc9a'],
    canyon: ['#fbe8d0', '#f0c8a0', '#c87a4a', '#e2a46e'],
    snow: ['#eef4fc', '#dce8f6', '#aec4e2', '#f4f8ff'],
    cave: ['#2c2440', '#3a3050', '#5a4a7a', '#7a6aa0'],
  };

  function drawBattle(now) {
    const [sky, band, pd, pl] = BATTLE_LOOK[S.lastArea] || BATTLE_LOOK.meadow;
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = band;
    ctx.fillRect(0, 40, W, 60);
    ctx.drawImage(Art.platform(32, 8, pd, pl), 92, 48);
    ctx.drawImage(Art.platform(34, 8, pd, pl), 4, 84);
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

  // Time limit for the "so fast" bonus. Slow answers are never punished.
  function fastLimit(p) {
    return (p.story ? 20000 : 9000) + (['+', '−'].includes(p.op) && S.grade >= 2 ? 5000 : 0);
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
        fx: { e: { dx: 0, dy: 0, hide: false }, p: { dx: 0, dy: 0, hide: false } }, idle: true, firstTries: 0,
      };
      foes.forEach((f) => { S.seen[f.sp] = true; });
      B.eh = hud('enemy');
      B.ph = hud('me');
      updHud();
    });
    const fam = SPECIES[B.enemy.sp].family;
    if (B.trainer) await say([`${B.trainer} wants to battle!`, `${B.trainer} sends out ${nameOf(B.enemy)}!`]);
    else await say([`A wild ${nameOf(B.enemy)} jumped out!`, `It loves ${FAMILY_PHRASE[fam]} puzzles!`]);
    await say(`Go, ${nameOf(B.me)}!`);

    let result = null;
    while (!result) result = await turn();

    await fade(() => {
      B.eh.remove();
      B.ph.remove();
      hideDialog();
      B = null;
      mode = 'world';
      if (result === 'lose') {
        healAll();
        const h = MAPS[S.healMap] || MAPS.town;
        S.ret = { map: MAPS[S.healMap] ? S.healMap : 'town', x: h.heal[0], y: h.heal[1] };
        placePlayer('center', 3, 3, 'up');
      }
    });
    if (result === 'lose') {
      await say(['NURSE ADA: There! Your team feels great again.', 'Every puzzle helps you learn.', 'You\'ll get it next time!']);
    }
    writeSave();
    return result;
  }

  const foeName = () => `${B.trainer ? '' : 'Wild '}${nameOf(B.enemy)}`;

  async function turn() {
    B.idle = true;
    await say(`What will ${nameOf(B.me)} do?`, { keep: true });
    dialogEl.classList.add('split');
    const act = await choose(['SOLVE', 'TEAM', 'RUN'], { cancel: false, cols: 2, cls: 'battle-menu' });
    B.idle = false;
    hideDialog();
    if (act === 0) return solve();
    if (act === 1) return switchTeam();
    if (B.trainer) { await say('You can\'t run from this battle!'); return null; }
    sfx('move');
    await say('You got away!');
    return 'run';
  }

  async function solve() {
    const move = pick(SPECIES[B.me.sp].moves);
    const p = problemFor(B.enemy);
    const head = `${nameOf(B.enemy)}'s puzzle${p.review ? ' (review)' : ''}`;
    const r = await ask(p, { head });
    record(p, r.result, r.ms);
    if (r.result === 'miss') {
      await say(`${nameOf(B.me)} missed. That's okay, keep trying!`);
      return foeTurn(false);
    }
    const fast = r.result === 'first' && r.ms < fastLimit(p);
    if (r.result === 'first') B.firstTries++;
    const mult = r.result === 'first' ? (fast ? 1.5 : 1) : 0.6;
    await say(`${nameOf(B.me)} uses ${move}!`);
    await hurt(B.enemy, damage(40, atkOf(B.me), mult), 'e');
    if (r.result === 'first') await say(fast ? 'Wow, so fast! Extra power!' : 'Nice work!');
    else await say('You figured it out!');
    if (!alive(B.enemy)) return foeCalmed();
    return foeTurn(true);
  }

  async function switchTeam() {
    const i = await teamPicker('Who should go in?');
    if (i < 0 || S.party[i] === B.me) return null;
    const c = S.party[i];
    if (!alive(c)) { await say(`${nameOf(c)} needs a rest.`); return null; }
    await say(`Come back, ${nameOf(B.me)}!`);
    B.me = c;
    B.fx.p.hide = false;
    updHud();
    await say(`Go, ${nameOf(B.me)}!`);
    return foeTurn(true);
  }

  // The foe's turn. If the puzzle was solved, our Legend was ready and only
  // takes half the hit.
  async function foeTurn(ready) {
    const e = B.enemy;
    await say(`${foeName()} uses ${pick(SPECIES[e.sp].moves)}!`);
    await hurt(B.me, Math.max(1, Math.round(damage(35, atkOf(e)) * (ready ? 0.5 : 1))), 'p');
    if (alive(B.me)) return null;

    await faintAnim('p');
    await say(`${nameOf(B.me)} is all tired out!`);
    if (!S.party.some(alive)) {
      await say(['Your whole team is tired out.', 'You hurry back to the Rest Center.']);
      return 'lose';
    }
    let i = await teamPicker('Who should go next?', false, S.party.findIndex(alive));
    while (!alive(S.party[i])) {
      await say(`${nameOf(S.party[i])} needs a rest.`);
      i = await teamPicker('Who should go next?', false, S.party.findIndex(alive));
    }
    B.me = S.party[i];
    B.fx.p.hide = false;
    updHud();
    await say(`Go, ${nameOf(B.me)}!`);
    return null;
  }

  // The foe is out of energy. Wild Legends calm down and may want to be friends.
  async function foeCalmed() {
    await faintAnim('e');
    await say(B.trainer ? `${nameOf(B.enemy)} is all done!` : `The wild ${nameOf(B.enemy)} calmed down!`);
    const gain = Math.round(B.enemy.lv * 6 * (B.trainer ? 1.5 : 1));
    await gainXp(B.me, gain);
    B.ei++;
    if (B.ei < B.foes.length) {
      B.enemy = B.foes[B.ei];
      B.fx.e = { dx: 0, dy: 0, hide: false };
      updHud();
      await say([`${B.trainer} sends out ${nameOf(B.enemy)}!`, `It loves ${FAMILY_PHRASE[SPECIES[B.enemy.sp].family]} puzzles!`]);
      return null;
    }
    if (B.trainer) {
      await say(`You beat ${B.trainer}!`);
      return 'win';
    }
    // First-try answers make friends.
    const c = B.enemy;
    let chance = Math.min(0.9, 0.3 + 0.2 * B.firstTries);
    if (S.caught[c.sp]) chance *= 0.5;
    if (Math.random() < chance) {
      B.fx.e.hide = false;
      sfx('friend');
      if (await yesNo([`${nameOf(c)} really likes you!`, 'It wants to come with you. Take it along?'])) {
        c.hp = maxHp(c);
        delete c.skill;
        S.caught[c.sp] = true;
        if (S.party.length < 6) {
          S.party.push(c);
          await say(`${nameOf(c)} joined your team!`);
        } else {
          S.box.push(c);
          await say(['Your team is full.', `${nameOf(c)} will wait for you at Professor Pi's lab.`]);
        }
      } else {
        await say(`${nameOf(c)} waves goodbye!`);
      }
    }
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
      await say(`${nameOf(c)} grew to level ${c.lv}!`);
    }
  }

  // Wild Legends match the math the player needs: weak skills come up more
  // often, and a Legend's level grows as its skill is mastered.
  async function wildBattle() {
    // Focus: while one skill is clearly weak, 40% of encounters target it directly.
    const weak = MathEngine.weakestSkill(S.grade, S.skills);
    const ws = S.skills[weak];
    const focus = ws && ws.attempts >= 3 && MathEngine.stretchLevel(ws) === 0 && Math.random() < 0.4;
    const skill = focus ? weak : MathEngine.pickSkill(S.grade, S.skills);
    const area = AREAS[map().area] || AREAS.meadow;
    const sp = area.species[MathEngine.SKILLS[skill].family];
    const lv = area.base + 2 * MathEngine.stretchLevel(S.skills[skill]) + rnd(0, 1);
    await battle([mon(sp, lv, skill)]);
  }

  // ---------------------------------------------------------------- menus

  function teamItems() {
    return S.party.map((c) => ({
      label: `${nameOf(c)}  Lv ${c.lv}${c.sp === S.sidekick ? '  ★' : ''}`,
      sub: alive(c) ? `HP ${c.hp} / ${maxHp(c)}` : 'Needs a rest',
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
      box.append(img, el('h3', null, sp.name + (c.sp === S.sidekick ? ' ★' : '')));
      box.append(el('p', null, `Level ${c.lv} · HP ${c.hp} / ${maxHp(c)}`));
      box.append(el('p', null, `XP ${c.xp} / ${xpNeed(c.lv)}`));
      box.append(el('p', null, puzzleLabel(c.sp)));
      box.append(el('p', null, sp.dex));
    });
  }

  async function teamMenu() {
    if (!S.party.length) { await say('You don\'t have any Legends yet.'); return; }
    for (;;) {
      const i = await teamPicker('Your team (★ = buddy)');
      if (i < 0) return;
      const c = S.party[i];
      const a = await choose(['Look', 'Go first', 'Back'], { cls: 'start-menu' });
      if (a === 0) await creatureInfo(c);
      if (a === 1 && i > 0) {
        S.party.splice(i, 1);
        S.party.unshift(c);
        await say(`${nameOf(c)} will go first next time!`);
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
          sub: S.caught[id] ? 'Friend!' : seen ? 'Seen' : 'Not found yet',
          icon: seen ? Art.creatureURL(id) : undefined,
          dim: !seen,
        };
      });
      const i = await choose(items, { cls: 'full', head: `Legendex: ${count} of ${DEX_ORDER.length} friends` });
      if (i < 0) return;
      const id = DEX_ORDER[i];
      if (!(S.seen[id] || S.caught[id])) { await say('You haven\'t found this one yet.'); continue; }
      const sp = SPECIES[id];
      await panel((box) => {
        const img = el('img', 'pic');
        img.src = Art.creatureURL(id);
        img.alt = '';
        box.append(img, el('h3', null, sp.name), el('p', null, puzzleLabel(id)), el('p', null, sp.dex));
      });
    }
  }

  function progressPage() {
    return panel((box) => {
      box.append(el('h3', null, 'For grown-ups'));
      box.append(el('p', null, `${S.name} · ${GRADES[S.grade]} · first-try accuracy by skill`));
      const ids = Object.keys(MathEngine.SKILLS).filter((id) => S.skills[id] || MathEngine.gradeSkills(S.grade).includes(id));
      for (const id of ids) {
        const s = S.skills[id];
        const row = el('div', 'row');
        const right = !s ? 'Not tried yet'
          : `${s.correct} / ${s.attempts} (${Math.round((s.correct / s.attempts) * 100)}%) · ${MathEngine.MASTERY[MathEngine.stretchLevel(s)]}`;
        row.append(el('span', null, MathEngine.SKILLS[id].label), el('span', null, right));
        box.append(row);
      }
      const weak = MathEngine.weakestSkill(S.grade, S.skills);
      box.append(el('p', null, `Practicing most: ${MathEngine.SKILLS[weak].label}. Wild Legends that ask these puzzles show up more often.`));
      box.append(el('p', null, `Badges: ${badgeCount()} of 5 · Legendex: ${DEX_ORDER.filter((id) => S.caught[id]).length} of ${DEX_ORDER.length} friends`));
      const due = S.review.filter((x) => x.due <= Date.now()).length;
      box.append(el('p', null, `Missed problems saved for review: ${S.review.length} (${due} ready now).`));
    });
  }

  function answerLabel() {
    const mode = S.answerMode || 'auto';
    if (mode === 'type') return 'Type them';
    if (mode === 'pick') return 'Pick from choices';
    return S.grade > 0 ? 'Auto (typing)' : 'Auto (choices)';
  }

  async function settingsMenu() {
    for (;;) {
      const i = await choose([
        `Grade: ${GRADES[S.grade]}`,
        `Read aloud: ${S.voice ? 'On' : 'Off'}`,
        `Voice: ${currentVoice() ? currentVoice().name.replace(/\s*\(.*\)$/, '') : 'None'}`,
        `Sound: ${soundOn ? 'On' : 'Off'}`,
        `Answers: ${answerLabel()}`,
        'Back',
      ], { cls: 'start-menu' });
      if (i === 0) {
        const g = await choose(GRADES, { cls: 'start-menu', start: S.grade });
        if (g >= 0) S.grade = g;
      } else if (i === 1) {
        S.voice = !S.voice;
        if (S.voice) speak('Okay! I\'ll read things out loud now.');
        else hush();
      } else if (i === 2) {
        await voiceMenu();
      } else if (i === 3) {
        soundOn = !soundOn;
        try { localStorage.setItem('mql:sound', soundOn ? 'on' : 'off'); } catch (e) { /* ignore */ }
      } else if (i === 4) {
        const modes = ['auto', 'type', 'pick'];
        S.answerMode = modes[(modes.indexOf(S.answerMode || 'auto') + 1) % modes.length];
      } else {
        writeSave();
        return;
      }
    }
  }

  // Lists the best voices first; each one says a sample line when chosen.
  async function voiceMenu() {
    loadVoices();
    if (!voices.length) { await say('This device doesn\'t have any voices to pick from.'); return; }
    const list = voices.slice(0, 12);
    const now = currentVoice();
    const j = await choose(list.map((v) => ({
      label: v.name.replace(/\s*\(.*\)$/, ''),
      sub: (voiceScore(v) >= 30 ? 'Sounds natural · ' : '') + v.lang,
    })), { cls: 'full', head: 'Pick a voice', start: Math.max(0, list.indexOf(now)) });
    if (j < 0) return;
    S.voiceName = list[j].name;
    speak(`Hi ${S.name}! This is how I sound.`, true);
    writeSave();
  }

  // ---------------------------------------------------------------- world map + quick travel

  // A little picture of the world: each band of tiles is one area.
  const WORLD = [
    'QQQqqqqQQQ',
    'QQqq%%qqQQ',
    'AA****^^AA',
    '*^^**A**^*',
    '~~__;:"":M',
    '~_;__::KMM',
    'T.,,..==,.',
    '..==.f..,T',
  ];
  function drawWorldMap() {
    const c = el('canvas', 'worldmap');
    c.width = 160;
    c.height = 128;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    WORLD.forEach((row, y) => [...row].forEach((t, x) => g.drawImage(Art.tile(t), x * 16, y * 16)));
    // the road between places
    g.strokeStyle = '#fff6d6';
    g.lineWidth = 3;
    g.setLineDash([4, 3]);
    g.beginPath();
    TRAVEL.forEach((t, i) => (i ? g.lineTo(t.mx, t.my) : g.moveTo(t.mx, t.my)));
    g.stroke();
    g.setLineDash([]);
    const here = MAPS[S.map].heal ? S.map : S.map === 'route1' ? 'town' : S.healMap;
    for (const t of TRAVEL) {
      const open = S.visited[t.map];
      g.fillStyle = '#2b2840';
      g.fillRect(t.mx - 6, t.my - 6, 12, 12);
      g.fillStyle = open ? '#f2c84b' : '#8a84a8';
      g.fillRect(t.mx - 4, t.my - 4, 8, 8);
      if (t.map === here) g.drawImage(Art.person(LOOKS.hero, 'down', 0), t.mx - 8, t.my - 22);
    }
    return c;
  }

  async function mapMenu() {
    const view = el('div', 'box mapview');
    view.append(drawWorldMap());
    ui.append(view);
    const items = TRAVEL.map((t) => ({
      label: S.visited[t.map] ? t.label : '???',
      sub: S.visited[t.map] ? 'Tap to travel here' : 'Not visited yet',
      dim: !S.visited[t.map],
    }));
    const i = await choose(items, { cls: 'maplist', head: `Badges: ${badgeCount()} of 5` });
    view.remove();
    if (i < 0) return false;
    const t = TRAVEL[i];
    if (!S.visited[t.map]) { await say('You haven\'t been there yet.'); return false; }
    if (S.map === t.map) { await say('You\'re already here!'); return false; }
    sfx('select');
    const h = MAPS[t.map].heal;
    await fade(() => { placePlayer(t.map, h[0], h[1], 'down'); writeSave(); });
    await say(`Welcome to ${t.label}!`);
    return true;
  }

  // ---------------------------------------------------------------- save files

  // Checks a loaded save and fills in anything missing.
  function cleanSave(d) {
    if (!d || typeof d !== 'object' || d.v !== 2 || !Array.isArray(d.party) || !MAPS[d.map]) return null;
    const s = Object.assign(newState(String(d.name || 'Hero').slice(0, 10), 0), d);
    s.name = String(s.name).slice(0, 10) || 'Hero';
    s.grade = Math.max(0, Math.min(3, Number(s.grade) | 0));
    const okMon = (c) => c && SPECIES[c.sp] && Number.isFinite(c.lv) && Number.isFinite(c.hp);
    s.party = s.party.filter(okMon);
    s.box = (Array.isArray(s.box) ? s.box : []).filter(okMon);
    for (const k of ['flags', 'seen', 'caught', 'skills', 'visited']) if (!s[k] || typeof s[k] !== 'object') s[k] = {};
    if (!Array.isArray(s.review)) s.review = [];
    s.visited.town = true;
    const rows = MAPS[s.map].tiles;
    if (!(s.y >= 0 && s.y < rows.length && s.x >= 0 && s.x < rows[0].length)) { s.map = 'town'; s.x = 15; s.y = 10; }
    return s;
  }

  function saveFileName() {
    const day = new Date().toISOString().slice(0, 10);
    const who = S.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'player';
    return `math-quest-legends-${who}-${day}.json`;
  }

  // A panel with real links and buttons, so phones treat taps as genuine
  // (needed to download a file or open the file picker).
  function filePanel(build) {
    return new Promise((res) => {
      const box = el('div', 'box panel io');
      const done = (v) => { handler = null; box.remove(); res(v); };
      build(box, done);
      const close = el('button', 'iobtn ghost', 'Back');
      close.type = 'button';
      close.addEventListener('click', () => { sfx('blip'); done(null); });
      box.append(close);
      ui.append(box);
      handler = (btn) => { if (btn === 'b') done(null); };
    });
  }

  function exportPanel() {
    writeSave();
    const name = saveFileName();
    const json = JSON.stringify(S);
    return filePanel((box, done) => {
      box.append(el('h3', null, 'Export your game'));
      box.append(el('p', null, 'This saves a copy of your game as a file. Keep it as a backup, or load it on another device.'));
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const a = el('a', 'iobtn', '⬇ Download save file');
      a.href = url;
      a.download = name;
      a.addEventListener('click', () => { sfx('select'); setTimeout(() => done(true), 300); });
      box.append(a);
      // Phones can also hand the file to Files, AirDrop, email and so on.
      try {
        const file = new File([json], name, { type: 'application/json' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          const share = el('button', 'iobtn', '📤 Share save file');
          share.type = 'button';
          share.addEventListener('click', async () => {
            try { await navigator.share({ files: [file], title: 'Math Quest Legends save' }); done(true); } catch (e) { /* cancelled */ }
          });
          box.append(share);
        }
      } catch (e) { /* no sharing */ }
    });
  }

  // Resolves to a cleaned-up save, or null.
  function importPanel() {
    return filePanel((box, done) => {
      box.append(el('h3', null, 'Load a save file'));
      box.append(el('p', null, 'Pick a Math Quest Legends save file. It will replace the game on this device.'));
      const label = el('label', 'iobtn', '📂 Choose save file');
      const input = el('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      label.append(input);
      const msg = el('p', 'iomsg');
      box.append(label, msg);
      input.addEventListener('change', async () => {
        const f = input.files && input.files[0];
        if (!f) return;
        try {
          const s = cleanSave(JSON.parse(await f.text()));
          if (!s) throw new Error('bad save');
          sfx('select');
          done(s);
        } catch (e) {
          sfx('bad');
          msg.textContent = 'Hmm, that file doesn\'t look like a Math Quest Legends save.';
          input.value = '';
        }
      });
    });
  }

  async function saveMenu() {
    for (;;) {
      const i = await choose(['Save now', 'Export save file', 'Load save file', 'Back'], { cls: 'start-menu' });
      if (i === 0) { writeSave(); await say('Game saved!'); }
      else if (i === 1) await exportPanel();
      else if (i === 2) {
        const loaded = await importPanel();
        if (!loaded) continue;
        if (!(await yesNo([`Load ${loaded.name}'s game?`, 'The game on this device will be replaced.']))) continue;
        S = loaded;
        writeSave();
        await fade(() => placePlayer(S.map, S.x, S.y, S.dir));
        await say(`Welcome back, ${S.name}!`);
        return true;
      } else return false;
    }
  }

  async function openMenu() {
    busy = true;
    sfx('select');
    let i = 0;
    for (;;) {
      const items = ['Team', 'Map', 'Legendex', 'Talk to buddy', 'Grown-ups', 'Settings', 'Save & load', 'Close'];
      i = await choose(items, { cls: 'start-menu', start: Math.max(0, i) });
      if (i === 0) await teamMenu();
      else if (i === 1) { if (await mapMenu()) break; }
      else if (i === 2) await dexMenu();
      else if (i === 3) { if (S.sidekick) await buddyTalk(); else await say('You don\'t have a buddy yet.'); }
      else if (i === 4) await progressPage();
      else if (i === 5) await settingsMenu();
      else if (i === 6) { if (await saveMenu()) break; }
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
      box.append(el('label', null, 'What\'s your name?'));
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
      // A with an empty box opens the keyboard instead of skipping the name.
      handler = (btn) => {
        if (btn !== 'a') return;
        if (input.value.trim()) box.requestSubmit();
        else input.focus();
      };
      // Wait for the key that opened this box to be released, so it isn't typed.
      setTimeout(() => { input.value = ''; input.focus(); }, 200);
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
    const opts = save ? ['Continue', 'New Game', 'Load save file'] : ['New Game', 'Load save file'];
    const i = await choose(opts, { cancel: false, cls: 'title-menu' });
    logo.remove();
    if (opts[i] === 'Load save file') {
      const loaded = await importPanel();
      if (!loaded) return title();
      S = loaded;
      writeSave();
      await fade(() => { placePlayer(S.map, S.x, S.y, S.dir); mode = 'world'; });
      await say(`Welcome back, ${S.name}!`);
      return;
    }
    if (save && i === 0) {
      S = save;
      await fade(() => { placePlayer(S.map, S.x, S.y, S.dir); mode = 'world'; });
      return;
    }
    if (save) {
      S = save;
      const sure = await yesNo(['Start a new game?', 'Your old game will be erased.']);
      S = null;
      if (!sure) return title();
    }
    await newGame();
  }

  async function newGame() {
    const name = await askName();
    S = newState(name, 0);
    await say(['Hi, {name}!', 'Welcome to Math Quest Legends!', 'Legends are creatures who love math puzzles.', 'What grade are you in?'], { keep: true });
    const g = await choose(GRADES, { cancel: false });
    hideDialog();
    S.grade = g;
    await say(['Got it!', 'A grown-up can change that in the MENU.', 'The MENU can also read words out loud.', 'Now head out the door and go see Professor Pi!']);
    await fade(() => { placePlayer('house', 3, 4, 'down'); mode = 'world'; });
    writeSave();
  }

  // ---------------------------------------------------------------- main loop

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last);
    last = now;
    if (mode === 'world') { updateWorld(dt); drawWorld(now); }
    else if (mode === 'battle' && B) drawBattle(now);
    else if (mode === 'title') drawTitle(now);
    requestAnimationFrame(frame);
  }

  ctx.imageSmoothingEnabled = false;
  requestAnimationFrame(frame);
  title();

  // Exposed for debugging in the browser console.
  window.MQL = { get state() { return S; }, get problem() { return currentProblem; }, MathEngine };
  // Test hook (only with ?dev in the address): show any problem, e.g. MQL.ask(MathEngine.make('sub-100', 2)).
  if (/[?&]dev\b/.test(location.search)) window.MQL.ask = ask;
  // Device testing: ?dev&quiz=sub-100&grade=2 shows practice questions right away.
  const qs = new URLSearchParams(location.search);
  if (qs.has('dev') && qs.get('quiz') && MathEngine.SKILLS[qs.get('quiz')]) {
    (async () => {
      await sleep(300);
      ui.textContent = '';
      handler = null;
      S = newState('Tester', Number(qs.get('grade')) || 0);
      S.sidekick = 'sproutle';
      for (;;) await ask(MathEngine.make(qs.get('quiz'), S.grade, S.skills), { head: 'Practice' });
    })();
  }
})();
