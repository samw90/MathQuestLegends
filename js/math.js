// Math engine. Follows Math Quest's grade scheme (Common Core K-5) so both
// games teach the same skills at the same difficulty. Every grade has all five
// kinds of Legend math, so any Legend can show up at any grade:
//   add (Adders)     sub (Takers)     compare (Counters: number sense)
//   mult (Groupers)  div (Sharers: parts, halves, division, fractions)
// Also from Math Quest: weak skills come up more often, strong skills
// "stretch" to bigger numbers, 15% review of earlier grades, story problems
// in Grades 2-4, mistake-aware hints and step-by-step "Teach me" lessons.
const MathEngine = (() => {
  const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const LEVELS = ['k', 'g1', 'g2', 'g3', 'g4', 'g5'];

  const SKILLS = {
    // Kindergarten
    'count-10': { label: 'Counting to 10', level: 'k', family: 'compare' },
    'compare-10': { label: 'Which is more (to 10)', level: 'k', family: 'compare' },
    'add-10': { label: 'Adding within 10', level: 'k', family: 'add' },
    'sub-10': { label: 'Taking away within 10', level: 'k', family: 'sub' },
    'skip-10': { label: 'Counting on and by 10s', level: 'k', family: 'mult' },
    'parts-10': { label: 'Parts of a number', level: 'k', family: 'div' },
    // Grade 1
    'add-20': { label: 'Adding within 20', level: 'g1', family: 'add' },
    'sub-20': { label: 'Taking away within 20', level: 'g1', family: 'sub' },
    compare: { label: 'Comparing numbers', level: 'g1', family: 'compare' },
    'place-tens': { label: 'Tens and ones', level: 'g1', family: 'compare' },
    doubles: { label: 'Doubles', level: 'g1', family: 'mult' },
    'missing-20': { label: 'Mystery numbers', level: 'g1', family: 'div' },
    // Grade 2
    'add-100': { label: 'Two-digit adding', level: 'g2', family: 'add' },
    'sub-100': { label: 'Two-digit taking away', level: 'g2', family: 'sub' },
    'place-100': { label: 'Place value and skip counting', level: 'g2', family: 'compare' },
    'equal-groups': { label: 'Equal groups', level: 'g2', family: 'mult' },
    halves: { label: 'Halves', level: 'g2', family: 'div' },
    // Grade 3
    'add-1000': { label: 'Adding within 1,000', level: 'g3', family: 'add' },
    'sub-1000': { label: 'Taking away within 1,000', level: 'g3', family: 'sub' },
    round: { label: 'Rounding', level: 'g3', family: 'compare' },
    'mult-facts': { label: 'Times tables', level: 'g3', family: 'mult' },
    'div-facts': { label: 'Division facts', level: 'g3', family: 'div' },
    // Grade 4
    'add-multi': { label: 'Adding big numbers', level: 'g4', family: 'add' },
    'sub-multi': { label: 'Taking away big numbers', level: 'g4', family: 'sub' },
    'round-big': { label: 'Rounding big numbers', level: 'g4', family: 'compare' },
    'mult-1digit': { label: 'Multiplying by one digit', level: 'g4', family: 'mult' },
    'div-1digit': { label: 'Dividing by one digit', level: 'g4', family: 'div' },
    'equiv-frac': { label: 'Equal fractions', level: 'g4', family: 'div' },
    // Grade 5
    'dec-add': { label: 'Adding decimals', level: 'g5', family: 'add' },
    'dec-sub': { label: 'Taking away decimals', level: 'g5', family: 'sub' },
    'dec-place': { label: 'Decimal place value', level: 'g5', family: 'compare' },
    'mult-2digit': { label: 'Two-digit multiplying', level: 'g5', family: 'mult' },
    'div-long': { label: 'Long division', level: 'g5', family: 'div' },
    'frac-add': { label: 'Adding fractions', level: 'g5', family: 'div' },
  };

  const tenth = (x) => Math.round(x * 10) / 10;
  // A whole number from lo to hi that doesn't end in 0 (so x / 10 always has tenths).
  const rNot10 = (lo, hi) => { let x = r(lo, hi); while (x % 10 === 0) x = r(lo, hi); return x; };
  // Big numbers get commas (10,987) so they're easier to read.
  const show = (n) => (typeof n === 'number' && Math.abs(n) >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : String(n));

  function base(skillId, a, b, op, answer, visual, visualMode) {
    return { skillId, a, b, op, answer, visual, visualMode };
  }

  // ---------------------------------------------------------------- stories

  const NAMES = ['Maya', 'Leo', 'Ava', 'Sam', 'Zoe', 'Kai', 'Mia', 'Eli', 'Nora', 'Theo'];
  const THINGS = ['stickers', 'marbles', 'seashells', 'crayons', 'cards', 'blueberries', 'acorns', 'buttons'];

  // 30% of problems that allow it become a short story (Math Quest's rate).
  function story(p, kind) {
    if (Math.random() > 0.3) return p;
    const n1 = pick(NAMES);
    let n2 = pick(NAMES);
    while (n2 === n1) n2 = pick(NAMES);
    const t = pick(THINGS);
    const A = show(p.a), B = show(p.b);
    const text = {
      add: `${n1} has ${A} ${t}. ${n2} gives ${n1} ${B} more. How many ${t} does ${n1} have now?`,
      sub: `${n1} has ${A} ${t}. ${n1} gives ${B} to ${n2}. How many ${t} are left?`,
      mult: `${n1} fills ${A} bags. Each bag has ${B} ${t}. How many ${t} in all?`,
      div: `${n1} puts ${A} ${t} into ${B} equal groups. How many ${t} are in each group?`,
    }[kind];
    return { ...p, story: text, visualMode: p.visual ? 'hint' : p.visualMode };
  }

  // A hidden-number problem: 6 + ? = 13.
  function missingOf(skill, a, b, visual) {
    return { ...base(skill, a, b, '+', b, visual, visual ? 'hint' : 'none'), missing: true, total: a + b };
  }

  // Number lines (Siegler & Booth): marks are { at, label, cls }.
  const line = (from, to, step, marks) => ({ kind: 'numberline', from, to, step, marks });

  // ---------------------------------------------------------------- templates (from Math Quest)

  const TEMPLATES = {
    k: [
      { skill: 'count-10', weight: 18, gen() { const a = r(3, 10); return base('count-10', a, 0, 'count', a, { kind: 'tenframe', a, b: 0, mode: 'add' }, 'always'); } },
      { skill: 'compare-10', weight: 12, gen() { const a = r(1, 10); let b = r(1, 10); while (b === a) b = r(1, 10); return base('compare-10', a, b, 'or', Math.max(a, b), line(0, 10, 1, [{ at: a, label: a }, { at: b, label: b }]), 'hint'); } },
      { skill: 'add-10', weight: 25, gen() { const a = r(1, 9), b = r(1, 10 - a); return base('add-10', a, b, '+', a + b, { kind: 'tenframe', a, b, mode: 'add' }, 'always'); } },
      { skill: 'sub-10', weight: 21, gen() { const a = r(2, 10), b = r(1, a - 1); return base('sub-10', a, b, '−', a - b, { kind: 'tenframe', a, b, mode: 'sub' }, 'always'); } },
      { skill: 'skip-10', weight: 12, gen() {
        const step = Math.random() < 0.5 ? 1 : 10;
        const start = step === 1 ? r(1, 16) : 10 * r(1, 6);
        const seq = [start, start + step, start + 2 * step];
        const ans = start + 3 * step;
        return { ...base('skip-10', start, step, 'seq', ans, line(start, ans, step, [...seq.map((v) => ({ at: v, label: v })), { at: ans, label: '?', cls: 'q' }]), 'hint'), seq, step };
      } },
      { skill: 'parts-10', weight: 12, gen() { const t = r(3, 10), a = r(1, t - 1); return missingOf('parts-10', a, t - a, { kind: 'tenframe', a, b: t - a, mode: 'add' }); } },
    ],
    g1: [
      { skill: 'add-20', weight: 40, gen() { const a = r(3, 15), b = r(2, Math.min(20 - a, 12)); return base('add-20', a, b, '+', a + b, { kind: 'tenframe', a, b, mode: 'add' }, 'always'); } },
      { skill: 'sub-20', weight: 30, gen() { const a = r(5, 20), b = r(2, a - 1); return base('sub-20', a, b, '−', a - b, { kind: 'tenframe', a, b, mode: 'sub' }, 'always'); } },
      { skill: 'compare', weight: 8, gen() { const a = r(5, 20); let b = r(5, 20); while (b === a) b = r(5, 20); return base('compare', a, b, 'or', Math.max(a, b), line(0, 20, 2, [{ at: a, label: a }, { at: b, label: b }]), 'hint'); } },
      { skill: 'place-tens', weight: 7, gen() { const t = r(1, 9), o = r(0, 9), n = 10 * t + o; return { ...base('place-tens', t, o, 'place', n, { kind: 'baseten', a: n, b: 0, mode: 'show' }, 'hint'), prompt: `${t} tens and ${o} ones = ?` }; } },
      { skill: 'doubles', weight: 7, gen() { const a = r(2, 9); return base('doubles', a, a, '+', 2 * a, { kind: 'tenframe', a, b: a, mode: 'add' }, 'hint'); } },
      { skill: 'missing-20', weight: 8, gen() { const a = r(3, 15), b = r(2, Math.min(20 - a, 12)); return missingOf('missing-20', a, b, null); } },
    ],
    g2: [
      { skill: 'add-100', weight: 30, gen() { const a = r(12, 70), b = r(11, 99 - a); return story(base('add-100', a, b, '+', a + b, { kind: 'baseten', a, b, mode: 'add' }, 'hint'), 'add'); } },
      { skill: 'sub-100', weight: 28, gen() { const a = r(25, 99), b = r(11, a - 10); return story(base('sub-100', a, b, '−', a - b, { kind: 'baseten', a, b, mode: 'sub' }, 'hint'), 'sub'); } },
      { skill: 'place-100', weight: 12, gen() {
        if (Math.random() < 0.5) {
          const h = r(1, 9), t = r(0, 9), o = r(0, 9), n = 100 * h + 10 * t + o;
          const prompt = Math.random() < 0.5 ? `${h} hundreds, ${t} tens and ${o} ones = ?` : `${100 * h} + ${10 * t} + ${o} = ?`;
          return { ...base('place-100', h, t, 'place', n, null, 'none'), prompt, o };
        }
        const step = pick([5, 10, 100]);
        const start = step * (step === 100 ? r(1, 6) : r(1, 15));
        const seq = [start, start + step, start + 2 * step], ans = start + 3 * step;
        return { ...base('place-100', start, step, 'seq', ans, line(start, ans, step, [...seq.map((v) => ({ at: v, label: v })), { at: ans, label: '?', cls: 'q' }]), 'hint'), seq, step };
      } },
      { skill: 'equal-groups', weight: 20, gen() { const a = r(2, 5), b = r(2, 5); return story(base('equal-groups', a, b, '×', a * b, { kind: 'array', rows: a, cols: b }, 'always'), 'mult'); } },
      { skill: 'halves', weight: 10, gen() { const h = r(2, 20), a = 2 * h; return base('halves', a, 2, 'half', h, h <= 10 ? { kind: 'array', rows: 2, cols: h } : null, h <= 10 ? 'hint' : 'none'); } },
    ],
    g3: [
      { skill: 'mult-facts', weight: 30, gen() { const a = r(2, 10), b = r(2, 10); return story(base('mult-facts', a, b, '×', a * b, { kind: 'array', rows: a, cols: b }, 'hint'), 'mult'); } },
      { skill: 'div-facts', weight: 25, gen() { const t = r(2, 10), n = r(2, 10); return story(base('div-facts', t * n, t, '÷', n, { kind: 'array', rows: t, cols: n }, 'hint'), 'div'); } },
      { skill: 'add-1000', weight: 17, gen() { const a = r(120, 700), b = r(100, 999 - a); return story(base('add-1000', a, b, '+', a + b, null, 'none'), 'add'); } },
      { skill: 'sub-1000', weight: 13, gen() { const a = r(300, 999), b = r(100, a - 50); return story(base('sub-1000', a, b, '−', a - b, null, 'none'), 'sub'); } },
      { skill: 'round', weight: 15, gen() { return roundProblem('round', Math.random() < 0.6 ? 10 : 100, 101, 999); } },
    ],
    g4: [
      { skill: 'add-multi', weight: 20, gen() { const a = r(1200, 6000), b = r(1000, 9999 - a); return story(base('add-multi', a, b, '+', a + b, null, 'none'), 'add'); } },
      { skill: 'sub-multi', weight: 20, gen() { const a = r(2000, 9999), b = r(1000, a - 500); return story(base('sub-multi', a, b, '−', a - b, null, 'none'), 'sub'); } },
      { skill: 'round-big', weight: 10, gen() { return Math.random() < 0.5 ? roundProblem('round-big', 100, 1001, 9999) : roundProblem('round-big', 1000, 10001, 99999); } },
      { skill: 'mult-1digit', weight: 25, gen() { const a = Math.random() < 0.5 ? r(120, 999) : r(12, 99), b = r(3, 9); return story(base('mult-1digit', a, b, '×', a * b, null, 'none'), 'mult'); } },
      { skill: 'div-1digit', weight: 15, gen() { const t = r(3, 9), n = r(11, 99); return story(base('div-1digit', t * n, t, '÷', n, null, 'none'), 'div'); } },
      { skill: 'equiv-frac', weight: 10, gen() {
        const b = r(2, 6), a = r(1, b - 1), k = r(2, b <= 3 ? 4 : 2), d = b * k;
        return { ...base('equiv-frac', a, b, 'frac', a * k, { kind: 'bars', rows: [{ parts: b, filled: a }, { parts: d, filled: a * k }] }, 'hint'), d };
      } },
    ],
    g5: [
      { skill: 'dec-add', weight: 22, gen() { const a = rNot10(11, 899) / 10, b = rNot10(11, 899) / 10; return { ...base('dec-add', a, b, '+', tenth(a + b), null, 'none'), dec: true }; } },
      { skill: 'dec-sub', weight: 20, gen() { const x = rNot10(300, 999), y = rNot10(100, x - 50); return { ...base('dec-sub', x / 10, y / 10, '−', tenth((x - y) / 10), null, 'none'), dec: true }; } },
      { skill: 'dec-place', weight: 12, gen() {
        const roll = Math.random();
        if (roll < 0.4) {
          // The classic mix-up: 0.45 looks bigger than 0.7 because it has more digits.
          const ai = r(1, 9);
          let bi = r(11, 99);
          while (bi % 10 === 0 || Math.abs(bi - ai * 10) < 5) bi = r(11, 99);
          const a = ai / 10, b = bi / 100;
          return { ...base('dec-place', a, b, 'or', Math.max(a, b), null, 'none'), dec: true };
        }
        if (roll < 0.7) { const a = rNot10(11, 999) / 10; return { ...base('dec-place', a, 10, '×', Math.round(a * 10), null, 'none'), dec: true }; }
        const a = rNot10(11, 999); return { ...base('dec-place', a, 10, '÷', tenth(a / 10), null, 'none'), dec: true };
      } },
      { skill: 'mult-2digit', weight: 20, gen() { const a = r(12, 99), b = r(12, 99); return base('mult-2digit', a, b, '×', a * b, null, 'none'); } },
      { skill: 'div-long', weight: 14, gen() { const t = r(3, 9), n = r(101, 999); return base('div-long', t * n, t, '÷', n, null, 'none'); } },
      { skill: 'frac-add', weight: 12, gen() {
        const b = r(2, 5), k = r(2, 3), d = b * k, a = r(1, b - 1), c = r(1, d - 1 - a * k);
        return { ...base('frac-add', a, b, 'fracadd', a * k + c, { kind: 'bars', rows: [{ parts: b, filled: a }, { parts: d, filled: c }] }, 'hint'), c, d };
      } },
    ],
  };

  // Round n (between lo and hi, not already round) to the nearest `unit`.
  function roundProblem(skill, unit, lo, hi) {
    let n = r(lo, hi);
    while (n % unit === 0) n = r(lo, hi);
    const down = Math.floor(n / unit) * unit, ans = Math.round(n / unit) * unit;
    const step = unit / 10;
    const marks = [{ at: down, label: show(down) }, { at: down + unit, label: show(down + unit) }, { at: n, label: show(n), cls: 'q' }];
    return base(skill, n, unit, 'round', ans, line(down, down + unit, step, marks), 'hint');
  }
  const ALL = Object.values(TEMPLATES).flat();
  const templateFor = (skill) => ALL.find((t) => t.skill === skill);

  // ---------------------------------------------------------------- adapting (from Math Quest)

  const accuracy = (s) => (s && s.attempts ? s.correct / s.attempts : null);

  // Weak skills come up more often: weight x (1 + (1 - accuracy) x 1.5).
  function weightOf(t, skills) {
    const s = skills && skills[t.skill];
    if (!s || s.attempts < 3) return t.weight;
    return t.weight * (1 + (1 - accuracy(s)) * 1.5);
  }

  // 0 = still learning, 1 = getting strong, 2 = mastered (accurate and quick).
  function stretchLevel(s) {
    if (!s || s.attempts < 6) return 0;
    const a = s.correct / s.attempts;
    const secs = s.n > 0 ? s.ms / s.n / 1000 : null;
    if (a >= 0.92 && s.attempts >= 12 && (secs === null || secs <= 15)) return 2;
    return a >= 0.82 ? 1 : 0;
  }
  const MASTERY = ['Learning', 'Getting strong', 'Mastered'];

  // Pictures only work for small numbers: ten-frames up to 20, blocks under 100.
  function fitVisual(p) {
    const v = p.visual;
    const fits = !v || (v.kind === 'tenframe' ? (v.mode === 'add' ? v.a + v.b : v.a) <= 20 : v.kind === 'baseten' ? v.a < 100 && v.b < 100 : true);
    return fits ? p : { ...p, visual: null, visualMode: 'none' };
  }

  // Strong skills sometimes get bigger numbers.
  const STRETCHY = new Set(['add-10', 'sub-10', 'add-20', 'sub-20', 'add-100', 'sub-100', 'equal-groups', 'mult-facts', 'div-facts',
    'add-1000', 'sub-1000', 'add-multi', 'sub-multi', 'mult-1digit', 'div-1digit', 'mult-2digit', 'div-long']);
  function stretch(p, level, grade) {
    if (!level || p.story || p.missing || p.dec || !STRETCHY.has(p.skillId)) return p;
    if (Math.random() > (level === 2 ? 0.85 : 0.5)) return p;
    const L = LEVELS[grade];
    const cap = { k: 10, g1: 20, g2: 99, g3: 999, g4: 9999, g5: 9999 }[L];
    const f = level === 2 ? 2.5 : 1.7;
    const M = Math.min(Math.round(cap * f), { k: 20, g1: 99, g2: 999, g3: 9999, g4: 99999, g5: 99999 }[L]);
    if (p.op === '+') {
      const a = r(Math.max(2, Math.round(0.6 * cap)), Math.max(3, M - 1));
      const b = r(1, Math.max(1, M - a));
      return fitVisual({ ...p, a, b, answer: a + b, visual: p.visual ? { ...p.visual, a, b } : null, stretched: true });
    }
    if (p.op === '−') {
      const a = r(Math.max(3, Math.round(0.7 * cap)), Math.max(4, M));
      const b = r(1, a - 1);
      return fitVisual({ ...p, a, b, answer: a - b, visual: p.visual ? { ...p.visual, a, b } : null, stretched: true });
    }
    if (p.op === '×') {
      const big = Math.round(Math.max(p.a, p.b) * (level === 2 ? 1.8 : 1.4)) + 1;
      const small = Math.min(p.a, p.b);
      return { ...p, a: big, b: small, answer: big * small, visual: null, visualMode: 'none', stretched: true };
    }
    if (p.op === '÷') {
      const d = p.b, q = Math.round((p.a / p.b) * (level === 2 ? 1.8 : 1.4)) + 1;
      return { ...p, a: d * q, b: d, answer: q, visual: null, visualMode: 'none', stretched: true };
    }
    return p;
  }

  const gradeSkills = (grade) => TEMPLATES[LEVELS[grade]].map((t) => t.skill);
  const earlierSkills = (grade) => LEVELS.slice(0, grade).flatMap((L) => TEMPLATES[L].map((t) => t.skill));

  // Picks the skill to practise next. 15% of the time it reviews an earlier grade.
  function pickSkill(grade, skills) {
    const earlier = earlierSkills(grade);
    if (earlier.length && Math.random() < 0.15) return pick(earlier);
    const ts = TEMPLATES[LEVELS[grade]];
    const ws = ts.map((t) => weightOf(t, skills));
    let roll = Math.random() * ws.reduce((a, b) => a + b, 0);
    for (let i = 0; i < ts.length; i++) if ((roll -= ws[i]) <= 0) return ts[i].skill;
    return ts[ts.length - 1].skill;
  }

  // The skill with the lowest accuracy this grade (untried skills count as weak).
  function weakestSkill(grade, skills) {
    let best = null, bestScore = Infinity;
    for (const id of gradeSkills(grade)) {
      const s = skills[id];
      const score = !s || s.attempts < 3 ? 0.5 : accuracy(s);
      if (score < bestScore) { best = id; bestScore = score; }
    }
    return best;
  }

  // ---------------------------------------------------------------- building a problem

  // The question line for each kind of problem.
  function fmt(p) {
    const { a, b } = p;
    switch (p.op) {
      case 'count': return 'How many dots?';
      case 'seq': return `${p.seq.join(', ')}, ?`;
      case 'place': return p.prompt;
      case 'half': return `Half of ${a} = ?`;
      case 'round': return `Round ${show(a)} to the nearest ${show(b)}.`;
      case 'frac': return `${a}/${b} = ?/${p.d}`;
      case 'fracadd': return `${a}/${b} + ${p.c}/${p.d} = ?/${p.d}`;
      default: return p.missing ? `${a} + ? = ${p.total}` : `${show(a)} ${p.op} ${show(b)} = ?`;
    }
  }
  function explainOf(p) {
    const ans = p.answer;
    switch (p.op) {
      case 'count': return `There are ${ans} dots.`;
      case 'seq': return `${p.seq.join(', ')}, ${ans}. It goes up by ${p.step} each time.`;
      case 'place': return p.prompt.replace('?', ans);
      case 'half': return `Half of ${p.a} is ${ans}, because ${ans} + ${ans} = ${p.a}.`;
      case 'round': return `${show(p.a)} rounds to ${show(ans)}.`;
      case 'frac': return `${p.a}/${p.b} = ${ans}/${p.d}`;
      case 'fracadd': return `${p.a}/${p.b} + ${p.c}/${p.d} = ${ans}/${p.d}`;
      default: return p.missing ? `${p.a} + ${ans} = ${p.total}` : `${show(p.a)} ${p.op} ${show(p.b)} = ${show(ans)}`;
    }
  }

  // Wrong choices come from real mistakes kids make, then near misses.
  function choicesFor(p) {
    const ans = p.answer;
    if (p.op === 'or') return shuffle([p.a, p.b]);
    const near = p.dec && !Number.isInteger(ans) ? 0.1 : 1;
    const cands = [ans + near, ans - near];
    const { a, b } = p;
    if (p.missing) cands.push(p.total, p.total + a);
    else if (p.dec) {
      if (p.op === '×') cands.push(a, tenth(a * 100) / 1, tenth(ans / 100));
      else if (p.op === '÷') cands.push(a * 10, tenth(ans / 10), a);
      else cands.push(tenth(ans * 10), tenth(ans / 10), p.op === '+' ? tenth(a + b * 10) : tenth(a - b + 1));
    } else if (p.op === '+') { cands.push(a - b); if (ans >= 20) cands.push(ans - 10, ans + 10); }
    else if (p.op === '−') {
      cands.push(a + b);
      if (a >= 20) {
        // "Smaller from larger" in each column: the classic no-borrow mistake.
        const A = String(a), B = String(b).padStart(A.length, '0');
        const wrong = Number([...A].map((d, i) => Math.abs(Number(d) - Number(B[i]))).join(''));
        cands.push(wrong, ans + 10);
      }
    } else if (p.op === '×') cands.push(a + b, ans + b, ans - b, ans + a);
    else if (p.op === '÷') cands.push(ans + 2, b, ans * 2, ans + 10);
    else if (p.op === 'count') cands.push(ans + 2, ans - 2);
    else if (p.op === 'seq') cands.push(ans + p.step, p.seq[2], ans - p.step + 1);
    else if (p.op === 'place') cands.push(Number(String(ans).split('').reverse().join('')), String(ans).split('').reduce((x, y) => x + Number(y), 0), ans + 10);
    else if (p.op === 'half') cands.push(a, a - 2, ans + 5);
    else if (p.op === 'round') cands.push(ans === Math.floor(a / b) * b ? ans + b : ans - b, a, ans + 10 * b);
    else if (p.op === 'frac') cands.push(a, p.d - ans, ans * 2);
    else if (p.op === 'fracadd') cands.push(a + p.c, ans + 1, p.d);
    const ok = (c) => Number.isFinite(c) && c >= 0 && (p.dec ? tenth(c) === c : Number.isInteger(c));
    const set = new Set([ans]);
    for (const c of shuffle(cands.slice(2)).concat(cands.slice(0, 2))) {
      if (set.size >= 4) break;
      if (ok(c)) set.add(c);
    }
    for (let k = 2; set.size < 4; k++) set.add(p.dec && !Number.isInteger(ans) ? tenth(ans + k / 10) : ans + k);
    return shuffle([...set]);
  }

  function finish(p) {
    if (p.op === 'or') {
      p.text = 'Which number is bigger?';
      p.explain = `${Math.max(p.a, p.b)} is bigger than ${Math.min(p.a, p.b)}.`;
    } else {
      p.equation = fmt(p);
      p.text = p.story || p.equation;
      p.explain = explainOf(p);
    }
    p.choices = choicesFor(p);
    p.label = SKILLS[p.skillId].label;
    return p;
  }

  function make(skillId, grade, skills = {}) {
    const t = templateFor(skillId) || TEMPLATES[LEVELS[grade]][0];
    let p = t.gen();
    // Review problems from an earlier grade are never stretched.
    if (LEVELS.indexOf(SKILLS[t.skill].level) === grade) p = stretch(p, stretchLevel(skills[t.skill]), grade);
    return finish(p);
  }

  // A fresh problem just like `p` (same skill, no story), used after "Teach me".
  function twin(p) {
    const t = templateFor(p.skillId);
    for (let i = 0; i < 200; i++) {
      const q = t.gen();
      if (!q.story && !!q.missing === !!p.missing && !(q.a === p.a && q.b === p.b)) return finish(q);
    }
    return finish(t.gen());
  }

  // The fields a problem needs to be rebuilt later (for the review bank).
  function saveable(p) {
    const keep = {};
    for (const k of ['skillId', 'a', 'b', 'c', 'd', 'op', 'answer', 'missing', 'total', 'visual', 'visualMode', 'dec', 'seq', 'step', 'prompt']) {
      if (p[k] !== undefined) keep[k] = p[k];
    }
    return keep;
  }
  function fromReview(item) {
    return finish(fitVisual({ ...item, story: null }));
  }

  // ---------------------------------------------------------------- hints

  // A short strategy tip from the sidekick (first hint).
  function tip(p) {
    const { a, b } = p;
    if (p.story) {
      const why = { '+': 'Things are being put together, so we add', '−': 'Some are being taken away, so we subtract', '×': 'There are equal groups, so we multiply', '÷': 'They\'re split into equal groups, so we divide' }[p.op];
      return `${why}: ${p.equation}`;
    }
    if (p.missing) return `Count up from ${a} to ${p.total}. How many jumps did you make?`;
    switch (p.skillId) {
      case 'add-10':
        return `Start at ${Math.max(a, b)} and count up ${Math.min(a, b)} more.`;
      case 'add-20':
        if (a + b > 10 && Math.max(a, b) < 10) return `Try making a ten! ${Math.max(a, b)} + ${10 - Math.max(a, b)} = 10. Then add what's left.`;
        return `Start with the bigger number, ${Math.max(a, b)}. Then count up ${Math.min(a, b)}.`;
      case 'sub-10':
        return `Start with ${a}, take away ${b}, then count what's left.`;
      case 'sub-20':
        return b <= 4 ? `Start at ${a} and count back ${b}.` : `Think of it as adding: ${b} + ? = ${a}.`;
      case 'compare':
        return a >= 10 && b >= 10 ? 'Look at the tens first, then the ones.' : 'Which number comes later when you count? That\'s the bigger one.';
      case 'add-100':
      case 'add-1000':
        return `Add the ones first, then the tens${a >= 100 ? ', then the hundreds' : ''}. If a column makes 10 or more, carry the 1.`;
      case 'sub-100':
      case 'sub-1000':
        return a % 10 < b % 10
          ? 'There aren\'t enough ones! Trade 1 ten for 10 ones, then subtract.'
          : 'Take away the ones first, then the tens.';
      case 'equal-groups':
        return `That's ${a} groups of ${b}. Try counting by ${b}s.`;
      case 'mult-facts':
        return a <= 5 ? `Count by ${b}s, ${a} times.` : `Split it up: 5 × ${b}, plus ${a - 5} × ${b}.`;
      case 'div-facts':
        return `Think: ${b} × ? = ${a}.`;
      case 'count-10':
        return a > 5 ? 'The top row holds 5. Count on from 5 in the bottom row.' : 'Touch each dot as you count it.';
      case 'compare-10':
        return 'Find both numbers on the number line. The one farther right is bigger.';
      case 'skip-10':
      case 'place-100':
        if (p.op === 'seq') return `Each number goes up by ${p.step}. What comes after ${p.seq[2]}?`;
        return 'Each place tells how many. Write the hundreds, then the tens, then the ones.';
      case 'place-tens':
        return `${a} tens is ${a * 10}. Then add ${b} ones.`;
      case 'doubles':
        return `Doubles! ${a} + ${a} is two groups of ${a}.${a >= 5 ? ` Think: 5 + 5 = 10, plus ${a - 5} + ${a - 5}.` : ''}`;
      case 'halves':
        return `Half means 2 equal groups. What number plus itself makes ${a}?`;
      case 'round':
      case 'round-big': {
        const lo = Math.floor(a / b) * b, place = { 10: 'ones', 100: 'tens', 1000: 'hundreds' }[b];
        return `Is ${show(a)} closer to ${show(lo)} or ${show(lo + b)}? Look at the ${place} digit. 5 or more rounds up.`;
      }
      case 'add-multi':
        return 'Line up the places. Add the ones, tens, hundreds, then thousands. Carry when a column makes 10 or more.';
      case 'sub-multi':
        return 'Line up the places and subtract from right to left. Borrow when the top digit is smaller.';
      case 'mult-1digit':
      case 'mult-2digit': {
        const parts = expand(p.skillId === 'mult-2digit' ? b : a);
        return p.skillId === 'mult-2digit'
          ? `Split ${b} into ${parts.join(' + ')}. Do ${a} × each part, then add them.`
          : `Split ${a} into ${parts.join(' + ')}. Multiply each part by ${b}, then add.`;
      }
      case 'div-1digit':
      case 'div-long':
        return `Think: ${b} × ? = ${a}. Try ${b} × 10 = ${b * 10} first to see how big the answer is.`;
      case 'equiv-frac':
        return `How many times bigger is ${p.d} than ${b}? Multiply the top by that number too.`;
      case 'frac-add':
        return `Make the bottoms match first: ${a}/${b} = ?/${p.d}. Then add the tops.`;
      case 'dec-add':
      case 'dec-sub':
        return `Line up the decimal points. Then ${p.op === '+' ? 'add' : 'subtract'} like whole numbers.`;
      case 'dec-place':
        if (p.op === '×') return 'Times 10 makes it 10 times bigger. Each digit moves one place to the left.';
        if (p.op === '÷') return 'Divide by 10 and each digit moves one place to the right.';
        return 'Compare the tenths first: the first digit after the point.';
      default:
        return 'Take your time. You can do it!';
    }
  }

  // After a wrong answer: a hint about the likely mistake (Math Quest's rules).
  // What kind of slip a wrong answer is (null: no known pattern). The game says
  // SLIPS[kind].hint to the child; the grown-ups' progress page groups by SLIPS[kind].group.
  function mistakeKind(p, given) {
    if (p.op === 'or') return p.dec && given === Math.min(p.a, p.b) ? 'dec-compare' : null;
    if (p.missing) return given === p.a + p.total ? 'missing-add' : given === p.total ? 'missing-total' : null;
    if (p.dec) {
      if (given === tenth(p.answer * 10) || given === tenth(p.answer / 10) || given === Math.round(p.answer * 100) / 100) return 'dec-point';
      // Added or subtracted with the points out of line: 3.5 + 59.9 treated as 3.5 + 599.
      const off = p.op === '+' ? [tenth(p.a + p.b * 10), tenth(p.a * 10 + p.b)] : [tenth(p.a - p.b * 10), tenth(p.a * 10 - p.b)];
      if (off.includes(given)) return 'dec-line';
      if (Math.abs(given - p.answer) < 1) return 'dec-close';
      return null;
    }
    if (p.op === 'round') {
      const lo = Math.floor(p.a / p.b) * p.b;
      if (given === lo || given === lo + p.b) return 'round-way';
      if (given === p.a) return 'round-same';
      return null;
    }
    if (p.op === 'frac' && given === p.a) return 'frac-top';
    if (p.op === 'fracadd' && given === p.a + p.c) return 'frac-bottom';
    if (p.op === 'half' && given === p.a * 2) return 'half-double';
    if (p.op === 'seq' && given === p.seq[2] + 1 && p.step !== 1) return 'seq-step';
    const d = Math.abs(given - p.answer);
    if (d === 0) return null;
    if (d === 1) return 'off-one';
    if (p.op === '+' && given === p.a - p.b) return 'add-sub';
    if (p.op === '−' && given === p.a + p.b) return 'sub-add';
    if (p.op === '×' && given === p.a + p.b) return 'mult-add';
    if (p.op === '−' && p.a >= 20) {
      // Took the smaller digit from the bigger one in each column instead of borrowing.
      const A = String(p.a), B = String(p.b).padStart(A.length, '0');
      const noBorrow = Number([...A].map((x, i) => Math.abs(Number(x) - Number(B[i]))).join(''));
      if (given === noBorrow) return 'no-borrow';
    }
    if (p.answer >= 10 && String(given) === String(p.answer).split('').reverse().join('')) return 'digit-order';
    if ((p.op === '+' || p.op === '−') && d % 10 === 0 && d < 100) return p.op === '+' ? 'carry' : 'borrow-tens';
    return null;
  }
  const SLIPS = {
    'dec-compare': { hint: 'More digits doesn\'t mean bigger! Compare the tenths first.', group: 'Decimals' },
    'dec-point': { hint: 'So close! Check where the decimal point goes.', group: 'Decimals' },
    'dec-line': { hint: 'Line up the decimal points first, so tenths sit under tenths.', group: 'Decimals' },
    'dec-close': { hint: 'Almost! Line up the decimal points and try again.', group: 'Decimals' },
    'round-way': { hint: 'Check the digit to the right of the place you\'re rounding to. 5 or more rounds up. 4 or less rounds down.', group: 'Rounding the wrong way' },
    'round-same': { hint: 'Rounding changes the number to a nearby round number.', group: 'Rounding the wrong way' },
    'frac-top': { hint: 'The bottom got bigger, so the top has to grow by the same amount.', group: 'Fractions' },
    'frac-bottom': { hint: 'Make the bottom numbers match before you add the tops.', group: 'Fractions' },
    'half-double': { hint: 'Half means splitting into 2 equal groups. The answer is smaller.', group: 'Mixing up the operation' },
    'seq-step': { hint: '', group: 'Counting by the wrong step' },
    'missing-add': { hint: 'This one asks how many more. Start at the first number and count up to the total.', group: 'Mystery numbers' },
    'missing-total': { hint: 'That\'s the total! How many do we add to get there?', group: 'Mystery numbers' },
    'off-one': { hint: 'So close! You\'re just one off. Count again carefully.', group: 'Off by one' },
    'add-sub': { hint: 'Careful! This one\'s adding, not taking away.', group: 'Mixing up the operation' },
    'sub-add': { hint: 'Careful! This one\'s taking away, not adding.', group: 'Mixing up the operation' },
    'mult-add': { hint: 'That\'s what you get when you add. This one\'s multiplying!', group: 'Mixing up the operation' },
    'no-borrow': { hint: 'Careful! When the top digit is smaller, you need to borrow.', group: 'Carrying and borrowing' },
    'digit-order': { hint: 'So close! Check the order of your digits.', group: 'Digits in the wrong order' },
    carry: { hint: 'Check the tens. Did you forget to carry the 1?', group: 'Carrying and borrowing' },
    'borrow-tens': { hint: 'Check the tens. Did you remember to borrow?', group: 'Carrying and borrowing' },
  };
  function mistakeHint(p, given) {
    const kind = mistakeKind(p, given);
    if (kind === 'seq-step') return `Look again. It goes up by ${p.step} each time, not 1.`;
    return kind ? SLIPS[kind].hint : null;
  }

  // ---------------------------------------------------------------- Teach me (step by step)

  // 347 -> [300, 40, 7] (skips zeros).
  function expand(n) {
    const ds = String(n).split('');
    return ds.map((d, i) => Number(d) * 10 ** (ds.length - 1 - i)).filter((x) => x > 0);
  }

  const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
  const cap = (w) => w[0].toUpperCase() + w.slice(1);
  const digits = (n) => String(n).split('').reverse().map(Number);

  function addBoard(a, b, carries, ans) {
    const s = ans.length ? [...ans].reverse().join('') : '';
    const u = Math.max(String(a).length, String(b).length + 2, s.length, String(a + b).length) + 1;
    const top = Array(u).fill(' ');
    carries.forEach((c, i) => { if (c && u - 1 - i >= 0) top[u - 1 - i] = '¹'; });
    const lines = [];
    if (top.join('').trim()) lines.push(top.join(''));
    lines.push(String(a).padStart(u), '+' + String(b).padStart(u - 1), '─'.repeat(u));
    if (s) lines.push(s.padStart(u));
    return lines;
  }

  function teachAdd(p) {
    const A = digits(p.a), B = digits(p.b), n = Math.max(A.length, B.length);
    const steps = [], ans = [], carries = [];
    let carry = 0;
    for (let e = 0; e < n; e++) {
      const x = A[e] ?? 0, y = B[e] ?? 0, sum = x + y + carry, place = PLACES[e];
      const big = sum >= 10, last = e === n - 1;
      steps.push({
        work: addBoard(p.a, p.b, [...carries], [...ans]),
        prompt: carry ? `Next, the ${place} column. Don't forget the carry! ${x} + ${y} + 1 = ?`
          : e === 0 ? `Start with the ${place} column, on the right: ${x} + ${y} = ?` : `Now the ${place} column: ${x} + ${y} = ?`,
        answer: sum,
        hint: carry ? `Add ${x} + ${y} first. Then add 1 more for the carry.` : `Count up from ${Math.max(x, y)}.`,
        after: big ? (last ? `${sum} has two digits, so write them both.` : `${sum} has two digits! Write the ${sum % 10} and carry the 1 over to the ${PLACES[e + 1]}.`) : `Write ${sum} in the ${place} place.`,
      });
      ans.push(sum % 10);
      carry = big ? 1 : 0;
      if (big) { carries[e + 1] = true; if (last) ans.push(1); }
    }
    steps.push({ work: addBoard(p.a, p.b, carries, ans), prompt: `All done! Read the bottom row: ${p.a} + ${p.b} = ?`, answer: p.answer, hint: 'It\'s on the bottom row.', after: 'Line them up, add from right to left, and carry when a column makes 10 or more.' });
    return { title: 'Column adding', intro: 'Stack the numbers so the places line up. Then add one column at a time, starting on the right.', steps };
  }

  function subBoard(D, B, ans) {
    const vis = (s) => s.split('̶').join('').length;
    const cols = [];
    for (let i = D.length - 1; i >= 0; i--) {
      const o = D[i];
      cols.push({
        rewrite: o.rewrite !== null ? String(o.rewrite) : '',
        top: o.rewrite !== null ? String(o.orig) + '̶' : String(o.orig),
        bottom: i < B.length ? String(B[i]) : '',
        ans: ans.length > i ? String(ans[i]) : '',
      });
    }
    const row = (k, lead) => lead + cols.map((c) => ' '.repeat(Math.max(0, 2 - vis(c[k]))) + c[k]).join(' ');
    const lines = [];
    const rw = row('rewrite', '  ');
    if (rw.trim()) lines.push(rw);
    const top = row('top', '  ');
    lines.push(top, row('bottom', '− '), '─'.repeat(vis(top)));
    const an = row('ans', '  ');
    if (an.trim()) lines.push(an);
    return lines;
  }

  function teachSub(p) {
    const D = digits(p.a).map((d) => ({ orig: d, rewrite: null })), B = digits(p.b);
    const val = (e) => (D[e].rewrite ?? D[e].orig);
    const steps = [], ans = [];
    let anyBorrow = false;
    for (let e = 0; e < D.length; e++) {
      const top = val(e), bot = B[e] ?? 0, place = PLACES[e];
      let borrowed = false, hops = 0;
      if (top < bot) {
        borrowed = anyBorrow = true;
        let t = e + 1;
        while (val(t) === 0) { D[t].rewrite = 9; hops++; t++; }
        D[t].rewrite = val(t) - 1;
        D[e].rewrite = top + 10;
      }
      const now = val(e);
      if (!(e >= B.length && D[e].rewrite === null)) {
        const from = e + 1 + hops;
        steps.push({
          work: subBoard(D, B, [...ans]),
          prompt: borrowed
            ? (hops ? `${cap(place)}: ${top} − ${bot}. Too small! The next place is 0, so borrow from farther left. Each 0 becomes 9. ${val(from) + 1} ${PLACES[from]} become ${val(from)} ${PLACES[from]}. Now ${now} − ${bot} = ?`
              : `${cap(place)}: ${top} − ${bot}. Too small! Borrow 1 from the ${PLACES[e + 1]}. ${val(e + 1) + 1} ${PLACES[e + 1]} become ${val(e + 1)} ${PLACES[e + 1]}. ${top} ${place} become ${now} ${place}. Now ${now} − ${bot} = ?`)
            : `${cap(place)}: ${now} − ${bot} = ?`,
          answer: now - bot,
          hint: borrowed ? `After borrowing you have ${now}. Count back ${bot} from ${now}.` : `Count back ${bot} from ${now}.`,
          after: `Write ${now - bot} in the ${place} place.`,
        });
      }
      ans.push(now - bot);
    }
    while (ans.length > 1 && ans[ans.length - 1] === 0) ans.pop();
    steps.push({ work: subBoard(D, B, ans), prompt: `All done! Read the bottom row: ${p.a} − ${p.b} = ?`, answer: p.answer, hint: 'It\'s on the bottom row.', after: anyBorrow ? 'That\'s borrowing! Trade 1 ten for 10 ones and keep going.' : 'Subtract from right to left, one column at a time.' });
    return { title: anyBorrow ? 'Borrowing' : 'Column taking away', intro: 'Stack the numbers. Take away one column at a time, starting on the right.', steps };
  }

  function teachCountOn(p) {
    const big = Math.max(p.a, p.b), small = Math.min(p.a, p.b);
    if (p.a + p.b > 10 && big < 10) {
      const need = 10 - big, rest = small - need;
      return {
        title: 'Make a ten',
        intro: `Ten is a friendly number. Let's fill a ten first, then add the rest.`,
        steps: [
          { work: [`${big} + ${small}`], prompt: `How many more does ${big} need to make 10? ${big} + ? = 10`, answer: need, hint: `Count up from ${big} to 10.`, after: `${big} + ${need} = 10. We'll take that ${need} from the ${small}.` },
          { work: [`${big} + ${small}`, `${big} + ${need} = 10`], prompt: `If we take ${need} from ${small}, how many are left? ${small} − ${need} = ?`, answer: rest, hint: `Count back ${need} from ${small}.`, after: `${rest} ${rest === 1 ? 'is' : 'are'} left.` },
          { work: [`${big} + ${small}`, `= 10 + ${rest}`], prompt: `Now it's easy: 10 + ${rest} = ?`, answer: 10 + rest, hint: `Ten and ${rest} more.`, after: `So ${p.a} + ${p.b} = ${p.answer}. Making a ten works every time!` },
        ],
      };
    }
    if (big >= 10 && small > 3) {
      const ones = big - 10;
      return {
        title: 'Ones first',
        intro: `${big} is 10 and ${ones}. Add the ones first, then the ten.`,
        steps: [
          { work: [`${big} + ${small}`, `= 10 + ${ones} + ${small}`], prompt: `Add the ones: ${ones} + ${small} = ?`, answer: ones + small, hint: `Start at ${Math.max(ones, small)}. Count up ${Math.min(ones, small)}.`, after: `${ones} + ${small} = ${ones + small}.` },
          { work: [`${big} + ${small}`, `= 10 + ${ones + small}`], prompt: `Now add the ten: 10 + ${ones + small} = ?`, answer: p.answer, hint: `Ten and ${ones + small} more.`, after: `So ${p.a} + ${p.b} = ${p.answer}.` },
        ],
      };
    }
    const steps = [];
    let at = big;
    const hops = [big];
    for (let i = 1; i <= small; i++) {
      steps.push({
        work: [`${p.a} + ${p.b}`, hops.join(', ') + ', ?'],
        prompt: i === 1 ? `Start at the bigger number, ${big}. Count up 1: ${big} + 1 = ?` : `Count up 1 more: ${at} + 1 = ?`,
        answer: at + 1,
        hint: `What number comes after ${at}?`,
        after: i === small ? `You counted up ${small}!` : `That's ${i} so far.`,
      });
      at += 1;
      hops.push(at);
    }
    steps.push({ work: [`${p.a} + ${p.b}`, hops.join(', ')], prompt: `So ${p.a} + ${p.b} = ?`, answer: p.answer, hint: 'It\'s the last number you said.', after: 'Start big and count on. Great trick!' });
    return { title: 'Count on', intro: `Start at the bigger number, ${big}. Then count up ${small}.`, steps };
  }

  function teachTakeAway(p) {
    const { a, b } = p;
    if (b <= 5) {
      const steps = [];
      let at = a;
      const seen = [a];
      for (let i = 1; i <= b; i++) {
        steps.push({
          work: [`${a} − ${b}`, seen.join(', ') + ', ?'],
          prompt: i === 1 ? `Start at ${a}. Count back 1: ${a} − 1 = ?` : `Count back 1 more: ${at} − 1 = ?`,
          answer: at - 1,
          hint: `What number comes just before ${at}?`,
          after: i === b ? `You counted back ${b}!` : `That's ${i} back so far.`,
        });
        at -= 1;
        seen.push(at);
      }
      steps.push({ work: [`${a} − ${b}`, seen.join(', ')], prompt: `So ${a} − ${b} = ?`, answer: p.answer, hint: 'It\'s the last number you said.', after: 'Counting back is great for small take-aways!' });
      return { title: 'Count back', intro: `Start at ${a}. Count back ${b}.`, steps };
    }
    return {
      title: 'Think adding',
      intro: 'Taking away is like adding backwards. Let\'s find the missing part!',
      steps: [
        { work: [`${a} − ${b}`, `${b} + ? = ${a}`], prompt: `${b} + ? = ${a}. Count up from ${b} to ${a}. How many?`, answer: p.answer, hint: `Start at ${b}. Count up until you reach ${a}.`, after: `${b} + ${p.answer} = ${a}.` },
        { work: [`${a} − ${b}`, `${b} + ${p.answer} = ${a}`], prompt: `So ${a} − ${b} = ?`, answer: p.answer, hint: 'It\'s the missing part you just found.', after: 'Every take-away hides an adding fact!' },
      ],
    };
  }

  function teachMissing(p) {
    const q = `${p.a} + ? = ${p.total}`;
    return {
      title: 'The mystery number',
      intro: `${q} is a mystery-number puzzle! We start at ${p.a} and end at ${p.total}.`,
      steps: [
        { work: [q], prompt: `Take away the part we know: ${p.total} − ${p.a} = ?`, answer: p.total - p.a, hint: `Count up from ${p.a} to ${p.total}. How many hops?`, after: 'That\'s the mystery number!' },
        { work: [q, `${p.total} − ${p.a} = ${p.answer}`], prompt: `Check it: ${p.a} + ${p.answer} = ?`, answer: p.total, hint: `Add ${p.a} and ${p.answer}.`, after: `It matches! The mystery number is ${p.answer}.` },
      ],
    };
  }

  function teachCompare(p) {
    const { a, b } = p, big = Math.max(a, b);
    const tensA = Math.floor(a / 10), tensB = Math.floor(b / 10);
    if (tensA !== tensB) {
      return {
        title: 'Tens first',
        intro: 'To compare, look at the tens first.',
        steps: [
          { work: [`${a} has ${tensA} ten${tensA === 1 ? '' : 's'}`, `${b} has ${tensB} ten${tensB === 1 ? '' : 's'}`], prompt: 'Which number has more tens?', answer: tensA > tensB ? a : b, choices: [a, b], hint: `${Math.max(tensA, tensB)} tens is more than ${Math.min(tensA, tensB)}.`, after: 'More tens means a bigger number.' },
          { work: [`${a}  or  ${b}`], prompt: 'So which number is bigger?', answer: big, choices: [a, b], hint: 'It\'s the one with more tens.', after: `${big} is bigger!` },
        ],
      };
    }
    return {
      title: 'Count to compare',
      intro: 'When you count up, bigger numbers come later.',
      steps: [
        { work: [`${Math.min(a, b)}, ..., ${big}`], prompt: `When you count up, which do you say later: ${a} or ${b}?`, answer: big, choices: [a, b], hint: `Count: ${Math.min(a, b)}, ${Math.min(a, b) + 1}, ...`, after: `${big} comes later.` },
        { work: [`${a}  or  ${b}`], prompt: 'So which number is bigger?', answer: big, choices: [a, b], hint: 'The one you say later is bigger.', after: `${big} is bigger!` },
      ],
    };
  }

  function teachMult(p) {
    const t = p.a, n = p.b, q = `${p.a} × ${p.b}`, steps = [];
    if (t <= 5) {
      const seen = [n];
      let at = n;
      for (let i = 2; i <= t; i++) {
        steps.push({
          work: [q, seen.join(', ') + ', ?'],
          prompt: i === 2 ? `${q} means ${t} groups of ${n}. Let's count by ${n}s. We start at ${n}, then add ${n} more: ${n} + ${n} = ?` : `Keep counting: ${at} + ${n} = ?`,
          answer: at + n,
          hint: `Count up ${n} from ${at}.`,
          after: i === t ? `You counted all ${t} groups!` : `That's ${i} groups so far.`,
        });
        at += n;
        seen.push(at);
      }
      steps.push({ work: [q, seen.join(', ')], prompt: `So ${t} groups of ${n} is... ${q} = ?`, answer: p.answer, hint: 'It\'s the last number you counted.', after: 'If you ever forget a fact, skip counting always works!' });
      return { title: 'Skip counting', intro: 'Multiplying is counting equal groups. Skip count and you never get stuck.', steps };
    }
    const rest = t - 5, split = `= 5 × ${n}  +  ${rest} × ${n}`;
    steps.push({ work: [q, split], prompt: `Split ${t} into 5 + ${rest}. Friendly fives first: 5 × ${n} = ?`, answer: 5 * n, hint: `Count by fives, ${n} times.`, after: `5 groups of ${n} is ${5 * n}.` });
    steps.push({ work: [q, split, `5 × ${n} = ${5 * n}`], prompt: `Now the rest: ${rest} × ${n} = ?`, answer: rest * n, hint: `Count by ${n}s, ${rest} time${rest === 1 ? '' : 's'}.`, after: `Two easy pieces: ${5 * n} and ${rest * n}.` });
    steps.push({ work: [q, split, `5 × ${n} = ${5 * n}`, `${rest} × ${n} = ${rest * n}`], prompt: `Put them together: ${5 * n} + ${rest * n} = ?`, answer: p.answer, hint: 'Add the two parts.', after: `So ${q} = ${p.answer}. Splitting into fives works for any hard fact!` });
    return { title: 'Friendly fives', intro: `Big facts get easy when you split them: ${t} groups = 5 groups + ${rest} groups.`, steps };
  }

  function teachDiv(p) {
    const ans = p.answer, base5 = 5 * p.b, lines = [`${p.a} ÷ ${p.b}`, `${p.b} × ? = ${p.a}`], steps = [];
    if (ans !== 5) {
      steps.push({ work: lines, prompt: `Division is a mystery-number puzzle: ${p.b} × ? = ${p.a}. Let's try 5 first: ${p.b} × 5 = ?`, answer: base5, hint: `Count by ${p.b}s, five times.`, after: base5 < p.a ? `${base5} is too small. We need more groups.` : `${base5} is too big. We need fewer groups.` });
    }
    const tried = ans !== 5 ? [`${p.b} × 5 = ${base5}  ✗ ${base5 < p.a ? 'too small' : 'too big'}`] : [];
    steps.push({ work: [...lines, ...tried], prompt: ans === 5 ? `${p.b} × ? = ${p.a}. Let's try 5: ${p.b} × 5 = ?` : `Now try ${ans}: ${p.b} × ${ans} = ?`, answer: p.b * ans, hint: `Count by ${p.b}s.`, after: `${p.b} × ${ans} = ${p.a}. That's it!` });
    steps.push({ work: [...lines, ...tried, `${p.b} × ${ans} = ${p.a}  ✓`], prompt: `So ${p.a} ÷ ${p.b} = ?`, answer: ans, hint: 'It\'s the number you just found.', after: 'Every division fact hides a times fact you already know.' });
    return { title: 'Think multiplication', intro: 'Division is multiplication backwards. Find the missing number.', steps };
  }


  function teachCount(p) {
    const a = p.answer;
    if (a <= 5) {
      return { title: 'Touch and count', intro: 'Touch each dot one time as you count it.', steps: [
        { work: ['1, 2, 3, ...'], prompt: 'Touch each dot and count. How many dots?', answer: a, hint: 'Say one number for each dot.', after: `The last number you say is how many: ${a}.` },
      ] };
    }
    return { title: 'Count on from 5', intro: 'A ten-frame row holds 5. Start at 5 and count on.', steps: [
      { work: ['Top row: full'], prompt: 'How many dots fill a whole row?', answer: 5, hint: 'Count the top row.', after: 'A full row is 5.' },
      { work: ['Top row: 5', `Bottom row: ${a - 5}`], prompt: `Count on from 5: 5 + ${a - 5} = ?`, answer: a, hint: `Say 5, then count up ${a - 5} more.`, after: `There are ${a} dots. Counting on from 5 is fast!` },
    ] };
  }

  function teachSeq(p) {
    const { seq, step } = p, last = seq[seq.length - 1];
    return { title: 'Find the pattern', intro: 'Each number goes up by the same amount. Find out how much, then keep going.', steps: [
      { work: [`${seq.join(', ')}, ?`], prompt: `How much does it go up each time? ${seq[0]} to ${seq[1]} is +?`, answer: step, hint: `Count up from ${seq[0]} to ${seq[1]}.`, after: `It goes up by ${step} each time.` },
      { work: [`${seq.join(', ')}, ?`, `+${step} each time`], prompt: `So what comes next? ${last} + ${step} = ?`, answer: p.answer, hint: `Count up ${step} from ${last}.`, after: `${seq.join(', ')}, ${p.answer}!` },
    ] };
  }

  function teachPlace(p) {
    if (p.skillId === 'place-tens') {
      const t = p.a, o = p.b;
      return { title: 'Tens and ones', intro: 'Each ten is a stick of 10. Count the tens by 10s, then add the ones.', steps: [
        { work: [`${t} tens, ${o} ones`], prompt: `Count ${t} tens by 10s. ${t} tens = ?`, answer: 10 * t, hint: `10, 20, 30... say ${t} numbers.`, after: `${t} tens is ${10 * t}.` },
        { work: [`${t} tens = ${10 * t}`, `${o} ones = ${o}`], prompt: `${10 * t} + ${o} = ?`, answer: p.answer, hint: `Start at ${10 * t} and count up ${o}.`, after: `${t} tens and ${o} ones is ${p.answer}.` },
      ] };
    }
    const h = p.a, t = p.b, o = p.o;
    return { title: 'Hundreds, tens and ones', intro: 'Build the number one place at a time: hundreds, then tens, then ones.', steps: [
      { work: [p.prompt], prompt: `${h} hundreds = ?`, answer: 100 * h, hint: `Count by 100s, ${h} times.`, after: `${h} hundreds is ${100 * h}.` },
      { work: [p.prompt, `${h} hundreds = ${100 * h}`], prompt: `Add the tens: ${100 * h} + ${10 * t} = ?`, answer: 100 * h + 10 * t, hint: `${t} tens is ${10 * t}.`, after: `Now we have ${100 * h + 10 * t}.` },
      { work: [p.prompt, `= ${100 * h + 10 * t} + ${o}`], prompt: `Add the ones: ${100 * h + 10 * t} + ${o} = ?`, answer: p.answer, hint: `Put ${o} in the ones place.`, after: `The digits are ${h}, ${t}, ${o}: ${p.answer}.` },
    ] };
  }

  function teachHalf(p) {
    const a = p.a, ans = p.answer, tens = Math.floor(a / 10) * 10, ones = a % 10;
    if (!tens) {
      return { title: 'Share it out', intro: `Half means 2 equal groups. Deal ${a} things out one at a time, like cards.`, steps: [
        { work: [`${a} → ? + ?`], prompt: `Which double makes ${a}? ? + ? = ${a}`, answer: ans, hint: `Try ${ans - 1} + ${ans - 1}. Too small? Try one more.`, after: `${ans} + ${ans} = ${a}. Half of ${a} is ${ans}.` },
      ] };
    }
    const steps = [{ work: [`${a} = ${tens} + ${ones}`], prompt: `Split ${a} into ${tens} and ${ones}. Half of ${tens} = ?`, answer: tens / 2, hint: `What number plus itself makes ${tens}?`, after: `Half of ${tens} is ${tens / 2}.` }];
    if (ones) steps.push({ work: [`${a} = ${tens} + ${ones}`, `half of ${tens} = ${tens / 2}`], prompt: `Half of ${ones} = ?`, answer: ones / 2, hint: `? + ? = ${ones}`, after: `Half of ${ones} is ${ones / 2}.` });
    steps.push({ work: [`half of ${tens} = ${tens / 2}`, ...(ones ? [`half of ${ones} = ${ones / 2}`] : [])], prompt: ones ? `Put them together: ${tens / 2} + ${ones / 2} = ?` : `So half of ${a} = ?`, answer: ans, hint: 'Add the halves.', after: `Half of ${a} is ${ans}. Check: ${ans} + ${ans} = ${a}.` });
    return { title: 'Split and halve', intro: 'Big numbers are easier to halve in pieces: the tens, then the ones.', steps };
  }

  function teachRound(p) {
    const { a, b } = p, lo = Math.floor(a / b) * b, hi = lo + b;
    const place = { 10: 'ones', 100: 'tens', 1000: 'hundreds' }[b], d = Math.floor((a % b) / (b / 10));
    return { title: 'Round on a number line', intro: `Find the two round numbers ${a} sits between. Then see which one it's closer to.`, steps: [
      { work: [`${lo} ... ${a} ... ?`], prompt: `${a} is between ${lo} and what?`, answer: hi, hint: `Count up ${b} from ${lo}.`, after: `${a} is between ${lo} and ${hi}.` },
      { work: [`${lo} ... ${a} ... ${hi}`], prompt: `What is the ${place} digit of ${a}?`, answer: d, hint: `Look at the ${place} place.`, after: d >= 5 ? `${d} is 5 or more, so we round up.` : `${d} is less than 5, so we round down.` },
      { work: [`${lo} ... ${a} ... ${hi}`, d >= 5 ? 'round up' : 'round down'], prompt: `So ${a} rounds to ?`, answer: p.answer, choices: [lo, hi], hint: d >= 5 ? 'Round up to the bigger one.' : 'Round down to the smaller one.', after: `${a} rounds to ${p.answer}.` },
    ] };
  }

  // Partial products: 347 × 6 = 300 × 6 + 40 × 6 + 7 × 6.
  function teachPartial(p) {
    const two = p.skillId === 'mult-2digit' || (p.b >= 10 && p.a >= 10);
    const [x, y] = two ? [p.a, p.b] : [p.b, p.a]; // x stays whole, y gets split
    const parts = expand(y), steps = [], done = [];
    for (const part of parts) {
      const zeros = String(part).length - 1, lead = part / 10 ** zeros;
      steps.push({
        work: [`${p.a} × ${p.b}`, `= ${parts.map((q) => `${q} × ${x}`).join(' + ')}`, ...done],
        prompt: `${part} × ${x} = ?`,
        answer: part * x,
        hint: zeros ? `${lead} × ${x} = ${lead * x}. Then add ${zeros === 1 ? 'a zero' : `${zeros} zeros`}.` : `Think ${part} groups of ${x}.`,
        after: `${part} × ${x} = ${part * x}.`,
      });
      done.push(`${part} × ${x} = ${part * x}`);
    }
    if (parts.length > 1) steps.push({ work: [`${p.a} × ${p.b}`, ...done], prompt: `Add the parts: ${parts.map((q) => q * x).join(' + ')} = ?`, answer: p.answer, hint: 'Add them one at a time.', after: `So ${p.a} × ${p.b} = ${p.answer}.` });
    return { title: 'Split and multiply', intro: `Split ${y} into ${parts.join(' + ')}. Multiply each part, then add.`, steps };
  }

  // Long division, one digit at a time: how many fit, then what's left.
  function teachLongDiv(p) {
    const { a, b } = p, ds = String(a).split('').map(Number), steps = [], qd = [];
    let cur = 0, started = false;
    ds.forEach((d, i) => {
      cur = cur * 10 + d;
      if (!started && cur < b && i < ds.length - 1) return;
      started = true;
      const q = Math.floor(cur / b), left = cur - q * b;
      steps.push({
        work: [`${a} ÷ ${b}`, `answer so far: ${qd.join('') || '_'}`],
        prompt: `How many ${b}s fit in ${cur}? (${b} × ? without going over)`,
        answer: q,
        hint: `Count by ${b}s until the next one would pass ${cur}.`,
        after: i < ds.length - 1 ? `${b} × ${q} = ${q * b}. ${cur} − ${q * b} leaves ${left}. Bring down the next digit.` : `${b} × ${q} = ${q * b}. Nothing left over!`,
      });
      qd.push(q);
      cur = left;
    });
    steps.push({ work: [`${a} ÷ ${b}`, `answer: ${qd.join('')}`], prompt: `So ${a} ÷ ${b} = ?`, answer: p.answer, hint: 'Read the digits you found, in order.', after: `Check: ${b} × ${p.answer} = ${a}.` });
    return { title: 'Long division', intro: 'Go left to right. At each digit ask: how many fit? Then carry what\'s left to the next digit.', steps };
  }

  function teachEquiv(p) {
    const k = p.d / p.b;
    return { title: 'Grow the fraction', intro: 'Multiply the top and the bottom by the same number. The amount stays the same.', steps: [
      { work: [`${p.a}/${p.b} = ?/${p.d}`], prompt: `How many times bigger is ${p.d} than ${p.b}? ${p.b} × ? = ${p.d}`, answer: k, hint: `Count by ${p.b}s until you reach ${p.d}.`, after: `The bottom was multiplied by ${k}.` },
      { work: [`${p.a}/${p.b} = ?/${p.d}`, `bottom × ${k}`], prompt: `Do the same to the top: ${p.a} × ${k} = ?`, answer: p.answer, hint: `${p.a} groups of ${k}.`, after: `${p.a}/${p.b} = ${p.answer}/${p.d}. Same amount, smaller pieces!` },
    ] };
  }

  function teachFracAdd(p) {
    const k = p.d / p.b;
    return { title: 'Match the bottoms', intro: 'You can only add fractions when the pieces are the same size. Match the bottom numbers first.', steps: [
      { work: [`${p.a}/${p.b} + ${p.c}/${p.d}`], prompt: `${p.b} × ? = ${p.d}`, answer: k, hint: `Count by ${p.b}s to ${p.d}.`, after: `Multiply ${p.a}/${p.b} by ${k} on top and bottom.` },
      { work: [`${p.a}/${p.b} + ${p.c}/${p.d}`, `${p.b} × ${k} = ${p.d}`], prompt: `${p.a}/${p.b} = ?/${p.d}. ${p.a} × ${k} = ?`, answer: p.a * k, hint: `${p.a} × ${k}.`, after: `${p.a}/${p.b} = ${p.a * k}/${p.d}.` },
      { work: [`${p.a * k}/${p.d} + ${p.c}/${p.d}`], prompt: `Now add the tops: ${p.a * k} + ${p.c} = ?`, answer: p.answer, hint: 'The bottom stays the same. Just add the tops.', after: `${p.a}/${p.b} + ${p.c}/${p.d} = ${p.answer}/${p.d}.` },
    ] };
  }

  // Decimals: line up the points, work in tenths, then put the point back.
  function teachDec(p) {
    const A = Math.round(p.a * 10), B = Math.round(p.b * 10), plus = p.op === '+';
    const inner = plus ? teachAdd({ ...p, a: A, b: B, answer: A + B }) : teachSub({ ...p, a: A, b: B, answer: A - B });
    const whole = plus ? A + B : A - B;
    inner.steps.push({ work: [`${p.a} ${p.op} ${p.b}`, `${A} ${p.op} ${B} = ${whole} tenths`], prompt: `Put the point back: one digit after it. ${whole} tenths = ?`, answer: p.answer, choices: [p.answer, whole, tenth(p.answer / 10) === p.answer / 10 ? p.answer / 10 : whole * 10], dec: true, hint: 'Move the point one place in from the right.', after: `${p.a} ${p.op} ${p.b} = ${p.answer}.` });
    return { title: 'Line up the points', intro: `Line up the decimal points. ${p.a} and ${p.b} are ${A} and ${B} tenths, so we can ${plus ? 'add' : 'subtract'} like whole numbers.`, steps: inner.steps };
  }

  function teachDecPlace(p) {
    const { a, b } = p;
    if (p.op === 'or') {
      const ha = Math.round(a * 100), hb = Math.round(b * 100);
      return { title: 'Same number of digits', intro: 'Give both numbers two digits after the point. Then compare like whole numbers.', steps: [
        { work: [`${a} = ${a.toFixed(2)}`], prompt: `${a.toFixed(2)} is how many hundredths?`, answer: ha, hint: 'Read the digits after the point.', after: `${a} is ${ha} hundredths.` },
        { work: [`${a} = ${ha} hundredths`, `${b} = ${b.toFixed(2)}`], prompt: `${b.toFixed(2)} is how many hundredths?`, answer: hb, hint: 'Read the digits after the point.', after: `${b} is ${hb} hundredths.` },
        { work: [`${a} = ${ha} hundredths`, `${b} = ${hb} hundredths`], prompt: 'So which is bigger?', answer: Math.max(a, b), choices: [a, b], dec: true, hint: `${Math.max(ha, hb)} hundredths is more.`, after: `${Math.max(a, b)} is bigger. More digits doesn't mean bigger!` },
      ] };
    }
    if (p.op === '×') {
      const whole = Math.floor(a), t = Math.round((a - whole) * 10);
      return { title: 'Times 10', intro: 'Times 10 makes every part 10 times bigger. Each digit moves one place left.', steps: [
        { work: [`${a} = ${whole} and ${t} tenths`], prompt: `${whole} × 10 = ?`, answer: whole * 10, hint: 'Add a zero to the end.', after: `${whole} × 10 = ${whole * 10}.` },
        { work: [`${whole} × 10 = ${whole * 10}`, `${t} tenths × 10 = ${t} ones`], prompt: `${whole * 10} + ${t} = ?`, answer: p.answer, hint: `Ten tenths make one. So ${t} tenths × 10 = ${t}.`, after: `${a} × 10 = ${p.answer}.` },
      ] };
    }
    const tens = Math.floor(a / 10), ones = a % 10;
    return { title: 'Divide by 10', intro: 'Divide by 10 and each digit moves one place right. Ones become tenths.', steps: [
      { work: [`${a} = ${tens} tens and ${ones} ones`], prompt: `How many tens are in ${a}?`, answer: tens, hint: `Cover the ones digit.`, after: `${tens} tens become ${tens} ones.` },
      { work: [`${tens} tens → ${tens} ones`, `${ones} ones → ${ones} tenths`], prompt: `So ${a} ÷ 10 = ?`, answer: p.answer, choices: [p.answer, a * 10, tens], dec: true, hint: `${tens} and ${ones} tenths.`, after: `${a} ÷ 10 = ${p.answer}.` },
    ] };
  }

  // A Teach me lesson for p. After a kid has seen a lesson twice, the first worked
  // step is skipped (faded worked examples, Renkl & Atkinson).
  function teach(p, seen = 0) {
    let lesson;
    if (p.missing) lesson = teachMissing(p);
    else {
      switch (p.skillId) {
        case 'add-10': case 'add-20': case 'doubles': lesson = teachCountOn(p); break;
        case 'sub-10': case 'sub-20': lesson = teachTakeAway(p); break;
        case 'compare': case 'compare-10': lesson = teachCompare(p); break;
        case 'count-10': lesson = teachCount(p); break;
        case 'skip-10': lesson = teachSeq(p); break;
        case 'place-tens': lesson = teachPlace(p); break;
        case 'place-100': lesson = p.op === 'seq' ? teachSeq(p) : teachPlace(p); break;
        case 'halves': lesson = teachHalf(p); break;
        case 'round': case 'round-big': lesson = teachRound(p); break;
        case 'add-100': case 'add-1000': case 'add-multi': lesson = teachAdd(p); break;
        case 'sub-100': case 'sub-1000': case 'sub-multi': lesson = teachSub(p); break;
        case 'equal-groups': case 'mult-facts': lesson = teachMult(p); break;
        case 'mult-1digit': case 'mult-2digit': lesson = teachPartial(p); break;
        case 'div-facts': lesson = teachDiv(p); break;
        case 'div-1digit': case 'div-long': lesson = teachLongDiv(p); break;
        case 'equiv-frac': lesson = teachEquiv(p); break;
        case 'frac-add': lesson = teachFracAdd(p); break;
        case 'dec-add': case 'dec-sub': lesson = teachDec(p); break;
        case 'dec-place': lesson = teachDecPlace(p); break;
        default: return null;
      }
    }
    if (p.story) lesson.intro = `This story is really ${p.equation.replace(' = ?', '')}. ` + lesson.intro;
    if (seen >= 2 && lesson.steps.length >= 3) {
      lesson.steps = lesson.steps.slice(1);
      lesson.intro = 'You know this trick! Let\'s skip ahead. ' + lesson.intro;
      lesson.faded = true;
    }
    lesson.steps.forEach((s) => {
      if (!s.choices) {
        const set = new Set([s.answer]);
        for (const c of shuffle([s.answer + 1, s.answer - 1, s.answer + 2, s.answer >= 20 ? s.answer + 10 : s.answer - 2])) {
          if (set.size >= 3) break;
          if (c >= 0) set.add(c);
        }
        s.choices = shuffle([...set]);
      } else s.choices = shuffle([...new Set(s.choices)]);
    });
    return lesson;
  }

  return {
    SKILLS, MASTERY, LEVELS,
    pickSkill, weakestSkill, gradeSkills, stretchLevel, accuracy,
    make, twin, fromReview, saveable, tip, mistakeHint, mistakeKind, SLIPS, teach, show, fmt,
    TRICKS: ['Count on', 'Make a ten', 'Count back', 'Think adding', 'Column adding', 'Borrowing', 'Skip counting', 'Friendly fives',
      'Think multiplication', 'Find the pattern', 'Tens and ones', 'Split and halve', 'Round on a number line', 'Split and multiply',
      'Long division', 'Grow the fraction', 'Match the bottoms', 'Line up the points', 'The mystery number'],
  };
})();
