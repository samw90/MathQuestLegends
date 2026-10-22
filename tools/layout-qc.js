// Layout checks for the question screen. Open the game with ?dev, then in the console:
//   await import('./tools/layout-qc.js'); await layoutQC();
// It shows the hardest questions (long stories, big pictures, open hint) and reports
// anything pushed off screen. Try it at phone and tablet sizes, upright and sideways.
window.layoutQC = async function () {
  const press = (k) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const E = MQL.MathEngine;
  const S = MQL.testState(0);
  const issues = [];
  const vw = innerWidth, vh = innerHeight;
  if (document.documentElement.scrollWidth > vw + 1) issues.push(`page scrolls sideways (${document.documentElement.scrollWidth} > ${vw})`);
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= -1 && r.right <= vw + 1 && r.top >= -1 && r.bottom <= vh + 1; };
  const visibleIn = (el, box) => { const a = el.getBoundingClientRect(), b = box.getBoundingClientRect(); return a.top >= b.top - 1 && a.bottom <= b.bottom + 1; };
  const make = (skill, grade, want) => { for (let i = 0; i < 2000; i++) { const p = E.make(skill, grade, {}); if (want(p)) return p; } return E.make(skill, grade, {}); };
  const cases = [
    ['K ten-frame', 0, make('add-10', 0, (p) => p.a + p.b >= 9)],
    ['G1 take-away ten-frame', 1, make('sub-20', 1, (p) => p.a > 15)],
    ['G1 missing number', 1, make('add-20', 1, (p) => p.missing)],
    ['G1 compare', 1, make('compare', 1, () => true)],
    ['G2 adding story', 2, make('add-100', 2, (p) => p.story && p.a + p.b > 80)],
    ['G2 take-away story', 2, make('sub-100', 2, (p) => p.story && p.a > 80)],
    ['G3 sharing story', 3, make('div-facts', 3, (p) => p.story && p.visual.rows >= 9 && p.visual.cols >= 9)],
    ['G3 times 10x10', 3, make('mult-facts', 3, (p) => !p.story && p.a >= 9 && p.b >= 9)],
    ['G3 take-away story', 3, make('sub-1000', 3, (p) => p.story)],
    ['K counting', 0, make('count-10', 0, (p) => p.answer >= 8)],
    ['K pattern (number line)', 0, make('skip-10', 0, (p) => p.step === 10)],
    ['G3 rounding (number line)', 3, make('round', 3, (p) => p.b === 100)],
    ['G4 rounding big numbers', 4, make('round-big', 4, (p) => p.b === 1000)],
    ['G4 equal fractions (bars)', 4, make('equiv-frac', 4, (p) => p.d >= 10)],
    ['G4 multiplying story', 4, make('mult-1digit', 4, (p) => p.story)],
    ['G5 adding decimals', 5, make('dec-add', 5, () => true)],
    ['G5 adding fractions (bars)', 5, make('frac-add', 5, (p) => p.d >= 12)],
    ['G5 decimal compare', 5, make('dec-place', 5, (p) => p.op === 'or')],
  ];
  for (const [name, grade, p] of cases) {
    S.grade = grade;
    const done = MQL.ask(p);
    await wait(350);
    const box = document.querySelector('.quiz');
    press('x'); // open the hint (X is the B button): tip, picture and bubble
    await wait(450);
    if (box.querySelector('.bubble').hidden) issues.push(`${name}: the hint didn't open`);
    const typing = !!box.querySelector('.entry');
    const target = typing ? box.querySelector('.entry') : box.querySelector('.answers');
    if (!visibleIn(target, box)) issues.push(`${name}: answer ${typing ? 'box' : 'buttons'} out of view after the hint`);
    const hb = box.querySelector('.hintbtn');
    if (hb && !visibleIn(hb, box)) issues.push(`${name}: Teach me button out of view after the hint`);
    if (box.scrollHeight > box.clientHeight + 6) issues.push(`${name}: needs scrolling (${box.scrollHeight} > ${box.clientHeight})`);
    if (!inView(box)) issues.push(`${name}: question box off screen`);
    if (typing) {
      for (const k of document.querySelectorAll('.keypad .key')) if (k.offsetParent && !inView(k)) { issues.push(`${name}: keypad off screen`); break; }
      if (p.dec && document.querySelector('.keypad .key.dot').offsetParent === null) issues.push(`${name}: no decimal point key`);
      for (const d of String(p.answer)) press(d);
      press('Enter');
    } else {
      const btns = [...box.querySelectorAll('.ans')];
      if (btns.some((b) => !inView(b))) issues.push(`${name}: answer button off screen`);
      btns.find((b) => Number(b.textContent.replace(/,/g, '')) === p.answer).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    }
    await done;
    await wait(150);
  }
  for (const b of document.querySelectorAll('.pad button, .start')) {
    if (b.offsetParent && !inView(b)) issues.push(`control ${b.dataset.btn} off screen`); // hidden in controller mode
  }
  return { size: `${vw}x${vh}`, side: document.querySelector('.console').classList.contains('side'), issues };
};
