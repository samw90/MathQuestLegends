// Math engine. Follows Math Quest's grade scheme (Common Core K-3) so both
// games teach the same skills at the same difficulty:
//   K   add/sub within 10, with ten-frames always shown        (K.OA.A)
//   G1  add/sub within 20 with ten-frames, comparing            (1.OA.C)
//   G2  two-digit add/sub with base-ten blocks, equal groups    (2.NBT.B, 2.OA.C)
//   G3  times tables, division facts, add/sub within 1,000      (3.OA.C, 3.NBT.A)
// Also ported from Math Quest: weak skills come up more often, strong skills
// "stretch" to bigger numbers, 15% review of earlier grades, story problems
// in Grades 2-3, mistake-aware hints and step-by-step "Teach me" lessons.
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

  const LEVELS = ['k', 'g1', 'g2', 'g3'];

  const SKILLS = {
    'add-10': { label: 'Adding within 10', level: 'k', family: 'add' },
    'sub-10': { label: 'Taking away within 10', level: 'k', family: 'sub' },
    'add-20': { label: 'Adding within 20', level: 'g1', family: 'add' },
    'sub-20': { label: 'Taking away within 20', level: 'g1', family: 'sub' },
    compare: { label: 'Comparing numbers', level: 'g1', family: 'compare' },
    'add-100': { label: 'Two-digit adding', level: 'g2', family: 'add' },
    'sub-100': { label: 'Two-digit taking away', level: 'g2', family: 'sub' },
    'equal-groups': { label: 'Equal groups', level: 'g2', family: 'mult' },
    'mult-facts': { label: 'Times tables', level: 'g3', family: 'mult' },
    'div-facts': { label: 'Division facts', level: 'g3', family: 'div' },
    'add-1000': { label: 'Adding within 1,000', level: 'g3', family: 'add' },
    'sub-1000': { label: 'Taking away within 1,000', level: 'g3', family: 'sub' },
  };

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
    const text = {
      add: `${n1} has ${p.a} ${t}. ${n2} gives ${n1} ${p.b} more. How many ${t} does ${n1} have now?`,
      sub: `${n1} has ${p.a} ${t}. ${n1} gives ${p.b} to ${n2}. How many ${t} are left?`,
      mult: `${n1} fills ${p.a} bags. Each bag has ${p.b} ${t}. How many ${t} in all?`,
      div: `${n1} puts ${p.a} ${t} into ${p.b} equal groups. How many ${t} are in each group?`,
    }[kind];
    return { ...p, story: text, visualMode: p.visual ? 'hint' : p.visualMode };
  }

  // 25% of Grade 1 adding problems hide a number: 6 + ? = 13.
  function missingAddend(p) {
    if (p.story || Math.random() > 0.25) return p;
    return { ...p, missing: true, total: p.a + p.b, answer: p.b, visual: null, visualMode: 'none' };
  }

  // ---------------------------------------------------------------- templates (from Math Quest)

  const TEMPLATES = {
    k: [
      { skill: 'add-10', weight: 55, gen() { const a = r(1, 9), b = r(1, 10 - a); return base('add-10', a, b, '+', a + b, { kind: 'tenframe', a, b, mode: 'add' }, 'always'); } },
      { skill: 'sub-10', weight: 45, gen() { const a = r(2, 10), b = r(1, a - 1); return base('sub-10', a, b, '−', a - b, { kind: 'tenframe', a, b, mode: 'sub' }, 'always'); } },
    ],
    g1: [
      { skill: 'add-20', weight: 55, gen() { const a = r(3, 15), b = r(2, Math.min(20 - a, 12)); return missingAddend(base('add-20', a, b, '+', a + b, { kind: 'tenframe', a, b, mode: 'add' }, 'always')); } },
      { skill: 'sub-20', weight: 45, gen() { const a = r(5, 20), b = r(2, a - 1); return base('sub-20', a, b, '−', a - b, { kind: 'tenframe', a, b, mode: 'sub' }, 'always'); } },
      { skill: 'compare', weight: 10, gen() { const a = r(5, 20); let b = r(5, 20); while (b === a) b = r(5, 20); return base('compare', a, b, 'or', Math.max(a, b), null, 'none'); } },
    ],
    g2: [
      { skill: 'add-100', weight: 40, gen() { const a = r(12, 70), b = r(11, 99 - a); return story(base('add-100', a, b, '+', a + b, { kind: 'baseten', a, b, mode: 'add' }, 'hint'), 'add'); } },
      { skill: 'sub-100', weight: 35, gen() { const a = r(25, 99), b = r(11, a - 10); return story(base('sub-100', a, b, '−', a - b, { kind: 'baseten', a, b, mode: 'sub' }, 'hint'), 'sub'); } },
      { skill: 'equal-groups', weight: 25, gen() { const a = r(2, 5), b = r(2, 5); return story(base('equal-groups', a, b, '×', a * b, { kind: 'array', rows: a, cols: b }, 'always'), 'mult'); } },
    ],
    g3: [
      { skill: 'mult-facts', weight: 35, gen() { const a = r(2, 10), b = r(2, 10); return story(base('mult-facts', a, b, '×', a * b, { kind: 'array', rows: a, cols: b }, 'hint'), 'mult'); } },
      { skill: 'div-facts', weight: 30, gen() { const t = r(2, 10), n = r(2, 10); return story(base('div-facts', t * n, t, '÷', n, { kind: 'array', rows: t, cols: n }, 'hint'), 'div'); } },
      { skill: 'add-1000', weight: 20, gen() { const a = r(120, 700), b = r(100, 999 - a); return story(base('add-1000', a, b, '+', a + b, null, 'none'), 'add'); } },
      { skill: 'sub-1000', weight: 15, gen() { const a = r(300, 999), b = r(100, a - 50); return story(base('sub-1000', a, b, '−', a - b, null, 'none'), 'sub'); } },
    ],
  };
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

  // Strong skills sometimes get bigger numbers.
  function stretch(p, level, grade) {
    if (!level || p.story || p.missing) return p;
    if (Math.random() > (level === 2 ? 0.85 : 0.5)) return p;
    const L = LEVELS[grade];
    const cap = { k: 10, g1: 20, g2: 99, g3: 999 }[L];
    const f = level === 2 ? 2.5 : 1.7;
    const M = Math.min(Math.round(cap * f), { k: 20, g1: 99, g2: 999, g3: 9999 }[L]);
    if (p.op === '+') {
      const a = r(Math.max(2, Math.round(0.6 * cap)), Math.max(3, M - 1));
      const b = r(1, Math.max(1, M - a));
      return { ...p, a, b, answer: a + b, visual: p.visual ? { ...p.visual, a, b } : null, stretched: true };
    }
    if (p.op === '−') {
      const a = r(Math.max(3, Math.round(0.7 * cap)), Math.max(4, M));
      const b = r(1, a - 1);
      return { ...p, a, b, answer: a - b, visual: p.visual ? { ...p.visual, a, b } : null, stretched: true };
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

  const fmt = (p) => (p.missing ? `${p.a} + ? = ${p.total}` : `${p.a} ${p.op} ${p.b} = ?`);

  function choicesFor(p) {
    const ans = p.answer;
    if (p.op === 'or') return shuffle([p.a, p.b]);
    const cands = [ans + 1, ans - 1];
    if (p.missing) cands.push(p.total, p.total + p.a);
    else if (p.op === '+') { cands.push(p.a - p.b); if (ans >= 20) cands.push(ans - 10, ans + 10); }
    else if (p.op === '−') {
      cands.push(p.a + p.b);
      if (p.a >= 20) {
        // "Smaller from larger" in each column: the classic no-borrow mistake.
        const A = String(p.a), B = String(p.b).padStart(A.length, '0');
        const wrong = Number([...A].map((d, i) => Math.abs(Number(d) - Number(B[i]))).join(''));
        cands.push(wrong, ans + 10);
      }
    } else if (p.op === '×') cands.push(p.a + p.b, ans + p.b, ans - p.b, ans + p.a);
    else if (p.op === '÷') cands.push(ans + 2, p.b, ans * 2);
    const set = new Set([ans]);
    for (const c of shuffle(cands.slice(2)).concat(cands.slice(0, 2))) {
      if (set.size >= 4) break;
      if (Number.isInteger(c) && c >= 0) set.add(c);
    }
    for (let k = 2; set.size < 4; k++) set.add(ans + k);
    return shuffle([...set]);
  }

  function finish(p) {
    if (p.op === 'or') {
      p.text = 'Which number is bigger?';
      p.explain = `${Math.max(p.a, p.b)} is bigger than ${Math.min(p.a, p.b)}.`;
    } else {
      p.equation = fmt(p);
      p.text = p.story || p.equation;
      p.explain = p.missing ? `${p.a} + ${p.answer} = ${p.total}` : `${p.a} ${p.op} ${p.b} = ${p.answer}`;
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
    for (let i = 0; i < 25; i++) {
      const q = t.gen();
      if (!q.story && !!q.missing === !!p.missing && !(q.a === p.a && q.b === p.b)) return finish(q);
    }
    return finish(t.gen());
  }

  function fromReview(item) {
    return finish({ ...item, story: null });
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
      default:
        return 'Take your time. You can do it!';
    }
  }

  // After a wrong answer: a hint about the likely mistake (Math Quest's rules).
  function mistakeHint(p, given) {
    if (p.missing || p.op === 'or') return null;
    const d = Math.abs(given - p.answer);
    if (d === 0) return null;
    if (d === 1) return 'So close! You\'re just one off. Count again carefully.';
    if (p.op === '+' && given === p.a - p.b) return 'Careful! This one\'s adding, not taking away.';
    if (p.op === '−' && given === p.a + p.b) return 'Careful! This one\'s taking away, not adding.';
    if (p.op === '×' && given === p.a + p.b) return 'That\'s what you get when you add. This one\'s multiplying!';
    if ((p.op === '+' || p.op === '−') && d % 10 === 0 && d < 100) {
      return p.op === '+' ? 'Check the tens. Did you forget to carry the 1?' : 'Check the tens. Did you remember to borrow?';
    }
    return null;
  }

  // ---------------------------------------------------------------- Teach me (step by step)

  const PLACES = ['ones', 'tens', 'hundreds', 'thousands'];
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

  function teach(p) {
    let lesson;
    if (p.missing) lesson = teachMissing(p);
    else {
      switch (p.skillId) {
        case 'add-10': case 'add-20': lesson = teachCountOn(p); break;
        case 'sub-10': case 'sub-20': lesson = teachTakeAway(p); break;
        case 'compare': lesson = teachCompare(p); break;
        case 'add-100': case 'add-1000': lesson = teachAdd(p); break;
        case 'sub-100': case 'sub-1000': lesson = teachSub(p); break;
        case 'equal-groups': case 'mult-facts': lesson = teachMult(p); break;
        case 'div-facts': lesson = teachDiv(p); break;
        default: return null;
      }
    }
    if (p.story) lesson.intro = `This story is really ${p.equation.replace(' = ?', '')}. ` + lesson.intro;
    lesson.steps.forEach((s) => {
      if (!s.choices) {
        const set = new Set([s.answer]);
        for (const c of shuffle([s.answer + 1, s.answer - 1, s.answer + 2, s.answer >= 20 ? s.answer + 10 : s.answer - 2])) {
          if (set.size >= 3) break;
          if (c >= 0) set.add(c);
        }
        s.choices = shuffle([...set]);
      }
    });
    return lesson;
  }

  return {
    SKILLS, MASTERY, LEVELS,
    pickSkill, weakestSkill, gradeSkills, stretchLevel, accuracy,
    make, twin, fromReview, tip, mistakeHint, teach,
  };
})();
