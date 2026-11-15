// Hint-path checks. Open the game with ?dev&handheld (controller mode), keep the
// browser window visible (hidden tabs slow their timers down), then in the console:
//   await import('./tools/flow-qc.js'); await flowQC();
// For every skill at its own grade it presses A the moment a choice question
// appears (that must not answer it), answers wrong (twice, or once on a
// two-choice question, which is then a miss), opens Teach me and works through
// the lesson: typed steps get three wrong answers before the right one, choice
// steps get every wrong choice picked first. None of that may finish a step.
// Then it solves the "Your turn" problem. Also checks the try-first rule.
window.flowQC = async function () {
  const press = (k) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tap = (el) => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  const ui = () => document.querySelector('#ui').innerText;
  const visibleIn = (el, box) => { const a = el.getBoundingClientRect(), b = box.getBoundingClientRect(); return a.top >= b.top - 1 && a.bottom <= b.bottom + 1; };
  const E = MQL.MathEngine;
  const valOf = (b) => Number(b.textContent.replace(/,/g, ''));
  const typeIn = (v) => { for (const d of String(v)) press(d); press('Enter'); };
  const bubble = () => { const b = document.querySelector('.quiz .bubble span'); return b ? b.textContent : ''; };
  const answered = () => !!document.querySelector('.quiz .ans.right, .quiz .ans.wrong, .quiz .entry.right, .quiz .entry.wrong');
  let S = MQL.testState(0);
  const issues = [], log = [];
  if (!document.querySelector('.console').classList.contains('handheld')) issues.push('Not in controller mode: open the game with ?dev&handheld');
  const fresh = (grade) => { S = MQL.testState(grade); S.grade = grade; };

  async function answerWrong(p) {
    if (document.querySelector('.quiz .entry')) {
      typeIn(p.choices.find((c) => c !== p.answer));
    } else {
      const b = [...document.querySelectorAll('.quiz .ans')].find((x) => !x.disabled && valOf(x) !== p.answer);
      if (!b) return false;
      tap(b);
    }
    await wait(1400);
    return true;
  }
  function answerRight(p) {
    if (document.querySelector('.quiz .entry')) typeIn(p.answer);
    else tap([...document.querySelectorAll('.quiz .ans')].find((x) => valOf(x) === p.answer));
  }

  // Works through an open lesson, trying to finish each step without the right answer first.
  async function lessonSteps(skill, grade, box, p) {
    let steps = 0;
    // The game shows the lesson it's on as MQL.lesson; without it, rebuild the same lesson.
    const fallback = MQL.lesson ? null : E.teach(p, 0);
    for (let guard = 0; guard < 30 && document.body.contains(box); guard++) {
      const cur = MQL.lesson || { lesson: fallback, step: steps };
      const s = cur.lesson.steps[cur.step];
      const next = box.querySelector('.hintbtn');
      const entry = box.querySelector('.entry');
      const note = () => (box.querySelector('.note') || {}).textContent || '';
      const shown = E.show(s.answer);
      if (entry) {
        for (let k = 0; k < 3; k++) {
          typeIn(s.answer + 1);
          await wait(250);
          if (!next.hidden) { issues.push(`${skill}: a wrong typed answer finished step ${steps}`); break; }
          if (k === 1 && !note().includes(shown)) issues.push(`${skill}: two misses on step ${steps} didn't show the answer (${note()})`);
        }
        if (!visibleIn(box.querySelector('.prompt'), box) || !visibleIn(entry, box)) issues.push(`${skill}: prompt or entry out of view in step ${steps}`);
        typeIn(s.answer);
      } else {
        const btns = [...box.querySelectorAll('.ans')];
        if (grade > 0 && btns.length > 2) issues.push(`${skill}: step ${steps} is picked from ${btns.length} choices, not typed ("${s.prompt}")`);
        for (let round = 0; round < 3; round++) {
          for (const b of btns.filter((x) => valOf(x) !== s.answer)) { tap(b); await wait(120); }
        }
        if (!next.hidden) issues.push(`${skill}: picking only wrong choices finished step ${steps}`);
        if (btns.length > 2 && btns.some((b) => b.disabled && b.classList.contains('wrong'))) issues.push(`${skill}: wrong choices drop out, so the last one left is right (step ${steps})`);
        if (!note().includes(shown)) issues.push(`${skill}: a wrong pick on step ${steps} didn't show the answer (${note()})`);
        await wait(1000);
        const right = [...box.querySelectorAll('.ans')].find((b) => valOf(b) === s.answer);
        if (right) tap(right);
      }
      await wait(250);
      if (next.hidden) { issues.push(`${skill}: the right answer didn't finish step ${steps}`); break; }
      await wait(350); // let it scroll into view
      if (!visibleIn(next, box)) issues.push(`${skill}: Next button out of view in step ${steps}`);
      tap(next);
      steps++;
      await wait(250);
    }
    return steps;
  }

  // Every skill at its own grade.
  const cases = E.LEVELS.flatMap((_, g) => E.gradeSkills(g).map((s) => [s, g]));
  for (const [skill, grade] of cases) {
    fresh(grade);
    const p = E.make(skill, grade, {});
    const done = MQL.ask(p);
    const typing = !!document.querySelector('.quiz .entry');
    if (!typing) {
      press('z'); // A the moment the question appears
      await wait(40);
      if (answered()) issues.push(`${skill}: A pressed at 0 ms answered the question`);
    }
    await wait(650);
    if (!typing) {
      press('z'); // A with nothing picked yet (controller mode)
      await wait(60);
      if (answered()) issues.push(`${skill}: A with nothing selected answered the question`);
    }
    if (!answered()) await answerWrong(p);
    const two = p.choices.length === 2 && !typing;
    if (two) {
      if (!/Here's the answer/.test(ui())) issues.push(`${skill}: a wrong pick on a two-choice question isn't a miss`);
    } else {
      if (!/\S/.test(bubble())) issues.push(`${skill}: no hint after the first miss`);
      await answerWrong(p);
      if (!/Here's the answer/.test(ui())) issues.push(`${skill}: answer not shown after two misses`);
    }
    press('z'); // A = Teach me
    await wait(500);
    const box = document.querySelector('.teach');
    let steps = 0;
    if (!box) issues.push(`${skill}: Teach me didn't open`);
    else steps = await lessonSteps(skill, grade, box, p);
    // "Which trick" (asked again after a wrong pick), the "Your turn!" line, then the twin problem.
    let askedTrick = false;
    for (let i = 0; i < 12 && !document.querySelector('.quiz'); i++) {
      if (/Which trick/.test(ui())) askedTrick = true;
      press('z'); await wait(350);
    }
    const twin = MQL.problem;
    if (grade > 0 && !askedTrick) issues.push(`${skill}: no "Which trick" question`);
    if (!document.querySelector('.quiz') || twin === p) issues.push(`${skill}: no "Your turn" problem`);
    else { await wait(600); answerRight(twin); }
    const r = await Promise.race([done, wait(4000).then(() => null)]);
    if (!r) issues.push(`${skill}: question never finished`);
    else if (r.result !== 'helped') issues.push(`${skill}: result ${r.result}, expected "helped"`);
    log.push(`${skill}: ${steps} lesson steps`);
    await wait(150);
  }

  // A wrong pick on a two-choice question, then OK: a miss.
  fresh(1);
  {
    const p = E.make('compare', 1, {});
    const done = MQL.ask(p);
    await wait(650);
    tap([...document.querySelectorAll('.quiz .ans')].find((x) => valOf(x) !== p.answer));
    await wait(900);
    press('x'); // B = OK
    const r = await Promise.race([done, wait(3000).then(() => null)]);
    if (!r || r.result !== 'miss') issues.push(`compare: a wrong pick then OK gave ${r ? r.result : 'nothing'}, expected "miss"`);
  }

  // Try first: after 5 lessons on a skill, Teach me waits for one try.
  fresh(1);
  {
    S.lessons = { 'add-20': 5 };
    S.lessonLog = { 'add-20': { opened: 5, shown: 0 } };
    const p = E.make('add-20', 1, {});
    MQL.ask(p);
    await wait(300);
    press('x'); await wait(300); press('x'); await wait(500); // Hint, then Teach me
    if (document.querySelector('.teach')) issues.push('try first: the 6th lesson opened before a try');
    else {
      if (!/try/i.test(bubble())) issues.push('try first: no "have one try" from the buddy');
      typeIn(p.choices.find((c) => c !== p.answer));
      await wait(1500);
      if (!document.querySelector('.teach')) issues.push('try first: a wrong try didn\'t open the lesson');
    }
  }
  MQL.testState(0);
  return { issues, log };
};
