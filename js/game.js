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
  // Version label under the controls, e.g. "rev 29 · Oct 20".
  if (typeof REV !== 'undefined') {
    const d = new Date(REV.date + 'T12:00:00');
    document.getElementById('rev').textContent = `rev ${REV.n} · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  // Testing tools show up only with ?dev in the address.
  const DEV = /[?&]dev\b/.test(location.search);
  const FAMILY_PHRASE = {
    add: 'adding', sub: 'take-away', compare: 'number',
    mult: 'grouping', div: 'sharing', mixed: 'all kinds of',
  };
  const FAMILY_LABEL = {
    add: 'Adding', sub: 'Taking away', compare: 'Numbers: counting, comparing, place value',
    mult: 'Groups: skip counting, doubles, times', div: 'Sharing: parts, halves, division, fractions', mixed: 'All kinds of math',
  };
  // Praise the strategy, not the kid (Mueller & Dweck): name what worked.
  const STRATEGY = {
    'count-10': 'Counting carefully', 'compare-10': 'Using the number line', 'add-10': 'Counting on', 'sub-10': 'Counting back',
    'skip-10': 'Finding the pattern', 'parts-10': 'Finding the missing part', 'add-20': 'Making a ten', 'sub-20': 'Thinking adding',
    compare: 'Checking the tens', 'place-tens': 'Counting the tens', doubles: 'Knowing your doubles', 'missing-20': 'Finding the mystery number',
    'add-100': 'Lining up the places', 'sub-100': 'Borrowing carefully', 'place-100': 'Thinking about places', 'equal-groups': 'Skip counting',
    halves: 'Splitting it in half', 'add-1000': 'Adding column by column', 'sub-1000': 'Subtracting column by column', round: 'Checking the next digit',
    'mult-facts': 'Using a times fact', 'div-facts': 'Thinking multiplication', 'add-multi': 'Lining up the places', 'sub-multi': 'Borrowing carefully',
    'round-big': 'Checking the next digit', 'mult-1digit': 'Splitting it up', 'div-1digit': 'Going one digit at a time', 'equiv-frac': 'Growing the fraction',
    'dec-add': 'Lining up the points', 'dec-sub': 'Lining up the points', 'dec-place': 'Thinking about tenths', 'mult-2digit': 'Splitting it up',
    'div-long': 'Going one digit at a time', 'frac-add': 'Matching the bottoms',
  };
  const praiseFor = (p) => pick([`${STRATEGY[p.skillId] || 'Careful thinking'} worked!`, `Nice! ${STRATEGY[p.skillId] || 'Careful thinking'} did it.`]);

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
      badgeGrade: {}, // badge flag -> highest grade it was won at (sets its color)
      badgeWins: {}, // badge flag -> every grade it was won at (for the mythical)
      goldens: {}, // Legends befriended as golden
      streak: 0, // first-try answers in a row (10 makes a golden Legend appear)
    };
  }
  // Older saves won badges before badge colors existed: count them at the save's grade.
  function upgradeSave(s) {
    s.badgeGrade = s.badgeGrade && typeof s.badgeGrade === 'object' ? s.badgeGrade : {};
    for (const f of BADGE_FLAGS) if (s.flags && s.flags[f] && !(f in s.badgeGrade)) s.badgeGrade[f] = s.grade || 0;
    s.badgeWins = s.badgeWins && typeof s.badgeWins === 'object' ? s.badgeWins : {};
    for (const f of BADGE_FLAGS) if (f in s.badgeGrade && !s.badgeWins[f]) s.badgeWins[f] = [s.badgeGrade[f]];
    s.goldens = s.goldens && typeof s.goldens === 'object' ? s.goldens : {};
    s.streak = Number(s.streak) || 0;
    return s;
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      return upgradeSave(Object.assign(newState(s.name || 'Hero', s.grade || 0), s));
    } catch (e) { return null; }
  }
  function writeSave() {
    if (!S) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode !== 'title') writeSave(); });
  // Leaving the page (the launcher's home screen, a reload) saves too.
  window.addEventListener('pagehide', () => { if (mode !== 'title') writeSave(); });

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

  // iPhone and iPad keep speech and sound locked until a tap *ends* (touchend or
  // click; pointerdown doesn't count), so unlock both on the first one and say
  // whatever was missed while locked.
  let unlocked = false, missed = null;
  function unlockAudio() {
    if (unlocked) return;
    unlocked = true;
    try {
      if (soundOn) {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        const src = actx.createBufferSource();
        src.buffer = actx.createBuffer(1, 1, 22050);
        src.connect(actx.destination);
        src.start(0);
        actx.resume();
      }
    } catch (e) { /* no audio */ }
    if (!window.speechSynthesis) return;
    if (missed) { speak(missed.text, missed.force); return; }
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.speak(u);
    } catch (e) { /* no voice */ }
  }
  for (const ev of ['touchend', 'click', 'keydown']) window.addEventListener(ev, unlockAudio, { capture: true, passive: true });

  function speak(text, force) {
    if (!(force || (S && S.voice)) || !window.speechSynthesis) return;
    if (!unlocked) missed = { text, force };
    try {
      // Safari can drop an utterance spoken right after cancel(), so only cancel
      // when something is actually playing.
      if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
      speechSynthesis.resume();
      const u = new SpeechSynthesisUtterance(spoken(text));
      const v = currentVoice();
      if (v) { u.voice = v; u.lang = v.lang; }
      // Natural voices sound best a little under normal speed; basic ones a touch
      // slower still. Settings -> Reading speed scales both.
      u.rate = (v && voiceScore(v) >= 30 ? 0.9 : 0.88) * (READ_SPEEDS[S && S.readSpeed] || 1);
      u.pitch = 1;
      speechSynthesis.speak(u);
    } catch (e) { /* no voice */ }
  }
  const READ_SPEEDS = { slower: 0.8, normal: 1, faster: 1.15 };
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
      const code = /^[0-9.]$/.test(key) ? key : key === 'Backspace' ? 'del' : key === 'Enter' ? 'ok' : null;
      if (code) { e.preventDefault(); document.body.classList.add('kb'); keyInput(code); return; }
    }
    const btn = key === 'Enter' ? (handler ? 'a' : 'start') : KEYS[key];
    if (!btn) return;
    e.preventDefault();
    document.body.classList.add('kb');
    // Some handhelds send their D-pad as both a gamepad and arrow keys; take one.
    if (!fresh(btn, 'key')) return;
    if (DIRS[btn] && !held.includes(btn)) held.push(btn);
    // With a controller, arrows walk the keypad cursor during a question. The
    // other keys work as usual (digits type, Enter checks, H or X is a hint).
    if (keyInput && padSeen && DIRS[btn]) { padPress(btn); return; }
    if (!e.repeat || handler) press(btn);
  });
  window.addEventListener('keyup', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const i = held.indexOf(KEYS[key]);
    if (i >= 0) held.splice(i, 1);
  });
  window.addEventListener('blur', () => { held.length = 0; });
  window.addEventListener('pointerdown', () => document.body.classList.remove('kb'));
  // iPhone/iPad: no zooming anywhere. Safari ignores user-scalable=no in the
  // browser, so block quick double taps and pinches here (typing boxes excepted).
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd < 400 && !(e.target.closest && e.target.closest('input, textarea'))) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });

  // ---------------------------------------------------------------- number keypad
  // While a question wants a typed answer, the D-pad and A/B buttons swap
  // for a big number keypad (like Math Quest's).
  const consoleEl = document.querySelector('.console');
  let keyInput = null;
  const keypad = (() => {
    const k = el('div', 'keypad');
    k.hidden = true;
    for (const key of ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok', '.']) {
      const label = key === 'del' ? '⌫' : key === 'ok' ? '✓' : key;
      const b = el('button', 'key' + (key === 'del' ? ' del' : key === 'ok' ? ' ok' : key === '.' ? ' dot' : ''), label);
      b.type = 'button';
      b.dataset.key = key;
      b.setAttribute('aria-label', key === 'del' ? 'Erase' : key === 'ok' ? 'Check my answer' : key === '.' ? 'Decimal point' : key);
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
  // Controls below the screen, or on both sides like a Switch. Auto uses the
  // sides when the device is sideways, and no on-screen controls once a game
  // controller is used (handhelds like the Retroid Pocket have their own
  // buttons). Saved per device, not in save files.
  const LAYOUTS = ['auto', 'side', 'below', 'handheld'];
  let layout = 'auto';
  try { layout = localStorage.getItem('mql:layout') || 'auto'; } catch (e) { /* ignore */ }
  // ?handheld in the address (the launcher app adds it) starts in controller mode.
  let padSeen = /[?&]handheld\b/.test(location.search);
  const wide = matchMedia('(orientation: landscape) and (min-width: 600px)');
  const roomy = matchMedia('(min-width: 600px)'); // phones held upright are too narrow for grips
  const tall = matchMedia('(orientation: portrait)'); // phones held upright with a controller
  function applyLayout() {
    const handheld = layout === 'handheld' || (layout === 'auto' && padSeen);
    const side = !handheld && ((layout === 'side' && roomy.matches) || (layout === 'auto' && wide.matches));
    consoleEl.classList.toggle('handheld', handheld);
    consoleEl.classList.toggle('upright', handheld && tall.matches);
    consoleEl.classList.toggle('side', side);
    if (keyInput) drawCursor();
  }
  wide.addEventListener('change', applyLayout);
  tall.addEventListener('change', applyLayout);
  roomy.addEventListener('change', applyLayout);
  applyLayout();
  function layoutLabel() {
    if (layout === 'side') return 'On the sides';
    if (layout === 'below') return 'Below';
    if (layout === 'handheld') return 'Controller';
    return padSeen ? 'Auto (controller)' : wide.matches ? 'Auto (sides)' : 'Auto (below)';
  }

  function showKeypad(fn, dec = false) {
    keyInput = fn;
    keypad.hidden = false;
    keypad.classList.toggle('dec', dec);
    consoleEl.classList.add('typing');
    cursor = keyAt('5'); // the middle, the fewest presses from any key
    drawCursor();
  }
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

  // ---------------------------------------------------------------- game controllers
  // Handhelds (Retroid Pocket) and Bluetooth gamepads come in two ways: the
  // browser's Gamepad API, polled every frame, and the launcher app, which
  // reads the buttons itself and calls LauncherPad.set('a', true). Both go through
  // padSet(). Button numbers differ between devices, so the map can be changed
  // on the device: localStorage 'mql:padmap' = '{"0":"b","1":"a"}' (see tools/pad-test.html).
  // Select is MENU and Start opens the map. Buttons not in the map (C and Z) do nothing.
  const PAD_MAP = { 0: 'a', 1: 'b', 2: 'x', 3: 'y', 8: 'select', 9: 'start', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
  let padMap = PAD_MAP;
  try { padMap = { ...PAD_MAP, ...JSON.parse(localStorage.getItem('mql:padmap') || '{}') }; } catch (e) { /* ignore */ }
  const padDown = {}; // button -> when it went down
  const padRepeat = {}; // direction -> when it last repeated
  const lastBtn = {}; // button -> { src, t }, to drop the same press arriving twice
  function fresh(btn, src) {
    const now = performance.now(), l = lastBtn[btn];
    if (l && l.src !== src && now - l.t < 150) return false;
    lastBtn[btn] = { src, t: now };
    return true;
  }
  function padSet(btn, down, src = 'pad') {
    if (!btn) return;
    if (!down) {
      delete padDown[btn];
      const i = held.indexOf(btn);
      if (i >= 0) held.splice(i, 1);
      return;
    }
    if (padDown[btn]) return;
    padDown[btn] = padRepeat[btn] = performance.now();
    if (!fresh(btn, src)) return;
    if (DIRS[btn] && !held.includes(btn)) held.push(btn);
    padPress(btn);
  }
  function padPress(btn) {
    document.body.classList.add('kb');
    if (!padSeen) { padSeen = true; applyLayout(); }
    if (keyInput) {
      // Typed answers: the D-pad walks a cursor over the keypad, A presses the
      // key under it, B erases, Start checks the answer and X or Y asks for a hint.
      if (DIRS[btn]) return moveCursor(btn);
      if (btn === 'a') return padKey(keyRows()[cursor.r][cursor.c]);
      if (btn === 'b') return padKey('del');
      if (btn === 'start') return padKey('ok');
      if (btn === 'x' || btn === 'y') press('b');
      return;
    }
    if (btn === 'x' || btn === 'y') return;
    // On a controller Select is MENU and Start opens the map (on the Retroid
    // Pocket Classic: the top and lower of the two small buttons).
    press(btn === 'select' ? 'start' : btn === 'start' ? 'map' : btn);
  }

  // The keypad as it looks on screen: a phone-style 3 x 4 grid, or on upright
  // handhelds two rows under the screen (1-5, 6-0). Grade 5 adds a decimal point.
  // A key listed twice is one wide key.
  let cursor = { r: 1, c: 1 };
  function keyRows() {
    const dec = keypad.classList.contains('dec');
    if (consoleEl.classList.contains('upright')) {
      return dec ? [['1', '2', '3', '4', '5', '.', 'del'], ['6', '7', '8', '9', '0', 'ok', 'ok']]
        : [['1', '2', '3', '4', '5', 'del'], ['6', '7', '8', '9', '0', 'ok']];
    }
    return [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'],
      ...(dec ? [['del', '0', '.'], ['ok', 'ok', 'ok']] : [['del', '0', 'ok']])];
  }
  function keyAt(key) {
    const rows = keyRows(), r = rows.findIndex((row) => row.includes(key));
    return { r, c: rows[r].indexOf(key) };
  }
  function moveCursor(dir) {
    const rows = keyRows(), [dx, dy] = DIRS[dir], from = rows[cursor.r][cursor.c];
    const r = Math.max(0, Math.min(rows.length - 1, cursor.r + dy));
    let c = Math.min(cursor.c, rows[r].length - 1);
    // Sideways steps over the rest of a wide key.
    if (dx) do c += dx; while (c >= 0 && c < rows[r].length && rows[r][c] === from);
    if (c < 0 || c >= rows[r].length || (r === cursor.r && c === cursor.c)) return;
    cursor = { r, c };
    sfx('move');
    drawCursor();
  }
  function drawCursor() {
    const rows = keyRows();
    if (!rows[cursor.r] || !rows[cursor.r][cursor.c]) cursor = keyAt('5'); // the layout changed
    const key = keyInput ? rows[cursor.r][cursor.c] : null;
    keypad.querySelectorAll('.key').forEach((b) => b.classList.toggle('cur', b.dataset.key === key));
  }
  function padKey(key) {
    const b = keypad.querySelector(`[data-key="${key}"]`);
    if (b) { b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 120); }
    keyInput(key);
  }

  // Held directions repeat in menus and on the keypad, like a held arrow key.
  // Walking in the world uses held[] instead.
  const axisDirs = (x, y) => [x < -0.5 && 'left', x > 0.5 && 'right', y < -0.5 && 'up', y > 0.5 && 'down'];
  const apiDown = new Set();
  let appDriven = false; // the launcher app sends the buttons, so don't read them twice
  function padTick(now) {
    const pads = !appDriven && navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    if (pads.length) {
      const down = new Set();
      for (const gp of pads) {
        gp.buttons.forEach((b, i) => { if (b.pressed && padMap[i]) down.add(padMap[i]); });
        // D-pads without the standard mapping show up as axes: 0/1, or 6/7 (Android's hat).
        for (const [ax, ay] of [[0, 1], [6, 7]]) {
          if (gp.axes.length > ay) axisDirs(gp.axes[ax], gp.axes[ay]).forEach((d) => d && down.add(d));
        }
      }
      for (const btn of down) if (!apiDown.has(btn)) padSet(btn, true);
      for (const btn of apiDown) if (!down.has(btn)) padSet(btn, false);
      apiDown.clear();
      down.forEach((btn) => apiDown.add(btn));
    }
    if (handler || keyInput) {
      for (const d of Object.keys(DIRS)) {
        if (padDown[d] && now - padDown[d] > 380 && now - padRepeat[d] > 120) { padRepeat[d] = now; padPress(d); }
      }
    }
    requestAnimationFrame(padTick);
  }
  requestAnimationFrame(padTick);
  window.addEventListener('blur', () => { for (const btn of Object.keys(padDown)) padSet(btn, false); apiDown.clear(); });
  // For the launcher app: LauncherPad.set('a', true) when A goes down, false when it
  // comes up. (MQLPad is its first name, still answered to.)
  window.LauncherPad = window.MQLPad = { set: (btn, down) => { appDriven = true; padSet(btn, down, 'app'); } };

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
  // Splits a line into pages that each fit the dialog box, breaking between words.
  function pages(text) {
    const box = showDialog(), txt = box.querySelector('.txt');
    box.classList.remove('split');
    const fits = (t) => { txt.textContent = t; return box.scrollHeight <= box.clientHeight + 1; };
    const out = [];
    let words = fill(text).split(' ');
    while (words.length) {
      let n = words.length;
      while (n > 1 && !fits(words.slice(0, n).join(' '))) n -= 1;
      // Prefer ending a page at the end of a sentence.
      if (n < words.length) for (let k = n; k > 1; k -= 1) if (/[.!?]$/.test(words[k - 1])) { n = k; break; }
      out.push(words.slice(0, n).join(' '));
      words = words.slice(n);
    }
    txt.textContent = '';
    return out;
  }
  async function say(lines, opts = {}) {
    for (const line of [].concat(lines)) for (const page of pages(line)) await sayLine(page);
    if (!opts.keep) hideDialog();
  }

  // A list of choices. Items are strings or { label, sub, icon, dim }.
  // Resolves to the chosen index, or -1 when cancelled with B.
  function choose(items, opts = {}) {
    const { cancel = true, cols = 1, cls = '', start = 0, head, onStart = false } = opts;
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
        else if (btn === 'start' && onStart) return done(-2); // MENU pressed
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
    if (v.kind === 'numberline') {
      // Ticks every `step`, labels at the ends and at the marked numbers.
      const n = Math.round((v.to - v.from) / v.step);
      if (n < 1 || n > 20) return null;
      const track = el('div', 'track');
      const pos = (x) => ((x - v.from) / (v.to - v.from)) * 100 + '%';
      for (let i = 0; i <= n; i++) {
        const t = el('span', 'tick' + (i === 0 || i === n ? ' end' : ''));
        t.style.left = pos(v.from + i * v.step);
        track.append(t);
      }
      const labeled = new Set(v.marks.map((m) => m.at));
      for (const at of [v.from, v.to]) if (!labeled.has(at)) v.marks = [...v.marks, { at, label: at, cls: 'end' }];
      for (const m of v.marks) {
        const dot = el('span', 'mark ' + (m.cls || ''));
        dot.style.left = pos(m.at);
        dot.append(el('b', null, String(m.label)));
        track.append(dot);
      }
      wrap.append(track);
      return wrap;
    }
    if (v.kind === 'bars') {
      // Fraction bars: each row split into equal parts, some shaded.
      for (const row of v.rows) {
        const bar = el('div', 'bar');
        bar.append(el('span', 'lbl', `${row.filled}/${row.parts}`));
        const cells = el('div', 'cells');
        for (let i = 0; i < row.parts; i++) cells.append(el('span', 'cell' + (i < row.filled ? ' on' : '')));
        bar.append(cells);
        wrap.append(bar);
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
      if (v.mode === 'show') wrap.append(group(v.a, 'a'));
      else wrap.append(group(v.a, 'a'), el('span', 'sign', v.mode === 'add' ? '+' : '−'), group(v.b, v.mode === 'add' ? 'b' : 'x'));
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
      const bm = S.party.find((c) => c.sp === S.sidekick);
      face.src = Art.creatureURL(S.sidekick || 'sproutle', !!(bm && bm.golden));
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

      // Long answers (like 102,000) go 2 x 2 with smaller text so they always fit.
      const longest = Math.max(...p.choices.map((c) => MathEngine.show(c).length));
      const cols = p.choices.length === 4 && longest > 3 ? 'two' : p.choices.length === 4 ? 'four' : p.choices.length === 3 ? 'three' : 'two';
      const grid = el('div', `answers ${cols}${longest >= 9 ? ' xlong' : longest >= 6 ? ' long' : ''}`);
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
        const b = el('button', 'ans', MathEngine.show(c));
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
        S.lessons = S.lessons || {};
        const seen = S.lessons[p.skillId] || 0;
        S.lessons[p.skillId] = seen + 1;
        const lesson = MathEngine.teach(p, seen);
        let lead = `${buddyName()}: Your turn! Try one just like it.`;
        if (lesson) {
          await teachPanel(lesson);
          // Naming the strategy helps it stick (self-explanation). Grade 1 and up.
          if (S.grade > 0) {
            const others = MathEngine.TRICKS.filter((x) => x !== lesson.title).sort(() => Math.random() - 0.5).slice(0, 2);
            const opts = [lesson.title, ...others].sort(() => Math.random() - 0.5);
            const i = await choose(opts, { cls: 'start-menu', head: 'Which trick did we use?', cancel: false });
            lead = opts[i] === lesson.title
              ? `${buddyName()}: Yes! ${lesson.title}. Use it on this one!`
              : `${buddyName()}: We used "${lesson.title}". Try it on this one!`;
          }
        }
        const t = MathEngine.twin(p);
        await say(lead);
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
          entry.textContent = MathEngine.show(p.answer);
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
          if (k === 'ok') { if (typed && typed !== '.') answer(-1, Number(typed)); return; }
          if (k === 'del') typed = typed.slice(0, -1);
          else if (k === '.') { if (!p.dec || typed.includes('.')) return; typed = (typed || '0') + '.'; }
          else if (typed.length < 7) typed = (typed === '0' ? '' : typed) + k;
          sfx('move');
          setEntry();
        }, !!p.dec);
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
        const longest = Math.max(...s.choices.map((c) => MathEngine.show(c).length));
        grid.className = 'answers ' + (s.choices.length === 2 || longest >= 7 ? 'two' : 'three') + (longest >= 9 ? ' xlong' : longest >= 6 ? ' long' : '');
        box.scrollTop = 0;
        btns = s.choices.map((c, i) => {
          const b = el('button', 'ans', MathEngine.show(c));
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
    // The last 10 tries (1 = right on the first try), for "How am I doing?".
    s.recent = [...(s.recent || []), result === 'first' ? 1 : 0].slice(-10);
    // 10 first tries in a row: the next wild Legend is golden.
    S.streak = result === 'first' ? (S.streak || 0) + 1 : 0;
    if (S.streak >= GOLD_STREAK) S.goldenReady = true;
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
      S.review.push({ ...MathEngine.saveable(p), key, box: 1, due: Date.now() + DAY });
      if (S.review.length > 30) S.review.shift();
    }
  }

  const GOLD_STREAK = 10;

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
    return t === null || SOLID.has(t) || !!npcAt(x, y) || !!specialAt(x, y);
  }
  let mapSteps = 0; // steps taken since arriving on this map
  function placePlayer(mapId, x, y, dir) {
    mapSteps = 0;
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
    mapSteps++;
    const pt = portalAt(P.x, P.y);
    if (pt) {
      busy = true;
      await usePortal(pt);
      busy = false;
      return;
    }
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
    const ri = rivalHere();
    if (ri >= 0 && mapSteps === 4) {
      busy = true;
      await rivalBattle(ri);
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
    else if (btn === 'map') openMap();
  }
  async function openMap() {
    busy = true;
    sfx('select');
    await mapMenu();
    busy = false;
  }

  async function interact() {
    const [dx, dy] = DIRS[P.dir];
    const x = P.x + dx, y = P.y + dy;
    const buddyHere = S.sidekick && !F.stacked && F.x === x && F.y === y;
    let n = npcAt(x, y);
    if (!n && tileAt(x, y) === 'c') n = npcAt(x + dx, y + dy); // talk across a counter
    const t = tileAt(x, y);
    const sign = map().signs[`${x},${y}`];
    const spec = specialAt(x, y);
    if (spec && !buddyHere && !n) {
      busy = true;
      try { await specialBattle(spec); } finally { busy = false; }
      return;
    }
    const pt = portalAt(x, y);
    if (pt && !buddyHere && !n) {
      const w = WORLDS[pt.world - 1];
      busy = true;
      await say(pt.home ? ['A portal home to the Portal Shrine.'] : worldOpen(w) ? [`A portal to ${w.name}.`, w.start ? 'Step in to go there!' : 'That world is still being built.'] : [`A sleeping portal to ${w.name}.`, `Beat ${WORLDS[w.id - 2].name} to wake it up.`]);
      busy = false;
      return;
    }
    if ((t === '}' || t === 'Σ') && !buddyHere && !n) {
      busy = true;
      try { await badgeCase(); } finally { busy = false; }
      return;
    }
    if (t === '¦' && !buddyHere && !n) {
      busy = true;
      try { await storageMenu(); } finally { busy = false; }
      return;
    }
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

  // ---------------------------------------------------------------- the buddy

  // Each starter buddy has its own way of talking; other Legends sound friendly.
  const VOICE = {
    sproutle: {
      hi: ['Hi hi! I\'m so happy we\'re a team!', 'Let\'s grow our brains today!', 'I found a ladybug! Oh, and I\'m ready for puzzles.'],
      go: 'Ooh, practice time! Let\'s grow!',
      done: ['We\'re growing so fast!', 'That was fun! Let\'s do it again soon.'],
    },
    emberkit: {
      hi: ['Ready for action! My tail is glowing!', 'Let\'s blaze through some puzzles!', 'I\'m all fired up. Are you?'],
      go: 'Let\'s go! Full power!',
      done: ['We\'re on fire!', 'My tail is glowing extra bright!'],
    },
    splashfin: {
      hi: ['Take a deep breath. We\'ve got this.', 'Nice and calm. One step at a time.', '*blows a bubble* Hello, friend.'],
      go: 'Let\'s go slow and steady.',
      done: ['Smooth as water.', 'Calm and careful wins every time.'],
    },
  };
  const voice = () => VOICE[S.sidekick] || VOICE[baseForm(S.sidekick)] || {
    hi: ['Hi! I\'m happy to be your buddy!', `I love ${FAMILY_PHRASE[SPECIES[S.sidekick].family] || 'all kinds of'} puzzles. Let's do some together!`],
    go: 'Let\'s practice together!',
    done: ['Great teamwork!', 'We make a good team!'],
  };
  const buddyMon = () => S.party.find((c) => c.sp === S.sidekick);

  // Talking to the buddy: a hello, then practice, a progress check or a tip.
  async function buddyTalk() {
    if (!S.sidekick) return;
    await say(`${buddyName()}: ${pick(voice().hi)}`, { keep: true });
    for (;;) {
      const i = await choose(['Practice with me', 'How am I doing?', 'What should we work on?', 'Bye!'], { cls: 'start-menu', head: buddyName() });
      hideDialog();
      if (i === 0) { await buddyPractice(); return; }
      if (i === 1) await buddyProgress();
      else if (i === 2) await buddyTip();
      else return;
    }
  }

  // The skill the buddy wants to practice: the weakest one, or a mix once all are strong.
  const allMastered = () => MathEngine.gradeSkills(S.grade).every((id) => MathEngine.stretchLevel(S.skills[id]) === 2);

  async function buddyTip() {
    const weak = MathEngine.weakestSkill(S.grade, S.skills);
    const s = S.skills[weak];
    const legend = SPECIES[speciesFor(MathEngine.SKILLS[weak].family)].name;
    if (allMastered()) {
      await say([`${buddyName()}: All that practice paid off! Every skill is strong.`, 'Maybe ask a grown-up about trying the next grade.']);
      return;
    }
    await say([
      `${buddyName()}: Let's practice ${MathEngine.SKILLS[weak].label.toLowerCase()}!`,
      !s || s.attempts < 3 ? `${legend} loves those puzzles.` : `${legend} loves those puzzles. We're getting better at them!`,
      'We can find one in the tall grass, or practice right here with me.',
    ]);
  }

  // Five quick puzzles on the skill that needs it most. Counts like any other practice.
  async function buddyPractice() {
    const mixed = allMastered();
    const skill = MathEngine.weakestSkill(S.grade, S.skills);
    await say(`${buddyName()}: ${voice().go} ${mixed ? 'A little of everything!' : MathEngine.SKILLS[skill].label + '!'}`);
    let firsts = 0;
    let last = null;
    for (let n = 0; n < 5; n++) {
      const p = MathEngine.make(mixed ? MathEngine.pickSkill(S.grade, S.skills) : skill, S.grade, S.skills);
      const r = await ask(p, { head: `Practice with ${buddyName()} ${n + 1}/5` });
      record(p, r.result, r.ms);
      if (r.result === 'first') firsts++;
      last = p;
    }
    const lines = [`${buddyName()}: ${firsts} of 5 on the first try!`];
    if (firsts === 5) lines.push(`${praiseFor(last)} ${pick(voice().done)}`);
    else if (firsts >= 3) lines.push(`${pick(voice().done)} Every puzzle makes us stronger.`);
    else lines.push('Those were tricky. Mistakes help our brains grow! Let\'s try again later.');
    await say(lines);
    // The buddy learns too: a little XP for each first-try answer.
    const c = buddyMon();
    if (c && firsts) {
      c.xp += firsts * 4;
      await say(`${nameOf(c)} got ${firsts * 4} XP!`);
      while (c.xp >= xpNeed(c.lv)) {
        c.xp -= xpNeed(c.lv);
        c.lv++;
        c.hp = Math.min(maxHp(c), c.hp + 3);
        sfx('level');
        await say(`${nameOf(c)} grew to level ${c.lv}!`);
      }
    }
    await checkEvolutions();
    writeSave();
  }

  // A friendly progress report built from the last 10 tries of each skill.
  async function buddyProgress() {
    const total = Object.values(S.skills).reduce((n, s) => n + s.attempts, 0);
    const mine = MathEngine.gradeSkills(S.grade).filter((id) => S.skills[id] && S.skills[id].attempts >= 3);
    if (!mine.length) {
      await say([`${buddyName()}: We're just getting started!`, 'Let\'s solve some puzzles together, and I\'ll keep track.']);
      return;
    }
    const recentAcc = (s) => { const r = s.recent || []; return r.length ? r.reduce((a, b) => a + b, 0) / r.length : MathEngine.accuracy(s); };
    const label = (id) => MathEngine.SKILLS[id].label.toLowerCase();
    const best = mine.slice().sort((a, b) => recentAcc(S.skills[b]) - recentAcc(S.skills[a]))[0];
    const bs = S.skills[best], br = bs.recent || [];
    const lines = [`${buddyName()}: We've solved ${total} puzzle${total === 1 ? '' : 's'} together!`];
    lines.push(br.length >= 3 ? `Your strongest is ${label(best)}: ${br.reduce((a, b) => a + b, 0)} of the last ${br.length} right on the first try!` : `You're doing great at ${label(best)}!`);
    // Getting better: recent tries beat the overall record by a good margin.
    const up = mine.find((id) => id !== best && (S.skills[id].recent || []).length >= 5 && recentAcc(S.skills[id]) - MathEngine.accuracy(S.skills[id]) >= 0.15);
    if (up) lines.push(`You're getting better at ${label(up)}. Practice is working!`);
    const weak = MathEngine.weakestSkill(S.grade, S.skills);
    if (!allMastered() && weak !== best) lines.push(`Next, let's keep working on ${label(weak)}.`);
    await say(lines);
  }

  // Little twinkles around rare and golden Legends.
  function sparkles(cx, cy, now, r = 12) {
    for (let i = 0; i < 4; i++) {
      const a = now / 600 + i * Math.PI / 2, on = Math.floor(now / 200 + i) % 3 !== 0;
      if (!on) continue;
      const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r * 0.8);
      ctx.fillStyle = '#fff6d6'; ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3);
      ctx.fillStyle = '#f2c84b'; ctx.fillRect(x, y, 1, 1);
    }
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
    const spin = Math.floor(now / 160) % 4;
    for (const pt of m.portals || []) {
      if (!portalShown(pt)) continue;
      const w = WORLDS[pt.world - 1];
      ctx.drawImage(Art.portal(w.color, spin, worldOpen(w)), pt.x * TS - camX, pt.y * TS - camY);
    }
    // ox/oy/frame let a person walk between tiles (Remy walking up to you).
    const ents = m.npcs.map((n) => ({ y: n.y * TS + (n.oy || 0), x: n.x * TS + (n.ox || 0), img: Art.person(LOOKS[n.look], n.dir, n.frame || 0), oy: -3 }));
    if (S.sidekick && !F.stacked) {
      // While walking up or down the screen is already scrolling, so the buddy doesn't
      // hop then (it looked like shaking); it hops while walking sideways and when idle.
      const vertical = P.moving && F.fx === F.tx;
      const hop = vertical ? 0 : P.moving ? (P.t < STEP_MS / 2 ? 1 : 0) : Math.floor(now / 500) % 2;
      const bm = S.party.find((c) => c.sp === S.sidekick);
      const img = Art.creatureSmall(S.sidekick, hop, !!(bm && bm.golden));
      ents.push({ y: F.py, sy: F.py - 0.5, x: Math.round(F.px) - 2, img, oy: -5, flip: F.dir === 'right' });
    }
    for (const sp of SPECIALS) {
      if (sp.map !== S.map || !specialReady(sp)) continue;
      ents.push({ y: sp.y * TS, x: sp.x * TS - 2, img: Art.creatureSmall(sp.id, Math.floor(now / 400) % 2), oy: -5, sparkle: true });
    }
    const frame = P.moving && P.t < STEP_MS * 0.6 ? 1 + (P.step % 2) : 0;
    ents.push({ y: P.py, x: Math.round(P.px), img: Art.person(LOOKS.hero, P.dir, frame), oy: -3 });
    ents.sort((a, b) => (a.sy ?? a.y) - (b.sy ?? b.y));
    for (const e of ents) {
      const x = e.x - camX, y = Math.round(e.y) - camY + e.oy;
      if (e.flip) {
        ctx.save();
        ctx.translate(x + e.img.width, y);
        ctx.scale(-1, 1);
        ctx.drawImage(e.img, 0, 0);
        ctx.restore();
      } else ctx.drawImage(e.img, x, y);
      if (e.sparkle) sparkles(x + 10, y + 10, now);
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
      const n = badgeCount(1);
      if (n < 5) return say([`You have ${n} badge${n === 1 ? '' : 's'}! Way to go!`, 'Each place up north has a new boss to beat.', 'Check the MENU map to travel fast.']);
      return say(['All five badges! You\'re a true Math Quest Legend!', 'The Portal Shrine by the town gate can take you to new worlds.', 'And if you start a harder grade, the bosses will want a rematch!']);
    },

    async starter(n) {
      const id = STARTERS[n - 1], sp = SPECIES[id];
      if (S.flags.starter) {
        await say(S.party.some((c) => c.sp === id) ? `${sp.name} used to sleep right here!` : `${sp.name} is taking a nap. Professor Pi looks after it.`);
        return;
      }
      const close = popCreature(id);
      const ok = await yesNo([`This is ${sp.name}!`, sp.dex, `Want ${sp.name} to be your buddy?`]);
      if (!ok) { close(); return; }
      S.party.push(mon(id, 5));
      S.sidekick = id;
      S.starterId = id;
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
    forestKid: () => say(['Mushgroup grows in rings.', 'Count the groups, then count how many in each!']),
    riverKid: () => say(['Beaverbite chews logs smaller and smaller.', 'That\'s taking away, one bite at a time!']),
    swampKid: () => say(['Lilysplit\'s pad is cut into equal parts.', 'Equal parts are the secret to fractions!']),
    treetopsKid: () => say(['Toucount keeps tally marks on its beak.', 'Count by fives: each bundle of marks is 5!']),
    parkKid: () => say(['Sprinklet sprays water in equal groups.', '3 groups of 4 drops is 12 drops!']),
    rooftopsKid: () => say(['Bricklet stacks bricks in rows.', 'Rows times columns tells you how many!']),
    subwayKid: () => say(['Traintrio has cars in groups of three.', 'Count by 3s to count the cars!']),
    harborKid: () => say(['Lighthousey shines on the bigger number.', 'Look at the biggest place first!']),
    clocktowerKid: () => say(['Balloonsplit splits into equal balloons.', 'Sharing equally is dividing!']),
    reefKid: () => say(['Schoolio swims in groups of fish.', '4 groups of 5 fish is 20 fish!']),
    kelpKid: () => say(['Seamore is a seahorse who picks the bigger number.', 'Look at the biggest place first!']),
    wreckKid: () => say(['Prawnpairs always swim in pairs.', 'Doubles are pairs: 6 + 6 is 12!']),
    trenchKid: () => say(['Narwhalf splits things in half.', 'Half of 20 is 10!']),
    templeKid: () => say(['Mantarray has spots in neat rows.', 'Rows times spots in each row tells how many!']),
    meadow2Kid: () => say(['Goosegroup flies in a V of equal groups.', '2 groups of 5 geese is 10 geese!']),
    windmillKid: () => say(['Pinwheelie has blades in equal groups.', '4 blades times 3 pinwheels is 12 blades!']),
    rainbowKid: () => say(['Prismshare splits light into equal colors.', 'Sharing equally is dividing!']),
    stormKid: () => say(['Boltbig zaps the bigger number.', 'Compare the biggest place first!']),
    castleKid: () => say(['Starmore twinkles on the bigger number.', 'Every star you see is a number!']),
    waterfallKid: () => say(['The falls are loud, so think quietly.', 'Mistsplit splits into drops that are all the same size.']),

    // The way to the next area is closed until you beat this area's boss.
    gate: (w) => {
      const boss = Object.values(BOSSES).find((b) => b.flag === w.need);
      return say(['This way is closed for now.', `Beat ${boss.name} to open it!`]);
    },

    sage: () => {
      const open = WORLDS.filter(worldOpen).length;
      return say([
        'Welcome to the Portal Shrine!',
        'Each portal leads to a different world.',
        'Beat every boss in a world, and the next portal wakes up.',
        open > 1 ? `${open} of ${WORLDS.length} portals are awake.` : `Only the ${WORLDS[0].name} portal is awake so far.`,
      ]);
    },

    // Each boss opens with the Legend for your weakest skill, then its own partner.
    boss: async (areaId) => {
      const b = BOSSES[areaId], area = AREAS[areaId];
      const won = S.flags[b.flag], wonAt = S.badgeGrade[b.flag] ?? -1;
      if (won && (S.badgeWins[b.flag] || []).includes(S.grade)) return say(b.after);
      const tier = BADGE_TIERS[S.grade];
      let lv = area.base;
      if (won) {
        // Replaying at a higher grade: win again to upgrade the badge's color.
        await say(b.after, { keep: true });
        const upgrade = S.grade > wonAt;
        if (!(await yesNo(upgrade
          ? `${b.name.toUpperCase()}: You're doing ${GRADES[S.grade]} math now! Want a rematch? Win, and your ${b.badge} turns ${tier.name}.`
          : `${b.name.toUpperCase()}: Want a ${GRADES[S.grade]} rematch? Every grade you win at counts!`))) return;
        lv = Math.max(area.base, ...S.party.map((c) => c.lv)) - 2;
      } else await say(b.intro);
      const weak = MathEngine.weakestSkill(S.grade, S.skills);
      const first = area.species[MathEngine.SKILLS[weak].family];
      const result = await battle([mon(first, lv + 3, weak), mon(area.boss, lv + 4)], { trainer: b.name });
      if (result === 'win') {
        S.flags[b.flag] = true;
        S.badgeGrade[b.flag] = Math.max(wonAt, S.grade);
        S.badgeWins[b.flag] = [...new Set([...(S.badgeWins[b.flag] || []), S.grade])];
        sfx('level');
        if (won && S.grade > wonAt) await say([`${b.name.toUpperCase()}: Amazing! Your ${b.badge} is ${tier.name} now!`]);
        else if (won) await say([`${b.name.toUpperCase()}: Great rematch! That's a ${GRADES[S.grade]} win.`]);
        else await say([`${b.name.toUpperCase()}: ${b.win[0]}`, ...b.win.slice(1), `It's a ${tier.name} badge, for ${GRADES[S.grade]} math.`]);
        if (WORLDS.some((w) => w.areas[w.areas.length - 1] === areaId) && !won) await say(['A portal hums to life nearby!', 'It leads to the next world. The Portal Shrine in town has one too.']);
        writeSave();
      }
    },
  };

  // Badges won in one world (default: all of them).
  const badgeCount = (world) => (world ? WORLDS[world - 1].areas.map((a) => BOSSES[a].flag) : BADGE_FLAGS).filter((f) => S.flags[f]).length;
  // Which world a map belongs to. Town, houses and the shrine count as World 1.
  const worldOf = (id) => {
    const m = MAPS[id === 'center' ? S.healMap : id];
    return (m && m.area && AREAS[m.area].world) || 1;
  };
  const tierOf = (flag) => BADGE_TIERS[S.badgeGrade[flag] ?? 0];
  // World 1 is always open. Each later world opens when the one before it is beaten.
  const worldOpen = (w) => w.id === 1 || !!S.flags.devAll || !!(WORLDS[w.id - 2].done && S.flags[WORLDS[w.id - 2].done]);
  // Rare Legends waiting on the map (see SPECIALS in data.js).
  const mythicalOpen = () => WORLDS.some((w) => w.areas.length && GRADES.every((_, g) => w.areas.every((a) => (S.badgeWins[BOSSES[a].flag] || []).includes(g))));
  function specialReady(sp) {
    if (S.caught[sp.id]) return false;
    if (S.flags.devAll) return true;
    if (sp.kind === 'ultra') return S.grade === sp.grade && MathEngine.stretchLevel(S.skills[sp.skill]) >= 1;
    if (sp.kind === 'world') return !!S.flags[sp.need];
    return mythicalOpen();
  }
  const specialAt = (x, y) => SPECIALS.find((sp) => sp.map === S.map && sp.x === x && sp.y === y && specialReady(sp));

  async function specialBattle(sp) {
    const area = AREAS[map().area];
    const lv = sp.kind === 'mythical' ? 55 : (area ? area.base : 30) + (sp.kind === 'world' ? 8 : 5);
    const intro = sp.kind === 'ultra' ? [`A rare ${SPECIES[sp.id].name} is here, glowing softly...`, `It only shows up for ${GRADES[sp.grade]} math stars!`]
      : sp.kind === 'world' ? [`The Legend of ${WORLDS[sp.world - 1].name} is here!`, 'It wants to see how much you\'ve learned.']
      : ['The air shimmers. Numbers swirl like stars...', 'The mythical Infinix appears!'];
    await say(intro);
    await battle([mon(sp.id, lv, sp.skill)], { special: sp.kind });
  }

  const portalShown = (pt) => !pt.show || !!S.flags[pt.show] || !!S.flags.devAll;
  const portalAt = (x, y) => (map().portals || []).find((pt) => pt.x === x && pt.y === y && portalShown(pt));

  async function usePortal(pt) {
    const w = WORLDS[pt.world - 1];
    const back = () => { const [dx, dy] = DIRS[P.dir]; startStep(P.x - dx, P.y - dy); };
    if (!worldOpen(w)) {
      await say(['This portal is asleep.', `Beat every boss in ${WORLDS[w.id - 2].name} to wake it up.`]);
      return back();
    }
    if (!w.start) {
      await say([`This portal leads to ${w.name}.`, 'That world is still being built. Check back soon!']);
      return back();
    }
    sfx('level');
    if (pt.home) {
      await fade(() => { placePlayer('shrine', 6, 7, 'up'); writeSave(); });
      return say('Back at the Portal Shrine!');
    }
    await fade(() => { placePlayer(w.start.map, w.start.x, w.start.y, w.start.dir); writeSave(); });
    await say(`Welcome to ${w.name}!`);
  }
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
    forest: ['#eef6e4', '#d4e8c0', '#5a9a48', '#7cb868'],
    river: ['#e4f2fc', '#cfe6c4', '#8ac070', '#a8d88c'],
    swamp: ['#e6eadc', '#c4cca8', '#6a8a4a', '#8aaa6a'],
    treetops: ['#e8f6ff', '#cfe8b8', '#a0703a', '#c89a5a'],
    waterfall: ['#e6f2fa', '#cfdce6', '#7a8a98', '#a8b8c4'],
    meadow2: ['#eef4ff', '#d8e6fa', '#9ad47a', '#bce8a0'],
    windmill: ['#f2f6ff', '#e8e4c8', '#c8a050', '#e2c070'],
    rainbow: ['#fff4fa', '#f0e4f8', '#c8a8e8', '#e4d0f8'],
    storm: ['#3a3a58', '#4a4a6a', '#6a6a8a', '#8a8aaa'],
    castle: ['#f6f0ff', '#e4dcf4', '#b8a8d8', '#d4c8ec'],
    reef: ['#d8f4f8', '#b8e4ec', '#e8a868', '#f2c88a'],
    kelp: ['#d4f0e4', '#b4dcc8', '#5a9a5a', '#7cb87a'],
    wreck: ['#d8e8f0', '#b8c8d4', '#8a6a4a', '#a8885a'],
    trench: ['#1e2a40', '#2a3a58', '#3a5a7a', '#5a7aa0'],
    temple: ['#e0ecf0', '#c4d4dc', '#7a9aa8', '#9ab8c4'],
    park: ['#f2f8ea', '#d8ecc4', '#7cc060', '#a0d884'],
    rooftops: ['#e8f0fa', '#c8ccd8', '#8a8a9a', '#a8a8b8'],
    subway: ['#e4e4ec', '#c8c8d4', '#6a6a7a', '#8a8a9a'],
    harbor: ['#e4f2fc', '#d8e4ec', '#a07a4a', '#c89a6a'],
    clocktower: ['#f6ecdc', '#e2d4bc', '#a8957a', '#c8b89a'],
  };

  function drawBattle(now) {
    const [sky, band, pd, pl] = BATTLE_LOOK[S.lastArea] || BATTLE_LOOK.meadow;
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = band;
    ctx.fillRect(0, 40, W, 60);
    ctx.drawImage(Art.platform(32, 8, pd, pl), 92, 48);
    ctx.drawImage(Art.platform(34, 8, pd, pl), 4, 84);
    // Both Legends face each other, hop on their toes like they're squaring off,
    // and blink now and then (each on its own rhythm).
    const hop = (phase) => -Math.round(Math.abs(Math.sin(now / 260 + phase)) * 3);
    const blink = (offset) => (now + offset) % 3400 < 140;
    const fe = B.fx.e, fp = B.fx.p;
    if (!fe.hide) {
      // Evolved Legends are drawn bigger; they stay centered on the same spot.
      const ei = Art.creature(B.enemy.sp, blink(1700), !!B.enemy.golden), eg = ei.width - 48;
      ctx.drawImage(ei, 100 - eg / 2 + fe.dx, 8 - eg / 2 + fe.dy + hop(1.3));
      if (B.enemy.golden || B.special) sparkles(124 + fe.dx, 30 + fe.dy, now, 22);
    }
    if (!fp.hide) {
      ctx.save();
      const pi = Art.creature(B.me.sp, blink(0), !!B.me.golden), pg = pi.width - 48;
      ctx.translate(14 + 48 + pg / 2 + fp.dx, 44 - pg / 2 + fp.dy + hop(0));
      ctx.scale(-1, 1);
      ctx.drawImage(pi, 0, 0);
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
    return (p.story ? 20000 : 9000) + (['+', '−'].includes(p.op) && S.grade >= 2 ? 5000 : 0) + (S.grade >= 4 ? 10000 : 0);
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
        foes, ei: 0, enemy: foes[0], me: S.party.find(alive), trainer: opts.trainer || null, special: opts.special || null,
        fx: { e: { dx: 0, dy: 0, hide: false }, p: { dx: 0, dy: 0, hide: false } }, idle: true, firstTries: 0,
      };
      foes.forEach((f) => { S.seen[f.sp] = true; });
      B.eh = hud('enemy');
      B.ph = hud('me');
      updHud();
    });
    const fam = SPECIES[B.enemy.sp].family;
    if (B.trainer) await say([`${B.trainer} wants to battle!`, `${B.trainer} sends out ${nameOf(B.enemy)}!`]);
    else if (B.enemy.golden) await say([`A golden ${nameOf(B.enemy)} jumped out!`, 'It\'s sparkling! Golden Legends love first-try answers.']);
    else if (!B.special) await say([`A wild ${nameOf(B.enemy)} jumped out!`, `It loves ${FAMILY_PHRASE[fam]} puzzles!`]);
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
    if (result !== 'lose') await checkEvolutions();
    writeSave();
    return result;
  }

  // ---------------------------------------------------------------- rival
  // Remy's battle in this area, if you haven't won it yet.
  function rivalHere() {
    if (!map().area || !S.party.some(alive)) return -1;
    return RIVAL.findIndex((r, i) => r.area === map().area && !S.flags['rival' + i]);
  }
  // The buddy you picked at Professor Pi's table (older saves: the first starter
  // on your team or in the Terminal, even if you've since picked a new buddy).
  function myStarter() {
    if (S.starterId) return S.starterId;
    const mine = [...S.party, ...S.box].map((c) => baseForm(c.sp)).find((id) => STARTERS.includes(id));
    return mine || (S.sidekick && STARTERS.includes(baseForm(S.sidekick)) ? baseForm(S.sidekick) : STARTERS[0]);
  }
  // Remy's buddy is the one after yours in the starter list, grown to its level.
  function grownForm(id, lv) {
    for (let e = evolutionOf(id); e && lv >= (e.lv || Infinity); e = evolutionOf(e.to)) id = e.to;
    return id;
  }
  function rivalTeam(i) {
    const r = RIVAL[i], area = AREAS[r.area], lv = area.base + 3;
    const rivalBuddy = STARTERS[(STARTERS.indexOf(myStarter()) + 1) % STARTERS.length];
    const team = [];
    // Friends from the areas Remy has passed through, newest last.
    const pool = AREA_ORDER.slice(0, AREA_ORDER.indexOf(r.area) + 1).reverse()
      .flatMap((a) => Object.values(AREAS[a].species));
    const fams = new Set();
    for (const sp of pool) {
      if (team.length >= r.team - 1) break;
      const fam = SPECIES[sp].family;
      if (fams.has(fam)) continue;
      fams.add(fam);
      team.unshift(mon(lv >= (EVOLVE_LV[sp] || Infinity) + 4 ? EVOLUTIONS[sp][0] : sp, lv));
    }
    team.push(mon(grownForm(rivalBuddy, lv + 1), lv + 1));
    return team;
  }
  // Walks a person along a list of tiles, one step at a time.
  async function walkNpc(n, tiles) {
    let step = 0;
    for (const [tx, ty] of tiles) {
      const dx = tx - n.x, dy = ty - n.y;
      n.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
      const start = performance.now(), ms = STEP_MS * 1.3;
      for (let k = 0; k < 1;) {
        await sleep(16);
        k = Math.min(1, (performance.now() - start) / ms);
        n.ox = dx * TS * k; n.oy = dy * TS * k;
        n.frame = k < 0.6 ? 1 + (step % 2) : 0;
      }
      n.x = tx; n.y = ty; n.ox = n.oy = 0; n.frame = 0;
      step++;
    }
  }
  // Remy's route: the shortest walk from the gate to the next area to a tile
  // beside you, as [beside you, ..., gate]. Null if there's no way through.
  function routeFromGate() {
    const m = map(), gates = m.warps.filter((w) => w.need);
    const key = (x, y) => x + ',' + y, from = new Map();
    const q = gates.map((w) => [w.x, w.y]);
    q.forEach(([x, y]) => from.set(key(x, y), null));
    for (let h = 0; h < q.length; h++) {
      const [x, y] = q[h];
      if (Math.abs(x - P.x) + Math.abs(y - P.y) === 1 && !(F.x === x && F.y === y)) {
        const path = [];
        for (let k = key(x, y); k; k = from.get(k)) path.push(k.split(',').map(Number));
        return path;
      }
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = x + dx, ny = y + dy;
        if (from.has(key(nx, ny)) || (nx === P.x && ny === P.y) || blocked(nx, ny)) continue;
        from.set(key(nx, ny), key(x, y));
        q.push([nx, ny]);
      }
    }
    return null;
  }
  // Off screen: the camera keeps you in the middle, so this is about 5 tiles away.
  const offScreen = ([x, y]) => x - P.x <= -6 || x - P.x >= 6 || y - P.y <= -5 || y - P.y >= 5;

  async function rivalBattle(i) {
    const r = RIVAL[i];
    const m = map();
    // Remy comes from the way to the next area, starting just off screen...
    let route = routeFromGate();
    if (!route) {
      const [dx, dy] = DIRS[P.dir];
      route = [[P.x + dx, P.y + dy]];
    }
    let far = route.findIndex(offScreen);
    if (far < 0) far = route.length - 1;
    const [sx, sy] = route[0];
    const remy = { x: route[far][0], y: route[far][1], look: 'rival', dir: 'down' };
    m.npcs.push(remy);
    sfx('select');
    await walkNpc(remy, route.slice(0, far).reverse());
    remy.dir = sx > P.x ? 'left' : sx < P.x ? 'right' : sy > P.y ? 'up' : 'down';
    P.dir = S.dir = sx > P.x ? 'right' : sx < P.x ? 'left' : sy > P.y ? 'down' : 'up';
    await say(r.hi);
    const result = await battle(rivalTeam(i), { trainer: 'Remy' });
    if (result === 'win') {
      S.flags['rival' + i] = true;
      await say(r.win);
      writeSave();
      // ...and heads on toward the next area until out of sight.
      const out = route.slice(1);
      const gone = out.findIndex(offScreen);
      await walkNpc(remy, gone < 0 ? out : out.slice(0, gone + 1));
    }
    m.npcs.splice(m.npcs.indexOf(remy), 1);
  }

  // ---------------------------------------------------------------- evolution
  // Buddies grow at set levels. Wild Legends grow at their level AND once you're
  // getting strong at their kind of math, so learning is what makes them grow.
  function familyStrong(fam) {
    const ids = MathEngine.gradeSkills(S.grade).filter((id) => MathEngine.SKILLS[id].family === fam);
    return !ids.length || ids.some((id) => MathEngine.stretchLevel(S.skills[id]) >= 1);
  }
  async function checkEvolutions() {
    for (const c of S.party) {
      const e = evolutionOf(c.sp);
      if (!e || c.lv < e.lv) continue;
      const fam = SPECIES[c.sp].family;
      if (!SPECIES[c.sp].sidekick && !familyStrong(fam)) {
        if (!c.evoHint) {
          c.evoHint = true;
          await say([`${nameOf(c)} is glowing a little...`, `It's ready to grow! It just needs you to get stronger at ${FAMILY_PHRASE[fam]} puzzles.`]);
        }
        continue;
      }
      await evolve(c, e.to);
    }
  }
  async function evolve(c, to) {
    const from = c.sp;
    await say(`What? ${nameOf(c)} is evolving!`);
    const box = el('div', 'evolve');
    const img = el('img');
    img.alt = '';
    box.append(img);
    ui.append(box);
    const oldUrl = Art.creatureURL(from, !!c.golden), newUrl = Art.creatureURL(to, !!c.golden);
    img.src = oldUrl;
    sfx('heal');
    // Flicker between the two forms, faster and faster, then a flash.
    for (let gap = 420; gap > 50; gap *= 0.8) {
      await sleep(gap);
      img.src = img.src === oldUrl ? newUrl : oldUrl;
    }
    box.classList.add('flash');
    img.src = newUrl;
    await sleep(350);
    box.classList.remove('flash');
    sfx('level');
    c.sp = to;
    c.hp = maxHp(c);
    delete c.evoHint;
    if (S.sidekick === from) S.sidekick = to;
    S.seen[to] = S.caught[to] = true;
    if (c.golden) S.goldens[to] = true;
    await say([`Hooray! ${SPECIES[from].name} evolved into ${SPECIES[to].name}!`, SPECIES[to].dex]);
    box.remove();
    hideDialog();
    writeSave();
  }

  const foeName = () => `${B.trainer ? '' : 'Wild '}${nameOf(B.enemy)}`;

  async function turn() {
    B.idle = true;
    await say(`What will ${nameOf(B.me)} do?`, { keep: true });
    dialogEl.classList.add('split');
    const act = await choose(['SOLVE', 'TEAM', 'RUN'], { cancel: false, cols: 2, cls: 'battle-menu', onStart: true });
    B.idle = false;
    hideDialog();
    if (act === -2) { await battleMenu(); return null; }
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
    if (S.streak === GOLD_STREAK) await say([`${GOLD_STREAK} in a row on the first try!`, 'Something golden is sparkling in the tall grass...']);
    const mult = r.result === 'first' ? (fast ? 1.5 : 1) : 0.6;
    await say(`${nameOf(B.me)} uses ${move}!`);
    await hurt(B.enemy, damage(40, atkOf(B.me), mult), 'e');
    if (r.result === 'first') await say(fast ? 'Quick thinking! Extra power!' : praiseFor(p));
    else await say('You kept trying and figured it out!');
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
    await say(B.trainer ? `${nameOf(B.enemy)} is all done!` : B.special || B.enemy.golden ? `${B.enemy.golden ? 'The golden ' : ''}${nameOf(B.enemy)} calmed down!` : `The wild ${nameOf(B.enemy)} calmed down!`);
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
    // First-try answers make friends. Rare and golden Legends always want to come along.
    const c = B.enemy;
    const sure = !!(B.special || c.golden);
    let chance = Math.min(0.9, 0.3 + 0.2 * B.firstTries);
    if (S.caught[c.sp]) chance *= 0.5;
    if (sure || Math.random() < chance) {
      B.fx.e.hide = false;
      sfx('friend');
      if (await yesNo([`${nameOf(c)} really likes you!`, 'It wants to come with you. Take it along?'])) {
        c.hp = maxHp(c);
        delete c.skill;
        S.caught[c.sp] = true;
        if (c.golden) S.goldens[c.sp] = true;
        if (S.party.length < 6) {
          S.party.push(c);
          await say(`${nameOf(c)} joined your team!`);
        } else {
          S.box.push(c);
          await say(['Your team is full.', `${nameOf(c)} will wait in the Legend Terminal.`, 'There\'s a Terminal in every Rest Center and in Professor Pi\'s lab.']);
        }
      } else {
        await say(B.special ? `${nameOf(c)} will wait for you right here.` : `${nameOf(c)} waves goodbye!`);
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
    const foe = mon(sp, lv, skill);
    if (S.goldenReady) { foe.golden = true; S.goldenReady = false; S.streak = 0; }
    await battle([foe]);
  }

  // ---------------------------------------------------------------- menus

  function teamItems() {
    return S.party.map((c) => ({
      label: `${nameOf(c)}${c.golden ? ' ✨' : ''}  Lv ${c.lv}${c.sp === S.sidekick ? '  ★' : ''}`,
      sub: alive(c) ? `HP ${c.hp} / ${maxHp(c)}` : 'Needs a rest',
      icon: Art.creatureURL(c.sp, !!c.golden),
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
      img.src = Art.creatureURL(c.sp, !!c.golden);
      img.alt = '';
      box.append(img, el('h3', null, (c.golden ? 'Golden ' : '') + sp.name + (c.sp === S.sidekick ? ' ★' : '')));
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
      const isBuddy = c.sp === S.sidekick;
      const a = await choose(['Look', isBuddy ? 'Buddy ★' : 'Make buddy', 'Go first', 'Back'], { cls: 'start-menu' });
      if (a === 0) await creatureInfo(c);
      if (a === 1) {
        if (isBuddy) { await say(`${nameOf(c)} is already your buddy!`); continue; }
        S.sidekick = c.sp;
        S.party.splice(i, 1);
        S.party.unshift(c);
        sfx('select');
        await say([`${nameOf(c)} is your new buddy!`, 'It will walk with you and go first.']);
        writeSave();
      }
      if (a === 2 && i > 0) {
        S.party.splice(i, 1);
        S.party.unshift(c);
        await say(`${nameOf(c)} will go first next time!`);
      }
    }
  }

  // The Legend Terminal (Professor Pi's lab and every Rest Center): Legends that
  // didn't fit on your team wait here. Take them out, put team members away, or swap.
  function storedItems() {
    return S.box.map((c) => ({
      label: `${nameOf(c)}${c.golden ? ' ✨' : ''}  Lv ${c.lv}`,
      sub: puzzleLabel(c.sp),
      icon: Art.creatureURL(c.sp, !!c.golden),
    }));
  }
  async function storageMenu() {
    sfx('select');
    await say(['LEGEND TERMINAL', `Legends waiting here: ${S.box.length}. Your team: ${S.party.length} of 6.`], { keep: true });
    for (;;) {
      const i = await choose(['Take out a Legend', 'Put away a Legend', 'Done'], { cls: 'start-menu', head: 'Legend Terminal' });
      hideDialog();
      if (i === 0) {
        if (!S.box.length) { await say('No Legends are waiting here yet.'); continue; }
        const j = await choose(storedItems(), { cls: 'full', head: `Stored Legends (${S.box.length}) · Team: ${S.party.length}/6` });
        if (j < 0) continue;
        const c = S.box[j];
        if (S.party.length < 6) {
          S.box.splice(j, 1);
          S.party.push(c);
          sfx('friend');
          await say(`${nameOf(c)} joined your team!`);
        } else {
          const k = await teamPicker(`Team is full (6/6). Swap ${nameOf(c)} with...`);
          if (k < 0) continue;
          const out = S.party[k];
          if (out.sp === S.sidekick) { await say(`${nameOf(out)} is your buddy, so it stays with you.`); continue; }
          S.party[k] = c;
          S.box[j] = out;
          sfx('friend');
          await say(`${nameOf(c)} joined your team, and ${nameOf(out)} will wait here.`);
        }
      } else if (i === 1) {
        if (S.party.length <= 1) { await say('You need at least one Legend with you.'); continue; }
        const k = await teamPicker(`Put away which Legend? (Team: ${S.party.length}/6)`);
        if (k < 0) continue;
        const c = S.party[k];
        if (c.sp === S.sidekick) { await say(`${nameOf(c)} is your buddy, so it stays with you. You can pick a new buddy in MENU, Team.`); continue; }
        S.party.splice(k, 1);
        c.hp = maxHp(c);
        S.box.push(c);
        await say(`${nameOf(c)} will wait here. It's all rested up!`);
      } else break;
      writeSave();
    }
    writeSave();
  }

  async function dexMenu() {
    const count = DEX_ORDER.filter((id) => S.caught[id]).length;
    for (;;) {
      const items = DEX_ORDER.map((id) => {
        const seen = S.seen[id] || S.caught[id];
        const rare = { ultra: 'Ultra rare', world: 'World Legend', mythical: 'Mythical' }[SPECIES[id].rarity];
        return {
          label: seen ? SPECIES[id].name + (S.goldens[id] ? ' ✨' : '') : '???',
          sub: (S.caught[id] ? (S.goldens[id] ? 'Golden friend!' : 'Friend!') : seen ? 'Seen' : 'Not found yet') + (rare ? ` · ${rare}` : ''),
          icon: seen ? Art.creatureURL(id, !!S.goldens[id]) : undefined,
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
        img.src = Art.creatureURL(id, !!S.goldens[id]);
        img.alt = '';
        box.append(img, el('h3', null, (S.goldens[id] ? 'Golden ' : '') + sp.name), el('p', null, puzzleLabel(id)), el('p', null, sp.dex));
        const where = SPECIALS.find((x) => x.id === id);
        if (where && where.kind === 'ultra') box.append(el('p', null, `Shows up for ${GRADES[where.grade]} players who are getting strong at ${MathEngine.SKILLS[where.skill].label.toLowerCase()}.`));
      });
    }
  }

  // The Badge Case in your room: every boss badge, a row per world, in the color
  // of the highest grade it was won at.
  function badgeCase() {
    sfx('select');
    return panel((box) => {
      box.classList.add('badges');
      box.append(el('h3', null, `Badge Case · ${badgeCount()} of ${BADGE_FLAGS.length}`));
      for (const w of WORLDS) {
        const row = el('div', 'brow');
        row.append(el('span', 'wname', w.name));
        const open = worldOpen(w);
        w.areas.forEach((a, i) => {
          const b = BOSSES[a], won = !!S.flags[b.flag];
          const img = el('img');
          img.src = Art.badge(i, tierOf(b.flag).color, won).toDataURL();
          img.alt = won ? `${b.badge} (${tierOf(b.flag).name})` : 'Not won yet';
          img.title = img.alt;
          if (!open) img.classList.add('locked');
          row.append(img);
        });
        box.append(row);
      }
      const key = el('div', 'tiers');
      BADGE_TIERS.forEach((t, g) => {
        const k = el('span');
        const img = el('img');
        img.src = Art.badge(0, t.color, true).toDataURL();
        img.alt = '';
        k.append(img, g ? `Gr ${g}` : 'K');
        key.append(k);
      });
      box.append(el('p', 'note', 'Badge colors show the grade you won at:'), key);
    });
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
      box.append(el('p', null, `Badges: ${badgeCount()} of ${BADGE_FLAGS.length} · Legendex: ${DEX_ORDER.filter((id) => S.caught[id]).length} of ${DEX_ORDER.length} friends`));
      const won = AREA_ORDER.filter((a) => S.flags[BOSSES[a].flag]);
      if (won.length) box.append(el('p', null, 'Badge colors show the grade they were won at: ' + won.map((a) => `${BOSSES[a].badge} (${tierOf(BOSSES[a].flag).name}, ${GRADES[S.badgeGrade[BOSSES[a].flag] ?? 0]})`).join(', ') + '.'));
      box.append(el('p', null, `Worlds open: ${WORLDS.filter(worldOpen).map((w) => w.name).join(', ')}.`));
      const rares = SPECIALS.filter((x) => S.caught[x.id]).length, golds = Object.keys(S.goldens).length;
      box.append(el('p', null, `Rare Legend friends: ${rares} of ${SPECIALS.length}. Golden Legends: ${golds}. First-try streak: ${S.streak || 0} (10 brings a golden Legend).`));
      const mine = SPECIALS.filter((x) => x.kind === 'ultra' && x.grade === S.grade);
      box.append(el('p', null, `${GRADES[S.grade]} ultra rares appear once a skill is getting strong: ` + mine.map((x) => `${SPECIES[x.id].name} (${MathEngine.SKILLS[x.skill].label.toLowerCase()})`).join(', ') + '.'));
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
        `Reading speed: ${{ slower: 'Slower', faster: 'Faster' }[S.readSpeed] || 'Normal'}`,
        `Sound: ${soundOn ? 'On' : 'Off'}`,
        `Answers: ${answerLabel()}`,
        `Controls: ${layoutLabel()}`,
        ...(DEV ? ['Dev: unlock everything'] : []),
        ...(DEV && !B ? ['Dev: go to Portal Shrine'] : []), // not mid-battle
        'Back',
      ], { cls: 'start-menu' });
      const devItem = !DEV ? -1 : i === 7 ? 0 : i === 8 && !B ? 1 : -1;
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
        const speeds = ['slower', 'normal', 'faster'];
        S.readSpeed = speeds[(speeds.indexOf(S.readSpeed || 'normal') + 1) % speeds.length];
        speak('This is how fast I\'ll read.', true);
      } else if (i === 4) {
        soundOn = !soundOn;
        try { localStorage.setItem('mql:sound', soundOn ? 'on' : 'off'); } catch (e) { /* ignore */ }
      } else if (i === 5) {
        const modes = ['auto', 'type', 'pick'];
        S.answerMode = modes[(modes.indexOf(S.answerMode || 'auto') + 1) % modes.length];
      } else if (i === 6) {
        layout = LAYOUTS[(LAYOUTS.indexOf(layout) + 1) % LAYOUTS.length];
        try { localStorage.setItem('mql:layout', layout); } catch (e) { /* ignore */ }
        applyLayout();
      } else if (devItem === 0) {
        if (await yesNo('Unlock every badge, place, Legend and portal in this save? (Export your save first to keep a copy.)')) {
          devUnlockAll();
          await say('Done! Everything is unlocked.');
        }
      } else if (devItem === 1) {
        await fade(() => { placePlayer('shrine', 6, 7, 'up'); writeSave(); });
        return 'closed';
      } else {
        writeSave();
        return;
      }
    }
  }

  // Testing helper (only with ?dev in the address): opens everything in this save.
  function devUnlockAll() {
    S.flags.starter = true;
    S.flags.devAll = true;
    if (!S.sidekick) { S.sidekick = 'sproutle'; S.party.unshift(mon('sproutle', 30)); }
    for (const f of BADGE_FLAGS) { S.flags[f] = true; if (!(f in S.badgeGrade)) S.badgeGrade[f] = S.grade; }
    for (const [id, m] of Object.entries(MAPS)) if (m.heal) S.visited[id] = true;
    // Rare Legends stay un-befriended so their encounters can be tried (they all show up with devAll).
    for (const id of Object.keys(SPECIES)) { S.seen[id] = true; if (!SPECIES[id].rarity) S.caught[id] = true; }
    for (const id of ['hootsum', 'octogroup', 'lizardo', 'flurrfox', 'glowsplit']) {
      if (S.party.length < 6 && !S.party.some((c) => c.sp === id)) S.party.push(mon(id, 30));
    }
    S.party.forEach((c) => { if (c.lv < 30) c.lv = 30; });
    healAll();
    writeSave();
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

  // A little picture of each world: each band of tiles is one area.
  const WORLD_PICS = {
    1: [
      'QQQqqqqQQQ',
      'QQqq%%qqQQ',
      'AA****^^AA',
      '*^^**A**^*',
      '~~__;:"":M',
      '~_;__::KMM',
      'T.,,..==,.',
      '..==.f..,T',
    ],
    2: [
      '|UU&OO&UU|',
      '|--OOOO--|',
      'ZHllHHllHZ',
      'ZIZHHHHZIZ',
      'JvzzvppzvJ',
      '---BB-LvLL',
      'FneeBBnken',
      'FnekennenF',
    ],
    3: [
      'ΔΓΓΛΓΓΞΓΓΔ',
      'ΓΓΛΛαΓΓΓΓΓ',
      'φφυυαυυψυφ',
      'φυψυαυυυφφ',
      'ιξξτσξτξξι',
      'οοοοσοοοοο',
      'ιλλναλμλλι',
      'ζδεεαδηδδζ',
    ],
    4: [
      'ÐÆÆÞÆÆÞÆÆÐ',
      'ßØ¶¶ð¶¶Øßß',
      'ß¶Ø¶ð¶¿¶Øß',
      '®©©±ð©©°©®',
      '¥µµ§ð§µµ§¥',
      '¥§µµð§§µµ¥',
      '¤§¢¢ð§£¢§¤',
      '¤¢§§ð§¢¢¤¤',
    ],
    5: [
      'ÒÑÑÓÊÑÔÑÑÒ',
      'ÁÍÏÍÊÍÎÍÏÁ',
      'ÕÀÌÀËÀÌÀÕÕ',
      'ÕÀÀÌËÌÀÀÀÕ',
      'ÕÃÈÈÊÃÇÈÕÕ',
      'ÕÃÈÃÊÈÈÃÃÕ',
      'ÕÃÄÄÊÃÅÄÃÕ',
      'ÕÄÃÃÊÃÄÄÕÕ',
    ],
  };
  function drawWorldMap(world) {
    const c = el('canvas', 'worldmap');
    c.width = 160;
    c.height = 128;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    WORLD_PICS[world].forEach((row, y) => [...row].forEach((t, x) => g.drawImage(Art.tile(t), x * 16, y * 16)));
    const stops = TRAVEL.filter((t) => t.world === world);
    // the road between places
    g.strokeStyle = '#fff6d6';
    g.lineWidth = 3;
    g.setLineDash([4, 3]);
    g.beginPath();
    stops.forEach((t, i) => (i ? g.lineTo(t.mx, t.my) : g.moveTo(t.mx, t.my)));
    g.stroke();
    g.setLineDash([]);
    const here = MAPS[S.map].heal ? S.map : S.map === 'route1' ? 'town' : S.healMap;
    for (const t of stops) {
      const open = S.visited[t.map];
      g.fillStyle = '#2b2840';
      g.fillRect(t.mx - 6, t.my - 6, 12, 12);
      g.fillStyle = open ? '#f2c84b' : '#8a84a8';
      g.fillRect(t.mx - 4, t.my - 4, 8, 8);
      if (t.map === here) g.drawImage(Art.person(LOOKS.hero, 'down', 0), t.mx - 8, t.my - 22);
    }
    return c;
  }

  // One page per world you've opened; quick travel works to any Rest Center you've visited.
  async function mapMenu() {
    const worlds = WORLDS.filter((w) => worldOpen(w) && WORLD_PICS[w.id] && (w.id === 1 || TRAVEL.some((t) => t.world === w.id && S.visited[t.map])));
    let page = Math.max(0, worlds.findIndex((w) => w.id === worldOf(S.map)));
    for (;;) {
      const w = worlds[page];
      const view = el('div', 'box mapview');
      view.append(drawWorldMap(w.id));
      ui.append(view);
      const stops = TRAVEL.filter((t) => t.world === w.id);
      const items = stops.map((t) => ({
        label: S.visited[t.map] ? t.label : '???',
        sub: S.visited[t.map] ? 'Tap to travel here' : 'Not visited yet',
        dim: !S.visited[t.map],
      }));
      if (worlds.length > 1) items.push({ label: `▶ ${worlds[(page + 1) % worlds.length].name} map`, sub: 'See the next world' });
      const i = await choose(items, { cls: 'maplist', head: `${w.name} · Badges: ${badgeCount(w.id)} of ${w.areas.length}` });
      view.remove();
      if (i < 0) return false;
      if (i === stops.length) { page = (page + 1) % worlds.length; continue; }
      const t = stops[i];
      if (!S.visited[t.map]) { await say('You haven\'t been there yet.'); return false; }
      if (S.map === t.map) { await say('You\'re already here!'); return false; }
      sfx('select');
      const h = MAPS[t.map].heal;
      await fade(() => { placePlayer(t.map, h[0], h[1], 'down'); writeSave(); });
      await say(`Welcome to ${t.label}!`);
      return true;
    }
  }

  // ---------------------------------------------------------------- save files

  // Checks a loaded save and fills in anything missing.
  function cleanSave(d) {
    if (!d || typeof d !== 'object' || d.v !== 2 || !Array.isArray(d.party) || !MAPS[d.map]) return null;
    const s = Object.assign(newState(String(d.name || 'Hero').slice(0, 10), 0), d);
    s.name = String(s.name).slice(0, 10) || 'Hero';
    s.grade = Math.max(0, Math.min(GRADES.length - 1, Number(s.grade) | 0));
    const okMon = (c) => c && SPECIES[c.sp] && Number.isFinite(c.lv) && Number.isFinite(c.hp);
    s.party = s.party.filter(okMon);
    s.box = (Array.isArray(s.box) ? s.box : []).filter(okMon);
    for (const k of ['flags', 'seen', 'caught', 'skills', 'visited']) if (!s[k] || typeof s[k] !== 'object') s[k] = {};
    if (!Array.isArray(s.review)) s.review = [];
    s.visited.town = true;
    upgradeSave(s);
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

  // MENU during a battle. Map and Save & load stay out: a save holds your team and
  // where you're standing, not the battle, so saving or loading mid-fight isn't allowed.
  async function battleMenu() {
    sfx('select');
    let i = 0;
    for (;;) {
      i = await choose(['Team', 'Legendex', 'Grown-ups', 'Settings', 'Back to battle'], { cls: 'start-menu', start: Math.max(0, i), head: 'Menu (in battle)' });
      if (i === 0) await teamMenu();
      else if (i === 1) await dexMenu();
      else if (i === 2) await progressPage();
      else if (i === 3) await settingsMenu();
      else return;
      updHud();
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
      else if (i === 5) { if ((await settingsMenu()) === 'closed') break; }
      else if (i === 6) { if (await saveMenu()) break; }
      else break;
    }
    busy = false;
  }

  // ---------------------------------------------------------------- title + new game

  // The grass drifts slowly and seamlessly: each tile keeps its pattern as it
  // moves, so the scroll never visibly jumps back.
  function drawTitle(now) {
    const sx = now / 90, sy = sx / 2;
    const kx = Math.floor(sx / TS), ky = Math.floor(sy / TS);
    const ox = Math.floor(sx - kx * TS), oy = Math.floor(sy - ky * TS);
    const mod = (n, m) => ((n % m) + m) % m;
    for (let ty = -1; ty < 10; ty++) {
      for (let tx = -1; tx < 11; tx++) {
        const wx = tx - kx, wy = ty - ky;
        const ch = mod(wx + wy, 4) === 0 ? ',' : mod(wx * 7 + wy * 3, 11) === 0 ? 'f' : '.';
        ctx.drawImage(Art.tile(ch), tx * TS + ox, ty * TS + oy);
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
  if (/[?&]dev\b/.test(location.search)) {
    window.MQL.ask = ask;
    window.MQL.say = say;
    window.MQL.checkEvolutions = checkEvolutions;
    // Test hook: jump into the world at a spot, e.g. MQL.warp('room', 2, 2).
    window.MQL.warp = (mapId, x, y, dir = 'up') => { ui.textContent = ''; handler = null; placePlayer(mapId, x, y, dir); mode = 'world'; };
    window.MQL.interact = () => interact();
    window.MQL.battle = (foes, opts) => battle(foes.map(([sp, lv]) => mon(sp, lv)), opts);
    window.MQL.rival = (i) => rivalBattle(i);
    // Test hook: a throwaway game state so questions can be shown from the title screen.
    window.MQL.testState = (grade = 0) => {
      S = newState('Tester', grade);
      S.sidekick = 'sproutle';
      ui.textContent = '';
      handler = null;
      return S;
    };
  }
  // Device testing: ?dev&quiz=sub-100&grade=2 shows practice questions right away.
  const qs = new URLSearchParams(location.search);
  if (qs.has('dev') && qs.get('quiz') && MathEngine.SKILLS[qs.get('quiz')]) {
    (async () => {
      await sleep(300);
      ui.textContent = '';
      handler = null;
      S = newState('Tester', Number(qs.get('grade')) || 0);
      S.sidekick = 'sproutle';
      // Sets of 5, then a choice so testers are never stuck practicing.
      for (;;) {
        for (let i = 0; i < 5; i++) await ask(MathEngine.make(qs.get('quiz'), S.grade, S.skills), { head: 'Practice ' + (i + 1) + '/5' });
        await say('Nice practice!', { keep: true });
        const c = await choose(['More practice', 'Play the game'], { cancel: false });
        hideDialog();
        if (c === 1) { location.href = location.pathname; return; }
      }
    })();
  }
})();
