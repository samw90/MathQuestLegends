// Hint-path checks. Open the game with ?dev, then in the console:
//   await import('./tools/flow-qc.js'); await flowQC();
// For one skill per grade it answers wrong twice, opens Teach me, works through the
// lesson (including a wrong pick), then solves the "Your turn" problem.
window.flowQC = async function () {
  const press = (k) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tap = (el) => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  const ui = () => document.querySelector('#ui').innerText;
  const visibleIn = (el, box) => { const a = el.getBoundingClientRect(), b = box.getBoundingClientRect(); return a.top >= b.top - 1 && a.bottom <= b.bottom + 1; };
  const S = MQL.testState(0);
  const issues = [], log = [];
  async function answerWrong(p, nth) {
    const wrongs = p.choices.filter((c) => c !== p.answer);
    if (document.querySelector('.quiz .entry')) {
      for (const d of String(wrongs[0])) press(d);
      press('Enter');
    } else {
      const b = [...document.querySelectorAll('.quiz .ans')].find((x) => !x.disabled && Number(x.textContent) !== p.answer);
      if (!b) return false; // two-choice question: no second wrong answer left
      tap(b);
    }
    await wait(nth === 0 ? 1400 : 1200);
    return true;
  }
  async function answerRight(p) {
    if (document.querySelector('.quiz .entry')) { for (const d of String(p.answer)) press(d); press('Enter'); }
    else tap([...document.querySelectorAll('.quiz .ans')].find((x) => Number(x.textContent) === p.answer));
  }
  const cases = [['add-10', 0], ['sub-10', 0], ['add-20', 1], ['sub-20', 1], ['compare', 1], ['add-100', 2], ['sub-100', 2], ['equal-groups', 2], ['mult-facts', 3], ['div-facts', 3], ['add-1000', 3], ['sub-1000', 3]];
  for (const [skill, grade] of cases) {
    S.grade = grade;
    const p = MQL.MathEngine.make(skill, grade, {});
    const done = MQL.ask(p);
    await wait(300);
    await answerWrong(p, 0);
    if (!/\S/.test(document.querySelector('.quiz .bubble span').textContent)) issues.push(`${skill}: no hint after the first miss`);
    if (await answerWrong(p, 1)) {
      if (!/Here's the answer/.test(ui())) issues.push(`${skill}: answer not shown after two misses`);
      press('z'); // A = Teach me
    } else {
      press('x'); await wait(300); press('x'); // Hint, then Teach me
    }
    await wait(500);
    const box = document.querySelector('.teach');
    let steps = 0;
    if (!box) issues.push(`${skill}: Teach me didn't open`);
    else {
      for (let guard = 0; guard < 30 && document.body.contains(box); guard++) {
        const next = box.querySelector('.hintbtn');
        if (!next.hidden) {
          await wait(400); // let it scroll into view
          if (!visibleIn(next, box)) issues.push(`${skill}: Next button out of view in step ${steps}`);
          tap(next); steps++;
          await wait(250);
          continue;
        }
        const live = [...box.querySelectorAll('.ans')].filter((b) => !b.disabled);
        if (!live.length) { issues.push(`${skill}: lesson step has no choices left`); break; }
        tap(live[0]);
        await wait(200);
      }
    }
    // "Your turn!" line, then the twin problem.
    for (let i = 0; i < 6 && !document.querySelector('.quiz'); i++) { press('z'); await wait(350); }
    const twin = MQL.problem;
    if (!document.querySelector('.quiz') || twin === p) issues.push(`${skill}: no "Your turn" problem`);
    else await answerRight(twin);
    const r = await Promise.race([done, wait(4000).then(() => null)]);
    if (!r) issues.push(`${skill}: question never finished`);
    else if (r.result !== 'helped') issues.push(`${skill}: result ${r.result}, expected "helped"`);
    log.push(`${skill}: ${steps} lesson steps`);
    await wait(150);
  }
  return { issues, log };
};
