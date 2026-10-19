// Math problem generators. Grade: 0 = Kindergarten, 1-3 = Grades 1-3.
// Every problem is multiple choice: { text, visual?, answer, choices, explain }.
const MathGen = (() => {
  const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const THINGS = ['🍎', '⭐', '🐟', '🌸', '🍪', '🐞'];
  const row = (n, t) => t.repeat(n);

  // Wrong answers close to the right one, so guessing doesn't work.
  function numberChoices(ans, extra = []) {
    const set = new Set([ans]);
    const near = shuffle([ans + 1, ans - 1, ans + 2, ans - 2]);
    if (ans >= 10) near.push(...shuffle([ans + 10, ans - 10]));
    for (const n of [...extra, ...near]) {
      if (set.size >= 4) break;
      if (Number.isInteger(n) && n >= 0) set.add(n);
    }
    for (let k = 3; set.size < 4; k++) set.add(ans + k);
    return shuffle([...set]);
  }

  function problem(text, answer, explain, more = {}) {
    return { text, answer, explain, choices: more.choices || numberChoices(answer, more.extra), visual: more.visual };
  }

  const GEN = {
    add(g) {
      let a, b;
      if (g === 0) { a = r(1, 5); b = r(0, 5); }
      else if (g === 1) { a = r(2, 12); b = r(1, 20 - a); }
      else if (g === 2) { a = r(10, 79); b = r(5, 99 - a); }
      else { a = r(100, 700); b = r(20, 999 - a); }
      const t = pick(THINGS);
      return problem(`${a} + ${b} = ?`, a + b, `${a} + ${b} = ${a + b}`, {
        visual: g === 0 ? `${row(a, t)} + ${row(b, t)}` : null,
      });
    },

    sub(g) {
      let a, b;
      if (g === 0) { a = r(2, 10); b = r(1, a); }
      else if (g === 1) { a = r(5, 20); b = r(1, a); }
      else if (g === 2) { a = r(20, 99); b = r(5, a - 5); }
      else { a = r(200, 999); b = r(20, a - 50); }
      return problem(`${a} − ${b} = ?`, a - b, `${a} − ${b} = ${a - b}`, {
        visual: g === 0 ? row(a - b, pick(THINGS)) + row(b, '❌') : null,
      });
    },

    count(g) {
      if (g === 0) {
        if (Math.random() < 0.5) {
          const n = r(3, 10);
          return problem('How many?', n, `There are ${n}.`, { visual: row(n, pick(THINGS)) });
        }
        const n = r(1, 19);
        return problem(`What comes after ${n}?`, n + 1, `After ${n} comes ${n + 1}.`);
      }
      if (g === 1) {
        if (Math.random() < 0.5) {
          const n = r(20, 119);
          return problem(`What comes after ${n}?`, n + 1, `After ${n} comes ${n + 1}.`);
        }
        const n = r(10, 89);
        return problem(`What is 10 more than ${n}?`, n + 10, `10 more than ${n} is ${n + 10}.`, { extra: [n + 1] });
      }
      if (g === 2) {
        if (Math.random() < 0.5) {
          const n = r(100, 899);
          return problem(`What is 100 more than ${n}?`, n + 100, `100 more than ${n} is ${n + 100}.`, { extra: [n + 10, n - 100] });
        }
        const n = r(20, 999);
        return problem(`What is 10 less than ${n}?`, n - 10, `10 less than ${n} is ${n - 10}.`, { extra: [n - 1, n + 10] });
      }
      let n = r(11, 989);
      if (n % 10 === 0) n += 3;
      const ans = Math.round(n / 10) * 10;
      return problem(`Round ${n} to the nearest 10.`, ans, `${n} rounds to ${ans}.`, {
        choices: shuffle([...new Set([ans, ans + 10, ans - 10, n])].filter((x) => x >= 0).slice(0, 4)),
      });
    },

    compare(g) {
      // Kindergarten compares groups by "more" (K.CC.6); symbols start in Grade 1.
      if (g === 0) {
        const a = r(1, 9);
        let b = r(1, 9);
        if (b === a) b = a < 9 ? a + 1 : a - 1;
        const t = pick(THINGS);
        return {
          text: 'Which is more?',
          visual: `${row(a, t)}\n${row(b, t)}`,
          answer: Math.max(a, b),
          choices: [a, b],
          explain: `${Math.max(a, b)} is more than ${Math.min(a, b)}.`,
        };
      }
      let a, b, A, B;
      if (g === 3) {
        const x = r(2, 9), y = r(2, 9);
        a = x * y;
        b = Math.random() < 0.2 ? a : a + pick([-3, -2, -1, 1, 2, 3]);
        A = `${x} × ${y}`;
        B = `${b}`;
      } else {
        const max = [10, 99, 999][g];
        const min = [0, 10, 100][g];
        a = r(min, max);
        b = Math.random() < 0.15 ? a : r(min, max);
        A = `${a}`;
        B = `${b}`;
      }
      const sign = a > b ? '>' : a < b ? '<' : '=';
      const words = { '>': 'is more than', '<': 'is less than', '=': 'is the same as' }[sign];
      const why = g === 3 ? `${A} is ${a}. ${a} ${words} ${b}.` : `${A} ${words} ${B}.`;
      return { text: `${A}  ☐  ${B}`, answer: sign, choices: ['<', '=', '>'], explain: `${A} ${sign} ${B}. ${why}`, tag: 'Which sign goes in the box?' };
    },

    missing(g) {
      if (g === 0) {
        const a = r(0, 4), b = r(1, 5 - a);
        return problem(`${a} + ? = ${a + b}`, b, `${a} + ${b} = ${a + b}`);
      }
      if (g === 1) {
        const total = r(5, 20), a = r(1, total - 1), b = total - a;
        return Math.random() < 0.5
          ? problem(`${a} + ? = ${total}`, b, `${a} + ${b} = ${total}`)
          : problem(`? + ${a} = ${total}`, b, `${b} + ${a} = ${total}`);
      }
      if (g === 2) {
        const total = r(20, 100), a = r(5, total - 5), b = total - a;
        return Math.random() < 0.5
          ? problem(`${a} + ? = ${total}`, b, `${a} + ${b} = ${total}`)
          : problem(`${total} − ? = ${a}`, b, `${total} − ${b} = ${a}`);
      }
      const a = r(2, 10), b = r(2, 10);
      return Math.random() < 0.5
        ? problem(`? × ${b} = ${a * b}`, a, `${a} × ${b} = ${a * b}`)
        : problem(`${a * b} ÷ ${b} = ?`, a, `${a * b} ÷ ${b} = ${a}. Check: ${a} × ${b} = ${a * b}.`);
    },

    skip(g) {
      let step, start;
      if (g === 0) { step = pick([1, 10]); start = step === 1 ? r(1, 15) : 10 * r(0, 6); }
      else if (g === 1) { step = pick([2, 5, 10]); start = step * r(0, 8); }
      else if (g === 2) { step = pick([2, 5, 10, 100]); start = step * r(0, step === 100 ? 5 : 9); }
      else { step = pick([3, 4, 6, 25, 50]); start = step * r(0, 6); }
      const seq = [start, start + step, start + 2 * step];
      const ans = start + 3 * step;
      return problem(`${seq.join(', ')}, ?`, ans, `Count by ${step}s: ${seq.join(', ')}, ${ans}.`, {
        extra: [ans + 1, ans - 1, ans + step],
      });
    },

    place(g) {
      if (g === 0) {
        const n = r(1, 9);
        return problem(`10 + ${n} = ?`, 10 + n, `10 and ${n} more is ${10 + n}.`, { visual: `🔟 + ${row(n, '🔹')}` });
      }
      if (g === 1) {
        const t = r(1, 9), o = r(0, 9), ans = 10 * t + o;
        return problem(`${t} tens and ${o} ones = ?`, ans, `${t} tens is ${10 * t}. Add ${o} ones to get ${ans}.`, {
          extra: [10 * o + t, ans + 10],
        });
      }
      if (g === 2) {
        const h = r(1, 9), t = r(0, 9), o = r(0, 9), ans = 100 * h + 10 * t + o;
        return problem(`${h} hundreds, ${t} tens, ${o} ones = ?`, ans, `${100 * h} + ${10 * t} + ${o} = ${ans}`, {
          extra: [100 * h + 10 * o + t, ans + 100, ans + 10],
        });
      }
      let n = r(101, 989);
      if (n % 100 === 0) n += 7;
      const ans = Math.round(n / 100) * 100;
      return problem(`Round ${n} to the nearest 100.`, ans, `${n} rounds to ${ans}.`, {
        choices: shuffle([...new Set([ans, ans + 100, ans - 100, Math.round(n / 10) * 10])].filter((x) => x >= 0).slice(0, 4)),
      });
    },

    double(g) {
      if (g === 0) {
        const n = r(1, 5), t = pick(THINGS);
        return problem(`${n} + ${n} = ?`, 2 * n, `Double ${n} is ${2 * n}.`, { visual: `${row(n, t)} + ${row(n, t)}` });
      }
      if (g === 1) {
        const n = r(1, 10);
        return Math.random() < 0.6
          ? problem(`${n} + ${n} = ?`, 2 * n, `Double ${n} is ${2 * n}.`)
          : problem(`${n} + ${n + 1} = ?`, 2 * n + 1, `${n} + ${n} is ${2 * n}. One more is ${2 * n + 1}.`);
      }
      if (g === 2) {
        const n = r(11, 50);
        return problem(`Double ${n} = ?`, 2 * n, `${n} + ${n} = ${2 * n}`);
      }
      if (Math.random() < 0.5) {
        const n = 2 * r(6, 50);
        return problem(`Half of ${n} = ?`, n / 2, `${n / 2} + ${n / 2} = ${n}`, { extra: [n / 2 + 1, n - 2] });
      }
      const n = r(25, 250);
      return problem(`Double ${n} = ?`, 2 * n, `${n} + ${n} = ${2 * n}`);
    },

    mult(g) {
      const t = pick(THINGS);
      if (g === 0) {
        const groups = r(2, 3), size = r(1, 2);
        return problem(`${groups} groups of ${size} = ?`, groups * size, `${Array(groups).fill(size).join(' + ')} = ${groups * size}`, {
          visual: Array(groups).fill(row(size, t)).join('   '),
        });
      }
      if (g === 1) {
        const groups = r(2, 3), size = r(2, 5);
        return problem(`${Array(groups).fill(size).join(' + ')} = ?`, groups * size, `${groups} groups of ${size} = ${groups * size}`);
      }
      if (g === 2) {
        const rows = r(2, 5), cols = r(2, 5);
        return problem(`${rows} rows of ${cols} = ?`, rows * cols, `${Array(rows).fill(cols).join(' + ')} = ${rows * cols}`, {
          visual: Array(rows).fill(row(cols, t)).join('\n'),
          extra: [rows + cols],
        });
      }
      const a = r(2, 10), b = r(2, 10);
      return problem(`${a} × ${b} = ?`, a * b, `${a} × ${b} = ${a * b}`, { extra: [a * (b + 1), a * (b - 1), a + b] });
    },
  };

  function make(topic, grade) {
    const g = Math.max(0, Math.min(3, grade | 0));
    const p = (GEN[topic] || GEN.add)(g);
    p.topic = topic;
    return p;
  }

  return { make, topics: Object.keys(GEN) };
})();
