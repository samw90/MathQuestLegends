// Pixel art, all drawn in code at Game Boy scale (16px tiles on a 160x144
// screen). The canvas is scaled up with nearest-neighbour so it stays crisp.
const Art = (() => {
  const INK = '#2b2840';

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  // Tiny drawing kit. `s` scales every coordinate so creatures can be designed
  // on a 32-unit grid and rendered at 48px.
  function kit(c, s = 1) {
    const g = c.getContext('2d');
    const k = {
      g,
      rect(x, y, w, h, col) {
        g.fillStyle = col;
        const x0 = Math.round(x * s), y0 = Math.round(y * s);
        g.fillRect(x0, y0, Math.max(1, Math.round((x + w) * s) - x0), Math.max(1, Math.round((y + h) * s) - y0));
      },
      px(x, y, col) { k.rect(x, y, 1, 1, col); },
      // Filled ellipse; `only(ux, uy)` can restrict it to a pattern (stripes, grids).
      ell(cx, cy, rx, ry, col, only) {
        g.fillStyle = col;
        const X0 = Math.floor((cx - rx) * s), X1 = Math.ceil((cx + rx) * s);
        const Y0 = Math.floor((cy - ry) * s), Y1 = Math.ceil((cy + ry) * s);
        for (let y = Y0; y < Y1; y++) {
          for (let x = X0; x < X1; x++) {
            const ux = (x + 0.5) / s, uy = (y + 0.5) / s;
            const dx = ux - cx, dy = uy - cy;
            if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) > 1) continue;
            if (only && !only(ux, uy)) continue;
            g.fillRect(x, y, 1, 1);
          }
        }
      },
      tri(ax, ay, bx, by, cx, cy, col) {
        g.fillStyle = col;
        const side = (px, py, x1, y1, x2, y2) => (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
        const X0 = Math.floor(Math.min(ax, bx, cx) * s), X1 = Math.ceil(Math.max(ax, bx, cx) * s);
        const Y0 = Math.floor(Math.min(ay, by, cy) * s), Y1 = Math.ceil(Math.max(ay, by, cy) * s);
        for (let y = Y0; y < Y1; y++) {
          for (let x = X0; x < X1; x++) {
            const px = (x + 0.5) / s, py = (y + 0.5) / s;
            const d1 = side(px, py, ax, ay, bx, by), d2 = side(px, py, bx, by, cx, cy), d3 = side(px, py, cx, cy, ax, ay);
            const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
            if (!(neg && pos)) g.fillRect(x, y, 1, 1);
          }
        }
      },
    };
    return k;
  }

  // Adds a 1px dark outline around everything drawn on the canvas.
  function outline(c, col = INK) {
    const g = c.getContext('2d');
    const { width: w, height: h } = c;
    const d = g.getImageData(0, 0, w, h).data;
    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
    g.fillStyle = col;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) g.fillRect(x, y, 1, 1);
      }
    }
    return c;
  }

  function shade(hex, f = 0.75) {
    const n = parseInt(hex.slice(1), 16);
    const ch = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
    return '#' + [ch(n >> 16), ch((n >> 8) & 255), ch(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  // ---------------- tiles ----------------

  const GRASS = '#a3dc7a';

  function grass(k) {
    k.rect(0, 0, 16, 16, GRASS);
    for (const [x, y] of [[3, 3], [11, 2], [7, 9], [13, 12], [2, 12]]) k.rect(x, y, 1, 2, '#7cc35a');
  }
  function floor(k) {
    k.rect(0, 0, 16, 16, '#e2c08c');
    k.rect(0, 7, 16, 1, '#c9a26c');
    k.rect(0, 15, 16, 1, '#c9a26c');
    k.rect(5, 0, 1, 7, '#c9a26c');
    k.rect(12, 8, 1, 7, '#c9a26c');
  }
  function wall(k) {
    k.rect(0, 0, 16, 16, '#f6ecd4');
    k.rect(0, 0, 1, 16, '#e2d3b0');
    k.rect(8, 0, 1, 16, '#e2d3b0');
    k.rect(0, 14, 16, 2, '#c9b48a');
  }
  function roof(k, base, dark) {
    k.rect(0, 0, 16, 16, base);
    k.rect(0, 0, 16, 1, shade(base, 1.15));
    for (const y of [4, 8, 12]) k.rect(0, y, 16, 1, dark);
    for (let row = 0; row < 3; row++) {
      const off = row % 2 ? 4 : 0;
      for (let x = off; x < 16; x += 8) k.rect(x, row * 4 + 1, 1, 3, dark);
    }
    k.rect(0, 13, 16, 3, dark);
  }
  function gateway(k, right) {
    k.rect(0, 0, 16, 16, '#ead7a0');
    const x = right ? 11 : 0;
    k.rect(x, 0, 5, 16, '#8a8a9a');
    k.rect(x, 0, 5, 2, '#b4b4c4');
    k.rect(right ? x : x + 4, 0, 1, 16, '#6a6a7a');
    for (const y of [5, 10]) k.rect(x, y, 5, 1, '#6a6a7a');
  }
  function sand(k) {
    k.rect(0, 0, 16, 16, '#f2dc9a');
    for (const [x, y] of [[3, 4], [11, 2], [7, 11], [13, 13], [2, 13]]) k.px(x, y, '#d8be78');
    for (const [x, y] of [[6, 7], [14, 8], [9, 3]]) k.px(x, y, '#fff2c8');
  }
  function dirt(k) {
    k.rect(0, 0, 16, 16, '#e2a46e');
    for (const [x, y] of [[3, 4], [11, 2], [7, 11], [13, 13], [2, 13]]) k.rect(x, y, 2, 1, '#c8844e');
    for (const [x, y] of [[6, 7], [14, 8]]) k.px(x, y, '#f0bc88');
  }
  function snow(k) {
    k.rect(0, 0, 16, 16, '#f4f8ff');
    for (const [x, y] of [[3, 4], [11, 2], [7, 11], [13, 13], [2, 13]]) k.px(x, y, '#d0dcef');
  }
  function logWall(k) {
    k.rect(0, 0, 16, 16, '#9a6438');
    for (const y of [3, 7, 11, 15]) k.rect(0, y, 16, 1, '#6a4020');
    k.px(2, 1, '#b8804a'); k.px(10, 5, '#b8804a'); k.px(5, 9, '#b8804a'); k.px(13, 13, '#b8804a');
  }
  function tentTop(k) {
    for (let x = 0; x < 16; x += 4) { k.rect(x, 0, 2, 16, '#e8506a'); k.rect(x + 2, 0, 2, 16, '#f6e8e8'); }
    k.rect(0, 14, 16, 2, '#a8324a');
  }
  function tentSide(k) {
    for (let x = 0; x < 16; x += 4) { k.rect(x, 0, 2, 16, '#d84a62'); k.rect(x + 2, 0, 2, 16, '#ece0e0'); }
    k.rect(0, 15, 16, 1, '#8a2a3a');
  }
  function towerTop(k) {
    stoneWall(k);
    k.rect(0, 0, 16, 4, '#4a4a5a');
    k.rect(0, 0, 4, 4, '#9a9aaa'); k.rect(8, 0, 4, 4, '#9a9aaa');
    k.rect(4, 2, 4, 2, '#7a7a8a'); k.rect(12, 2, 4, 2, '#7a7a8a');
    k.rect(0, 4, 16, 1, '#5a5a6a');
  }
  function stoneWall(k) {
    k.rect(0, 0, 16, 16, '#9a9aaa');
    for (const y of [4, 9, 14]) k.rect(0, y, 16, 1, '#6a6a7a');
    for (const [x, y] of [[5, 0], [12, 0], [2, 5], [9, 5], [6, 10], [13, 10]]) k.rect(x, y, 1, 4, '#6a6a7a');
    k.px(3, 2, '#b8b8c8'); k.px(10, 7, '#b8b8c8');
  }
  function domeTop(k) {
    k.rect(0, 0, 16, 16, '#3a6ab8');
    for (let x = 0; x < 16; x += 8) { k.ell(x + 4, 16, 4, 6, '#4a7ad0'); k.ell(x + 4, 16, 2.5, 4, '#3a6ab8'); }
    k.rect(0, 0, 16, 2, '#5a8ae0'); k.rect(0, 14, 16, 2, '#26457a');
  }
  function marbleWall(k) {
    k.rect(0, 0, 16, 16, '#f4f0ea');
    k.rect(1, 0, 3, 16, '#e4ddd2'); k.rect(12, 0, 3, 16, '#e4ddd2');
    k.rect(0, 0, 16, 2, '#d8d0c4'); k.rect(0, 14, 16, 2, '#c8bca8');
  }
  function sidewalk(k) {
    k.rect(0, 0, 16, 16, '#c8c8d0');
    k.rect(0, 7, 16, 1, '#a8a8b4'); k.rect(7, 0, 1, 16, '#a8a8b4'); k.rect(0, 15, 16, 1, '#a8a8b4'); k.rect(15, 0, 1, 16, '#a8a8b4');
  }
  function brick(k) {
    k.rect(0, 0, 16, 16, '#b85a3a');
    for (const y of [3, 7, 11, 15]) k.rect(0, y, 16, 1, '#8a3a2a');
    for (const [x, y] of [[4, 0], [12, 0], [0, 4], [8, 4], [4, 8], [12, 8], [0, 12], [8, 12]]) k.rect(x, y, 1, 3, '#8a3a2a');
  }
  function roofGravel(k) {
    k.rect(0, 0, 16, 16, '#9a9aa8');
    for (const [x, y] of [[2, 3], [7, 1], [12, 5], [4, 9], [10, 11], [14, 14], [1, 14]]) k.px(x, y, '#7a7a8a');
    k.px(6, 6, '#b8b8c4'); k.px(13, 9, '#b8b8c4');
  }
  function subwayTile(k) {
    k.rect(0, 0, 16, 16, '#d8dce4');
    k.rect(0, 7, 16, 1, '#b8bcc8'); k.rect(7, 0, 1, 16, '#b8bcc8');
    k.px(3, 3, '#eef0f4'); k.px(11, 11, '#eef0f4');
  }
  function dock(k) {
    k.rect(0, 0, 16, 16, '#b88a5a');
    for (const y of [3, 7, 11, 15]) k.rect(0, y, 16, 1, '#8a5a32');
    k.px(4, 1, '#d8a46a'); k.px(11, 9, '#d8a46a');
  }
  function cobble(k) {
    k.rect(0, 0, 16, 16, '#c8b89a');
    for (const [x, y] of [[0, 0], [8, 0], [4, 5], [12, 5], [0, 10], [8, 10]]) { k.rect(x, y, 7, 4, '#d8caae'); k.rect(x, y + 4, 7, 1, '#a8957a'); }
  }
  function seaSand(k) {
    k.rect(0, 0, 16, 16, '#e4d4a4');
    k.px(3, 5, '#d0bc88'); k.px(12, 3, '#d0bc88'); k.px(7, 12, '#d0bc88');
    k.ell(13, 11, 1, 1, '#c8e8f8'); k.px(2, 14, '#f4ead0');
  }
  function shipDeck(k) {
    k.rect(0, 0, 16, 16, '#8a6a4a');
    for (const x of [3, 7, 11, 15]) k.rect(x, 0, 1, 16, '#5a4028');
    k.px(5, 4, '#a8885a'); k.px(13, 10, '#a8885a'); k.ell(9, 13, 1, 1, '#c8e8f8');
  }
  function trenchFloor(k) {
    k.rect(0, 0, 16, 16, '#2a3448');
    k.px(4, 4, '#3a4660'); k.px(11, 9, '#3a4660'); k.px(7, 13, '#3a4660'); k.px(13, 2, '#5fd8e8');
  }
  function templeFloor(k) {
    k.rect(0, 0, 16, 16, '#a8bcc4');
    k.rect(0, 7, 16, 1, '#8aa0aa'); k.rect(7, 0, 1, 7, '#8aa0aa'); k.rect(12, 8, 1, 8, '#8aa0aa');
    k.px(3, 3, '#c4d4da'); k.ell(13, 4, 1, 1, '#c8e8f8');
  }
  function cloudFloor(k) {
    k.rect(0, 0, 16, 16, '#f4f8ff');
    k.ell(4, 4, 4, 2.5, '#e4ecfa'); k.ell(12, 11, 4, 2.5, '#e4ecfa'); k.px(9, 5, '#d4def4');
  }
  function skyGrass(k) {
    k.rect(0, 0, 16, 16, '#9ad47a');
    k.px(3, 4, '#86c068'); k.px(11, 9, '#86c068'); k.px(6, 13, '#b4e494'); k.px(13, 3, '#b4e494');
  }
  function stormCloud(k) {
    k.rect(0, 0, 16, 16, '#5a5a78');
    k.ell(4, 5, 4, 2.5, '#6a6a88'); k.ell(12, 12, 4, 2.5, '#6a6a88'); k.px(9, 8, '#4a4a68');
  }
  function castleFloor(k) {
    k.rect(0, 0, 16, 16, '#ece6f8');
    k.rect(0, 7, 16, 1, '#c8bce4'); k.rect(7, 0, 1, 7, '#c8bce4'); k.rect(12, 8, 1, 8, '#c8bce4');
    k.px(3, 3, '#fff'); k.px(10, 12, '#fff');
  }
  function forestFloor(k) {
    k.rect(0, 0, 16, 16, '#5a9a48');
    k.px(3, 4, '#4a8a3c'); k.px(11, 2, '#4a8a3c'); k.px(7, 10, '#4a8a3c'); k.px(13, 13, '#4a8a3c');
    k.rect(9, 6, 2, 1, '#a8783a'); k.px(2, 12, '#c8a050');
  }
  function deck(k) {
    k.rect(0, 0, 16, 16, '#c89a5a');
    for (const y of [3, 7, 11, 15]) k.rect(0, y, 16, 1, '#a0703a');
    k.px(5, 1, '#dcb070'); k.px(12, 9, '#dcb070');
  }
  function wetStone(k) {
    k.rect(0, 0, 16, 16, '#8a9aa8');
    k.rect(0, 8, 16, 1, '#7a8a98'); k.rect(6, 0, 1, 8, '#7a8a98'); k.rect(12, 8, 1, 8, '#7a8a98');
    k.px(2, 3, '#a8b8c4'); k.px(10, 12, '#a8b8c4');
  }
  function caveFloor(k) {
    k.rect(0, 0, 16, 16, '#4a3e5e');
    for (const [x, y] of [[3, 4], [11, 2], [7, 11], [13, 13], [2, 13]]) k.rect(x, y, 2, 1, '#3a3050');
    for (const [x, y] of [[6, 7], [14, 8]]) k.px(x, y, '#5e5076');
  }
  function table(k) {
    floor(k);
    k.rect(0, 2, 16, 12, '#7a4a2a');
    k.rect(0, 2, 16, 9, '#b07a45');
    k.rect(0, 2, 16, 1, '#d09a60');
  }
  function orb(k, col) {
    table(k);
    k.ell(8, 6.5, 4.6, 4.6, INK);
    k.ell(8, 6.5, 3.8, 3.8, col);
    k.rect(7.5, 4.5, 1, 4, '#fff');
    k.rect(6, 6, 4, 1, '#fff');
  }

  const TILE_DRAW = {
    '.': grass,
    ',': (k) => {
      k.rect(0, 0, 16, 16, '#5aa845');
      for (const [x, y] of [[0, 1], [8, 1], [4, 6], [12, 6], [0, 11], [8, 11]]) {
        k.rect(x + 1, y + 1, 1, 4, '#2f7a2f');
        k.rect(x + 3, y, 1, 5, '#2f7a2f');
        k.rect(x + 5, y + 1, 1, 4, '#2f7a2f');
        k.px(x + 2, y + 2, '#8fdc6a');
        k.px(x + 4, y + 1, '#8fdc6a');
      }
    },
    f: (k) => {
      grass(k);
      const flower = (x, y, col) => {
        k.px(x, y - 1, col); k.px(x - 1, y, col); k.px(x + 1, y, col); k.px(x, y + 1, col);
        k.px(x, y, '#ffd23c');
      };
      flower(4, 4, '#f05a6a');
      flower(11, 10, '#ffffff');
      flower(12, 3, '#f05a6a');
    },
    '=': (k) => {
      k.rect(0, 0, 16, 16, '#ead7a0');
      for (const [x, y] of [[2, 3], [10, 5], [6, 11], [13, 13]]) k.px(x, y, '#d1b97c');
      for (const [x, y] of [[5, 6], [12, 1], [3, 14]]) k.px(x, y, '#f6e8bf');
    },
    T: (k) => {
      k.rect(0, 0, 16, 16, GRASS);
      k.rect(6, 11, 4, 5, '#7a4a2a');
      k.rect(6, 15, 4, 1, '#5a3418');
      k.ell(8, 6.5, 7.5, 6.5, '#256b30');
      k.ell(7.5, 6, 6.2, 5.4, '#3f9a44');
      k.ell(5.5, 4, 2.6, 2, '#6cc05a');
    },
    '~': (k) => {
      k.rect(0, 0, 16, 16, '#5cb3e6');
      k.rect(2, 3, 4, 1, '#bfe8ff');
      k.rect(10, 7, 4, 1, '#bfe8ff');
      k.rect(4, 12, 5, 1, '#bfe8ff');
      k.rect(0, 15, 16, 1, '#4a9ad0');
    },
    s: (k) => {
      grass(k);
      k.rect(7, 10, 2, 5, '#6b4423');
      k.rect(2, 2, 12, 9, '#6b4423');
      k.rect(3, 3, 10, 7, '#c98d52');
      k.rect(4, 5, 8, 1, '#8a5a32');
      k.rect(4, 7, 6, 1, '#8a5a32');
    },
    // A stone gateway to the next area: g is the left half, G the right half.
    g: (k) => gateway(k, false),
    G: (k) => gateway(k, true),
    r: (k) => roof(k, '#c0504d', '#8e3433'),
    R: (k) => roof(k, '#5a7bbf', '#3e5b94'),
    C: (k) => roof(k, '#e86a8a', '#b8405e'),
    V: (k) => roof(k, '#7a5ad8', '#4e3a9a'),
    j: (k) => {
      k.rect(0, 0, 16, 16, '#cfc8e0');
      k.rect(0, 0, 16, 1, '#b4abcc'); k.rect(0, 8, 16, 1, '#b4abcc');
      k.rect(0, 0, 1, 8, '#b4abcc'); k.rect(8, 8, 1, 8, '#b4abcc');
      k.px(4, 4, '#e4def0'); k.px(12, 12, '#e4def0');
    },
    w: wall,
    W: (k) => {
      wall(k);
      k.rect(3, 3, 10, 8, '#5a4030');
      k.rect(4, 4, 8, 6, '#8fd3f7');
      k.rect(4, 4, 3, 2, '#d4f1ff');
      k.rect(7, 4, 1, 6, '#5a4030');
      k.rect(4, 7, 8, 1, '#5a4030');
    },
    // ---------- Brightport City
    'α': sidewalk,
    'δ': (k) => { k.rect(0, 0, 16, 16, '#7cc060'); k.px(3, 4, '#6aac50'); k.px(11, 9, '#6aac50'); k.px(6, 13, '#9ad47a'); },
    'ε': (k) => {
      k.rect(0, 0, 16, 16, '#7cc060');
      k.ell(4, 10, 4, 4, '#3f8f3a'); k.ell(12, 10, 4, 4, '#3f8f3a'); k.ell(8, 7, 4, 4, '#4fa84a');
      for (const [x, y, c] of [[3, 8, '#e8506a'], [8, 5, '#f2c84b'], [12, 9, '#e86ab8'], [6, 11, '#fff']]) k.px(x, y, c);
    },
    'ζ': (k) => {
      sidewalk(k);
      k.rect(3, 11, 10, 5, '#9a6a4a'); k.rect(3, 11, 10, 1, '#b8885a');
      k.ell(8, 7, 6, 6, '#3f8f3a'); k.ell(6, 5, 3, 3, '#5fb84a');
    },
    'η': (k) => {
      k.rect(0, 0, 16, 16, '#7cc060');
      k.ell(8, 10, 7.5, 5, '#a8a8b8'); k.ell(8, 10, 6, 3.6, '#6ab8f0');
      k.rect(7, 2, 2, 8, '#a8a8b8'); k.ell(8, 2, 3, 1.5, '#d4f1ff'); k.px(5, 4, '#d4f1ff'); k.px(11, 4, '#d4f1ff');
    },
    'θ': (k) => {
      sidewalk(k);
      k.rect(1, 6, 14, 3, '#a0703a'); k.rect(1, 10, 14, 2, '#a0703a');
      k.rect(2, 12, 2, 3, '#3a3a4a'); k.rect(12, 12, 2, 3, '#3a3a4a');
    },
    'ι': brick,
    'κ': (k) => { brick(k); k.rect(3, 3, 10, 8, '#3a3a4a'); k.rect(4, 4, 8, 6, '#f2d88a'); k.rect(7, 4, 1, 6, '#3a3a4a'); },
    'λ': roofGravel,
    'μ': (k) => {
      roofGravel(k);
      k.rect(2, 4, 12, 10, '#c8ccd8'); k.rect(2, 4, 12, 1, '#e4e8f0');
      k.ell(8, 9, 4, 4, '#6a6a7a'); k.rect(8, 6, 1, 6, '#a8a8b8'); k.rect(5, 9, 6, 1, '#a8a8b8');
    },
    'ν': (k) => {
      roofGravel(k);
      k.rect(1, 9, 14, 6, '#8a5a32');
      k.ell(4, 8, 3, 3, '#4fa84a'); k.ell(9, 7, 3.5, 3.5, '#5fb84a'); k.ell(13, 8, 2.5, 3, '#4fa84a');
      k.px(9, 5, '#e8506a'); k.px(4, 6, '#f2c84b');
    },
    'ξ': subwayTile,
    'ο': (k) => {
      k.rect(0, 0, 16, 16, '#3a3440');
      for (let y = 1; y < 16; y += 4) k.rect(0, y, 16, 2, '#6a4a32');
      k.rect(3, 0, 1, 16, '#a8a8b8'); k.rect(12, 0, 1, 16, '#a8a8b8');
    },
    'σ': (k) => { subwayTile(k); k.rect(0, 0, 16, 2, '#f2c84b'); k.rect(0, 14, 16, 2, '#f2c84b'); },
    'τ': (k) => {
      subwayTile(k);
      k.ell(6, 10, 5, 3, '#6a7aa0'); k.ell(11, 5, 3.5, 2, '#6a7aa0'); k.px(5, 9, '#c8d4f0'); k.px(11, 4, '#c8d4f0');
    },
    'υ': dock,
    'φ': (k) => {
      k.rect(0, 0, 16, 16, '#2a6aa8');
      k.rect(2, 4, 5, 1, '#5a9ad8'); k.rect(9, 9, 5, 1, '#5a9ad8'); k.rect(4, 13, 4, 1, '#5a9ad8');
    },
    'χ': (k) => {
      dock(k);
      k.rect(2, 3, 12, 12, '#b8844a'); k.rect(2, 3, 12, 1, '#d8a46a');
      k.rect(2, 3, 1, 12, '#7a4a22'); k.rect(13, 3, 1, 12, '#7a4a22'); k.rect(2, 14, 12, 1, '#7a4a22');
      k.rect(3, 4, 10, 1, '#7a4a22'); k.rect(7, 4, 2, 10, '#7a4a22');
    },
    'ψ': (k) => {
      dock(k);
      for (let i = 1; i < 16; i += 3) { k.rect(i, 2, 1, 12, '#c8b888'); k.rect(1, i, 14, 1, '#c8b888'); }
      k.ell(12, 12, 2, 2, '#e8702a');
    },
    'Γ': cobble,
    'Δ': (k) => {
      k.rect(0, 0, 16, 16, '#b8a88a');
      for (const y of [5, 11]) k.rect(0, y, 16, 1, '#8a7a5a');
      k.rect(4, 0, 1, 5, '#8a7a5a'); k.rect(11, 6, 1, 5, '#8a7a5a'); k.rect(6, 12, 1, 4, '#8a7a5a');
      k.px(2, 2, '#d8c8aa'); k.px(9, 8, '#d8c8aa');
    },
    'Λ': (k) => {
      cobble(k);
      k.ell(5, 9, 4, 4, '#3f8f3a'); k.ell(11, 7, 4, 4, '#4fa84a'); k.ell(8, 12, 3, 3, '#3f8f3a');
      k.px(4, 8, '#7ccf5a'); k.px(12, 6, '#7ccf5a');
    },
    'Ξ': (k) => {
      cobble(k);
      k.rect(7, 4, 2, 11, '#2b2840'); k.rect(5, 14, 6, 2, '#2b2840');
      k.rect(5, 1, 6, 4, '#2b2840'); k.rect(6, 2, 4, 2, '#f2d88a');
    },

    // ---------- Coral Deep
    '§': seaSand,
    'ð': (k) => { seaSand(k); k.rect(0, 0, 16, 16, '#f0dca8'); k.px(4, 4, '#e0c890'); k.px(11, 11, '#e0c890'); k.px(8, 2, '#c8e8f8'); },
    '¢': (k) => {
      seaSand(k);
      for (const [x, c] of [[3, '#e86ab8'], [8, '#f2a23c'], [13, '#a06ae8']]) {
        k.rect(x - 1, 9, 3, 7, c);
        for (let i = -2; i <= 2; i++) k.rect(x + i, 5 + Math.abs(i), 1, 4, c);
      }
    },
    '¤': (k) => {
      seaSand(k);
      k.ell(8, 10, 7, 6, '#e8708a');
      k.rect(3, 2, 2, 8, '#e8708a'); k.rect(11, 1, 2, 9, '#f08a6a'); k.rect(7, 4, 2, 6, '#f2a23c');
      k.px(4, 2, '#ffb0c0'); k.px(12, 1, '#ffc0a0');
    },
    '£': (k) => {
      seaSand(k);
      k.ell(8, 10, 7, 6, '#6a7a8a'); k.ell(6, 8, 4, 2.5, '#8a9aaa'); k.ell(11, 12, 2, 1.5, '#4fa86a');
    },
    'µ': (k) => {
      seaSand(k);
      for (const x of [2, 6, 10, 14]) { k.rect(x, 0, 2, 16, '#3a8a4a'); k.ell(x + 2, 4 + (x % 3) * 3, 2, 1.2, '#5aaa5a'); }
    },
    '¥': (k) => {
      k.rect(0, 0, 16, 16, '#1f5a3a');
      for (const x of [1, 5, 9, 13]) { k.rect(x, 0, 3, 16, '#2f7a4a'); k.ell(x + 3, 3 + (x % 4) * 2, 2, 1.4, '#4f9a5a'); }
    },
    '©': shipDeck,
    '®': (k) => {
      k.rect(0, 0, 16, 16, '#5a3a24');
      for (const y of [4, 9, 14]) k.rect(0, y, 16, 1, '#3a2414');
      k.ell(5, 7, 2, 2, '#2a4a5a'); k.ell(12, 11, 1.5, 1.5, '#2a4a5a'); k.px(9, 2, '#4fa86a');
    },
    '°': (k) => {
      shipDeck(k);
      k.rect(3, 3, 10, 12, '#a0703a'); k.rect(3, 6, 10, 1, '#5a3a24'); k.rect(3, 11, 10, 1, '#5a3a24');
      k.rect(3, 3, 10, 1, '#c89a5a');
    },
    '±': (k) => {
      shipDeck(k);
      for (const x of [3, 8, 12]) { k.rect(x, 4, 1, 12, '#3a8a4a'); k.px(x - 1, 7, '#5aaa5a'); k.px(x + 1, 10, '#5aaa5a'); }
    },
    '¶': trenchFloor,
    'Ø': (k) => {
      trenchFloor(k);
      for (const [x, y, c] of [[4, 9, '#5fd8e8'], [10, 6, '#a06ae8'], [12, 12, '#5fd8e8'], [6, 13, '#7ae8a8']]) { k.rect(x, y, 1, 16 - y, '#2a4a5a'); k.ell(x + 0.5, y, 1.8, 1.8, c); }
    },
    '¿': (k) => {
      trenchFloor(k);
      k.tri(2, 16, 14, 16, 8, 5, '#3a3a4a');
      k.ell(8, 4, 2.5, 1.5, '#e8702a'); k.ell(7, 1, 1.5, 1.5, '#9a9aaa'); k.ell(10, 2, 1, 1, '#9a9aaa');
    },
    'ß': (k) => {
      k.rect(0, 0, 16, 16, '#1a2232');
      k.rect(2, 3, 5, 2, '#2a3448'); k.rect(9, 9, 6, 2, '#2a3448'); k.px(12, 4, '#3a4a60');
    },
    'Æ': templeFloor,
    'Þ': (k) => {
      templeFloor(k);
      k.rect(3, 3, 10, 10, '#5ab8c8');
      k.rect(4, 4, 8, 8, '#a8dce4');
      k.rect(7, 5, 2, 6, '#2a6a7a'); k.rect(5, 7, 6, 2, '#2a6a7a');
    },
    'Ð': (k) => {
      templeFloor(k);
      k.rect(4, 0, 8, 16, '#c8d8dc'); k.rect(4, 0, 2, 16, '#e4eef0'); k.rect(10, 0, 2, 16, '#9ab0b8');
      k.rect(3, 0, 10, 2, '#9ab0b8'); k.rect(3, 14, 10, 2, '#9ab0b8'); k.px(8, 8, '#4fa86a');
    },

    // ---------- Sky Isles
    'Õ': (k) => { k.rect(0, 0, 16, 16, '#9ac8f4'); k.ell(4, 12, 4, 2, '#c8e2fa'); k.px(12, 4, '#fff'); },
    'À': cloudFloor,
    'Á': (k) => { k.rect(0, 0, 16, 16, '#6a6a8a'); k.ell(5, 6, 5, 4, '#8a8aa8'); k.ell(11, 11, 5, 4, '#7a7a98'); },
    'Ã': skyGrass,
    'Ä': (k) => {
      skyGrass(k);
      for (const [x, y, c] of [[3, 8, '#e86ab8'], [8, 5, '#fff'], [12, 9, '#f2c84b'], [6, 12, '#a07ae8']]) { k.rect(x, y + 1, 1, 4, '#4fa84a'); k.ell(x, y, 1.5, 1.5, c); }
    },
    'Å': (k) => {
      skyGrass(k);
      k.ell(8, 9, 7, 5, '#8a7a6a'); k.ell(7, 7, 6, 3, '#6aac50'); k.tri(4, 12, 12, 12, 8, 16, '#6a5a4a');
    },
    'Ç': (k) => {
      skyGrass(k);
      k.tri(4, 16, 12, 16, 8, 5, '#f4ecd8'); k.rect(7, 11, 2, 5, '#8a5a32');
      k.rect(7, 0, 2, 12, '#a07a4a'); k.rect(2, 5, 12, 2, '#a07a4a');
      k.ell(8, 6, 1.5, 1.5, '#5a3418');
    },
    'È': (k) => {
      skyGrass(k);
      for (const x of [1, 4, 7, 10, 13]) { k.rect(x, 5, 1, 11, '#c8a050'); k.ell(x + 0.5, 4, 1.2, 2, '#e2c070'); }
    },
    'Ê': (k) => {
      k.rect(0, 0, 16, 16, '#e8c860');
      for (const [x, y] of [[0, 0], [8, 0], [4, 8], [12, 8]]) { k.rect(x, y, 7, 7, '#f2d880'); k.rect(x, y + 7, 7, 1, '#c8a040'); }
    },
    'Ë': (k) => {
      const c = ['#e8506a', '#f2a23c', '#f2c84b', '#5fb84a', '#4a9ae8', '#7a5ad8'];
      for (let i = 0; i < 6; i++) k.rect(0, i * 2.67, 16, 2.67, c[i]);
      k.px(4, 2, '#fff'); k.px(11, 9, '#fff');
    },
    'Ì': (k) => {
      cloudFloor(k);
      for (const [x, y, c] of [[4, 5, '#e86ab8'], [11, 4, '#f2c84b'], [7, 10, '#4ac8e8'], [13, 12, '#5fb84a']]) { k.rect(x - 1, y, 3, 1, c); k.rect(x, y - 1, 1, 3, c); }
    },
    'Í': stormCloud,
    'Î': (k) => {
      stormCloud(k);
      k.rect(7, 2, 2, 14, '#a8a8b8'); k.rect(5, 14, 6, 2, '#8a8a9a');
      k.tri(8, 0, 6, 3, 10, 3, '#f2c84b');
    },
    'Ï': (k) => {
      stormCloud(k);
      for (const x of [2, 6, 10, 14]) { k.rect(x, 6, 1, 10, '#5a8a9a'); k.px(x - 1, 8, '#7aaaba'); k.px(x + 1, 11, '#7aaaba'); }
      k.tri(9, 1, 6, 6, 9, 6, '#f2e88a');
    },
    'Ñ': castleFloor,
    'Ò': (k) => {
      k.rect(0, 0, 16, 16, '#d8d0ec');
      for (const y of [5, 11]) k.rect(0, y, 16, 1, '#a89ac8');
      k.rect(4, 0, 1, 5, '#a89ac8'); k.rect(11, 6, 1, 5, '#a89ac8'); k.rect(7, 12, 1, 4, '#a89ac8');
      k.px(2, 2, '#f0ecfa'); k.px(9, 8, '#f0ecfa');
    },
    'Ó': (k) => {
      castleFloor(k);
      for (const [x, y] of [[4, 4], [11, 6], [6, 11], [12, 12]]) { k.rect(x - 1, y, 3, 1, '#f2c84b'); k.rect(x, y - 1, 1, 3, '#f2c84b'); k.px(x, y, '#fff'); }
    },
    'Ô': (k) => {
      castleFloor(k);
      k.rect(7, 0, 2, 16, '#c89a2a');
      k.rect(2, 2, 6, 9, '#a07ae8'); k.tri(2, 11, 8, 11, 5, 14, '#a07ae8'); k.ell(5, 6, 1.5, 1.5, '#f2c84b');
    },

    // Portal Shrine standing stone.
    Y: (k) => {
      grass(k);
      k.ell(8, 14, 6, 2, '#4a8a3c');
      k.rect(4, 2, 8, 12, '#8a8a9a');
      k.ell(8, 2.5, 4, 2.5, '#8a8a9a');
      k.rect(4, 2, 2, 12, '#a8a8b8');
      k.rect(10, 4, 2, 10, '#6a6a7a');
      k.rect(6, 6, 3, 1, '#5fd8e8'); k.rect(7, 5, 1, 3, '#5fd8e8');
      k.ell(5, 12, 2, 1.5, '#4fa84a');
    },

    // ---------- boss houses: four styles shared by the bosses
    // Log cabin
    D: (k) => roof(k, '#3f6a3a', '#2a4a28'),
    E: (k) => {
      roof(k, '#3f6a3a', '#2a4a28');
      k.tri(8, 2, 5, 10, 11, 10, '#f2c84b'); k.tri(4, 5, 12, 5, 8, 9, '#f2c84b');
    },
    N: logWall,
    S: (k) => {
      logWall(k);
      k.rect(4, 3, 8, 13, '#4a2a14'); k.rect(5, 4, 6, 12, '#7a4a24');
      k.rect(6, 6, 4, 3, '#f2c84b'); k.px(9, 11, '#ffd23c');
    },
    // Striped tent
    '<': (k) => tentTop(k),
    '>': (k) => {
      tentTop(k);
      k.rect(7, 0, 1, 9, '#5a3418');
      k.tri(8, 0, 14, 2, 8, 4, '#3a78c4');
    },
    '?': tentSide,
    '/': (k) => {
      tentSide(k);
      k.tri(8, 2, 3, 16, 13, 16, '#3a2a3a');
      k.tri(8, 2, 3, 16, 5, 16, '#f6e8e8'); k.tri(8, 2, 13, 16, 11, 16, '#e8506a');
    },
    // Stone tower
    '#': (k) => towerTop(k),
    '!': (k) => {
      towerTop(k);
      k.rect(7, 0, 1, 10, '#3a3a4a');
      k.tri(8, 0, 15, 2, 8, 5, '#e8506a');
    },
    '[': stoneWall,
    ']': (k) => {
      stoneWall(k);
      k.rect(4, 5, 8, 11, '#3a3a4a');
      k.ell(8, 5.5, 4, 3, '#3a3a4a');
      k.rect(5, 6, 6, 10, '#8a5a32'); k.ell(8, 6, 3, 2, '#8a5a32');
      k.rect(8, 6, 1, 10, '#6a4020'); k.px(10, 11, '#ffd23c');
    },
    // Domed hall
    a: domeTop,
    y: (k) => {
      domeTop(k);
      k.rect(7, 0, 2, 5, '#c89a2a'); k.ell(8, 2, 2.5, 2.5, '#f2c84b'); k.px(7, 1, '#fff6d6');
    },
    $: marbleWall,
    '+': (k) => {
      marbleWall(k);
      k.rect(4, 5, 8, 11, '#26457a'); k.ell(8, 5.5, 4, 3, '#26457a');
      k.rect(5, 6, 6, 10, '#3a6ab8'); k.ell(8, 6, 3, 2, '#3a6ab8');
      k.px(10, 11, '#f2c84b');
    },

    // Rest Center emblem: a heart on the pink roof.
    4: (k) => {
      roof(k, '#e86a8a', '#b8405e');
      k.rect(3, 1, 10, 10, '#b8405e');
      k.rect(4, 2, 8, 8, '#fff');
      k.ell(6.4, 5, 1.9, 1.9, '#e8506a'); k.ell(9.6, 5, 1.9, 1.9, '#e8506a');
      k.tri(4.6, 5.6, 11.4, 5.6, 8, 9.4, '#e8506a');
      k.px(6, 4, '#ffb0c0');
    },
    // Professor Pi's lab emblem: a gold π badge on the blue roof.
    5: (k) => {
      roof(k, '#5a7bbf', '#3e5b94');
      k.ell(8, 6.5, 5.5, 5.5, '#c89a2a');
      k.ell(8, 6.5, 4.5, 4.5, '#f2c84b');
      k.rect(5, 4, 6, 1, '#2b2840');
      k.rect(6, 5, 1, 4, '#2b2840');
      k.rect(9, 5, 1, 4, '#2b2840'); k.px(10, 8, '#2b2840');
    },
    // Your home: a teal roof with a brick chimney, a flower-box window and a green door.
    6: (k) => roof(k, '#3aa88a', '#26745e'),
    7: (k) => {
      roof(k, '#3aa88a', '#26745e');
      k.rect(5, 0, 6, 9, '#a8584a');
      k.rect(4, 0, 8, 2, '#7a3a32');
      for (const [x, y] of [[5, 4], [8, 4], [6, 7], [9, 7]]) k.rect(x, y, 2, 1, '#7a3a32');
    },
    8: (k) => {
      wall(k);
      k.rect(3, 2, 10, 8, '#5a4030');
      k.rect(4, 3, 8, 6, '#8fd3f7');
      k.rect(4, 3, 3, 2, '#d4f1ff');
      k.rect(7, 3, 1, 6, '#5a4030');
      k.rect(2, 11, 12, 3, '#8a5a32');
      for (const [x, c] of [[3, '#e8506a'], [5, '#f2c84b'], [7, '#e86a8a'], [9, '#f2c84b'], [11, '#e8506a']]) { k.px(x, 10, c); k.px(x + 1, 10, '#4fa84a'); }
    },
    9: (k) => {
      wall(k);
      k.rect(4, 3, 8, 13, '#26745e');
      k.ell(8, 4, 4, 2.5, '#26745e');
      k.rect(5, 4, 6, 12, '#3f8f4a');
      k.ell(8, 4.5, 3, 1.8, '#3f8f4a');
      k.ell(8, 8, 2, 2, '#e8506a'); k.ell(8, 8, 1, 1, '#3f8f4a');
      k.px(10, 11, '#ffd23c');
    },
    d: (k) => {
      wall(k);
      k.rect(4, 2, 8, 14, '#5a3418');
      k.rect(5, 3, 6, 13, '#9a6438');
      k.rect(5, 8, 6, 1, '#7a4a2a');
      k.px(9, 10, '#ffd23c');
    },
    x: (k) => {
      k.rect(0, 0, 16, 16, '#eadcbc');
      for (let x = 2; x < 16; x += 4) k.rect(x, 0, 1, 12, '#dccba4');
      k.rect(0, 12, 16, 4, '#a8865a');
      k.rect(0, 12, 16, 1, '#8a6a42');
    },
    o: floor,
    b: (k) => {
      k.rect(0, 0, 16, 16, '#7a4a2a');
      k.rect(1, 1, 14, 6, '#4a2c18');
      k.rect(1, 9, 14, 6, '#4a2c18');
      const books = ['#e8506a', '#4a9ae8', '#f2c84b', '#5fb84a', '#a070d8', '#f08a3c', '#e8506a'];
      for (let i = 0; i < 7; i++) {
        k.rect(1 + i * 2, 2 + (i % 3 === 0 ? 1 : 0), 2, 5 - (i % 3 === 0 ? 1 : 0), books[i]);
        k.rect(1 + i * 2, 10 + (i % 2), 2, 5 - (i % 2), books[(i + 3) % 7]);
      }
    },
    t: table,
    1: (k) => orb(k, '#6cc05a'),
    2: (k) => orb(k, '#f08a3c'),
    3: (k) => orb(k, '#5aa8e8'),
    c: (k) => {
      floor(k);
      k.rect(0, 3, 16, 13, '#e86a8a');
      k.rect(0, 3, 16, 4, '#fbeaf0');
      k.rect(0, 7, 16, 1, '#b8405e');
    },
    m: (k) => {
      floor(k);
      k.rect(1, 3, 14, 11, '#c0504d');
      k.rect(2, 4, 12, 9, '#d8706a');
      k.rect(3, 8, 10, 1, '#f2c84b');
    },
    ' ': (k) => k.rect(0, 0, 16, 16, '#000'),

    // ---- Sunny Shore
    _: sand,
    ';': (k) => {
      k.rect(0, 0, 16, 16, '#d6d482');
      for (const [x, y] of [[0, 1], [8, 2], [4, 7], [12, 7], [1, 12], [9, 12]]) {
        k.rect(x + 1, y + 1, 1, 3, '#7a9a3a');
        k.rect(x + 3, y, 1, 4, '#7a9a3a');
        k.rect(x + 5, y + 1, 1, 3, '#7a9a3a');
        k.px(x + 3, y - 1 < 0 ? 0 : y - 1, '#f0e8a0');
      }
    },
    P: (k) => {
      sand(k);
      k.rect(7, 7, 2, 9, '#a0703a');
      for (let y = 8; y < 16; y += 2) k.rect(7, y, 2, 1, '#7a5028');
      k.ell(8, 5, 7.5, 2.6, '#2f7d3a');
      k.ell(3.5, 6.5, 3.5, 1.8, '#3f9a44');
      k.ell(12.5, 6.5, 3.5, 1.8, '#3f9a44');
      k.ell(8, 3.5, 4, 2, '#5fb84a');
      k.ell(7, 7.3, 1.3, 1.3, '#6b4423');
      k.ell(9.4, 7.3, 1.3, 1.3, '#6b4423');
    },
    h: (k) => {
      sand(k);
      k.ell(5, 6, 2.2, 1.7, '#f6a8b8');
      k.px(5, 6, '#fff');
      k.px(11, 10, '#f08a3c'); k.px(10, 11, '#f08a3c'); k.px(12, 11, '#f08a3c'); k.px(11, 11, '#f08a3c'); k.px(11, 12, '#f08a3c');
    },

    // ---- Dusty Canyon
    ':': dirt,
    '"': (k) => {
      k.rect(0, 0, 16, 16, '#d8a85a');
      for (const [x, y] of [[1, 2], [9, 1], [5, 7], [12, 8], [0, 12], [8, 12]]) {
        k.rect(x + 1, y + 1, 1, 3, '#94682e');
        k.rect(x + 2, y, 1, 4, '#b07a3a');
        k.rect(x + 3, y + 1, 1, 3, '#94682e');
        k.px(x + 2, y, '#f0d08a');
      }
    },
    K: (k) => {
      dirt(k);
      k.rect(6, 3, 4, 12, '#4a9a4a');
      k.rect(2, 7, 4, 2, '#4a9a4a'); k.rect(2, 4, 2, 4, '#4a9a4a');
      k.rect(10, 9, 4, 2, '#4a9a4a'); k.rect(12, 5, 2, 5, '#4a9a4a');
      k.rect(7, 3, 1, 12, '#6cc05a');
      k.rect(9, 3, 1, 12, '#3a7a3a');
      k.px(8, 2, '#f070a0'); k.px(7, 2, '#f070a0'); k.px(8, 1, '#f070a0');
    },
    M: (k) => {
      k.rect(0, 0, 16, 16, '#b8643a');
      k.rect(0, 0, 16, 2, '#d88a5a');
      k.rect(0, 5, 16, 1, '#9a4e2a');
      k.rect(0, 9, 16, 2, '#cc7448');
      k.rect(0, 13, 16, 1, '#9a4e2a');
      k.rect(3, 2, 1, 3, '#9a4e2a'); k.rect(11, 6, 1, 3, '#9a4e2a'); k.rect(6, 11, 1, 2, '#9a4e2a');
    },

    // ---- Frostpeak
    '*': snow,
    '^': (k) => {
      k.rect(0, 0, 16, 16, '#d4e2f4');
      for (const [x, y] of [[0, 2], [8, 1], [4, 7], [11, 8], [0, 12], [8, 12]]) {
        k.ell(x + 3, y + 2.5, 3, 2, '#aec4e2');
        k.ell(x + 3, y + 1.8, 2.4, 1.2, '#ffffff');
      }
    },
    A: (k) => {
      snow(k);
      k.rect(7, 12, 2, 4, '#7a4a2a');
      k.tri(8, 0, 2, 7, 14, 7, '#2f6b5a');
      k.tri(8, 3, 1, 11, 15, 11, '#2f6b5a');
      k.tri(8, 6, 0, 14, 16, 14, '#25584a');
      k.tri(8, 0, 6, 3, 10, 3, '#ffffff');
      k.rect(3, 10, 3, 1, '#ffffff'); k.rect(10, 10, 3, 1, '#ffffff'); k.rect(2, 13, 4, 1, '#ffffff'); k.rect(11, 13, 3, 1, '#ffffff');
    },
    i: (k) => {
      k.rect(0, 0, 16, 16, '#bfe4f4');
      k.rect(2, 3, 6, 1, '#eaf8ff'); k.rect(9, 9, 5, 1, '#eaf8ff'); k.rect(4, 13, 3, 1, '#eaf8ff');
      k.rect(11, 2, 1, 3, '#9ccce4'); k.rect(3, 8, 1, 2, '#9ccce4');
    },

    // ---- Glowcap Cave
    // ---------- Whisperwood
    n: forestFloor,
    F: (k) => {
      forestFloor(k);
      k.rect(7, 12, 2, 4, '#5a3418');
      k.tri(1, 13, 8, 0, 15, 13, '#1f5a32');
      k.tri(3, 9, 8, 1, 13, 9, '#2a7a42');
      k.tri(5, 5, 8, 1, 11, 5, '#3f8f4a');
    },
    e: (k) => {
      forestFloor(k);
      for (const [x, h] of [[2, 9], [6, 12], [10, 10], [13, 8]]) {
        k.rect(x, 16 - h, 1, h, '#2f7a32');
        for (let y = 16 - h + 1; y < 15; y += 2) { k.px(x - 1, y, '#4fa84a'); k.px(x + 1, y, '#4fa84a'); }
      }
    },
    k: (k) => {
      forestFloor(k);
      k.rect(4, 10, 2, 4, '#f6ecd8'); k.ell(5, 9.5, 3, 2, '#e8506a'); k.px(4, 8, '#fff');
      k.rect(11, 6, 2, 4, '#f6ecd8'); k.ell(12, 5.5, 2.5, 1.8, '#e8506a'); k.px(13, 5, '#fff');
    },
    '-': (k) => {
      k.rect(0, 0, 16, 16, '#3a8ad8');
      k.rect(1, 3, 6, 1, '#6ab0f0'); k.rect(9, 8, 5, 1, '#6ab0f0'); k.rect(3, 12, 6, 1, '#6ab0f0');
    },
    B: (k) => {
      k.rect(0, 0, 16, 16, '#b07a42');
      for (const y of [3, 7, 11, 15]) k.rect(0, y, 16, 1, '#7a4a22');
      k.rect(0, 0, 1, 16, '#5a3418'); k.rect(15, 0, 1, 16, '#5a3418');
    },
    L: (k) => {
      k.rect(0, 0, 16, 16, '#8ac070');
      for (const [x, h] of [[2, 11], [5, 14], [9, 12], [12, 13], [14, 9]]) {
        k.rect(x, 16 - h, 1, h, '#4f8a3a');
        k.rect(x, 16 - h, 1, 3, '#7a4a22');
      }
    },
    z: (k) => {
      k.rect(0, 0, 16, 16, '#4a6a4a');
      k.ell(5, 5, 3, 1.5, '#5a7a4a'); k.ell(11, 11, 3.5, 1.5, '#5a7a4a');
      k.px(10, 4, '#8aaa7a'); k.px(4, 12, '#8aaa7a');
    },
    v: (k) => {
      k.rect(0, 0, 16, 16, '#6a8a4a');
      for (const x of [1, 4, 7, 10, 13]) { k.rect(x, 6 + (x % 3), 1, 10 - (x % 3), '#3a5a2a'); k.px(x + 1, 5 + (x % 3), '#8aaa5a'); }
    },
    p: (k) => {
      k.rect(0, 0, 16, 16, '#9a7048');
      for (const x of [3, 7, 11, 15]) k.rect(x, 0, 1, 16, '#6a4828');
      k.px(1, 4, '#b88a5a'); k.px(9, 11, '#b88a5a');
    },
    J: (k) => {
      k.rect(0, 0, 16, 16, '#4a6a4a');
      k.rect(7, 4, 3, 12, '#6a5a4a');
      k.rect(3, 6, 4, 1, '#6a5a4a'); k.rect(3, 4, 1, 2, '#6a5a4a');
      k.rect(10, 8, 4, 1, '#6a5a4a'); k.rect(13, 5, 1, 3, '#6a5a4a');
      k.ell(8.5, 3, 3, 1.5, '#5a7a3a');
    },
    Z: (k) => {
      k.rect(0, 0, 16, 16, '#2f7a3a');
      k.ell(4, 4, 4, 3, '#3f9a4a'); k.ell(12, 9, 4, 3, '#3f9a4a'); k.ell(5, 13, 3, 2, '#3f9a4a');
      k.px(3, 3, '#6ac85a'); k.px(11, 8, '#6ac85a'); k.ell(10, 2, 2, 1, '#1f5a2a');
    },
    H: deck,
    l: (k) => {
      deck(k);
      k.ell(5, 9, 4, 3, '#5fb84a'); k.ell(11, 11, 4, 3, '#3f8f3a'); k.ell(8, 6, 3, 2.5, '#7ccf5a');
      k.px(4, 7, '#9be07a'); k.px(12, 9, '#9be07a');
    },
    I: (k) => {
      k.rect(0, 0, 16, 16, '#2f7a3a');
      for (let y = 1; y < 16; y += 3) k.rect(2, y, 12, 2, '#c89a5a');
      k.rect(1, 0, 1, 16, '#e8d8a8'); k.rect(14, 0, 1, 16, '#e8d8a8');
    },
    U: (k) => {
      k.rect(0, 0, 16, 16, '#6ab8f0');
      for (const [x, y] of [[2, 0], [6, 5], [11, 1], [13, 9], [4, 11]]) k.rect(x, y, 1, 6, '#e8f6ff');
      k.rect(8, 2, 1, 4, '#4a98d8'); k.rect(10, 10, 1, 5, '#4a98d8');
    },
    O: wetStone,
    '&': (k) => {
      wetStone(k);
      k.ell(4, 10, 3.5, 3, '#4fa86a'); k.ell(11, 7, 3.5, 3, '#3a8a54'); k.ell(9, 13, 3, 2.5, '#4fa86a');
      k.px(3, 9, '#7ad88a'); k.px(11, 6, '#7ad88a');
    },
    '|': (k) => {
      k.rect(0, 0, 16, 16, '#5a6470');
      k.rect(0, 5, 16, 1, '#4a525c'); k.rect(0, 11, 16, 1, '#4a525c');
      k.rect(5, 0, 1, 5, '#4a525c'); k.rect(11, 6, 1, 5, '#4a525c'); k.rect(3, 12, 1, 4, '#4a525c');
      k.rect(1, 1, 3, 1, '#7a8490'); k.rect(8, 7, 3, 1, '#7a8490'); k.rect(6, 13, 4, 1, '#7a8490');
    },
    q: caveFloor,
    '%': (k) => {
      k.rect(0, 0, 16, 16, '#2e4e48');
      for (const [x, y] of [[1, 2], [9, 1], [5, 7], [12, 8], [0, 12], [8, 12]]) {
        k.rect(x + 1, y + 1, 1, 3, '#1e3a34');
        k.rect(x + 3, y, 1, 4, '#3a6a5e');
        k.rect(x + 5, y + 1, 1, 3, '#1e3a34');
        k.px(x + 3, y, '#7af0c0');
      }
      k.px(4, 5, '#c8fff0'); k.px(13, 12, '#c8fff0');
    },
    Q: (k) => {
      k.rect(0, 0, 16, 16, '#241c34');
      k.rect(1, 1, 6, 5, '#342a48'); k.rect(9, 3, 6, 5, '#342a48'); k.rect(3, 9, 7, 6, '#342a48');
      k.rect(1, 1, 6, 1, '#463a5e'); k.rect(9, 3, 6, 1, '#463a5e'); k.rect(3, 9, 7, 1, '#463a5e');
    },
    X: (k) => {
      caveFloor(k);
      k.tri(8, 0, 4, 15, 12, 15, '#4aa8e8');
      k.tri(8, 0, 6, 15, 8, 15, '#9ae4ff');
      k.tri(3, 6, 0, 15, 6, 15, '#7a5ad8');
      k.tri(13, 5, 10, 15, 16, 15, '#7a5ad8');
      k.px(8, 4, '#fff');
    },
    u: (k) => {
      caveFloor(k);
      for (const [x, y, c] of [[4, 6, '#f080d0'], [11, 10, '#7af0c0'], [6, 12, '#f2e85a']]) {
        k.rect(x, y + 1, 1, 2, '#f4e8ff');
        k.ell(x + 0.5, y + 0.5, 2.2, 1.4, c);
      }
    },
  };

  const tileCache = {};
  function tile(ch) {
    if (!(ch in tileCache)) {
      const draw = TILE_DRAW[ch];
      if (!draw) return (tileCache[ch] = null);
      const c = canvas(16, 16);
      draw(kit(c));
      tileCache[ch] = c;
    }
    return tileCache[ch];
  }

  // ---------------- people (16x16, 4 directions, 3 walk frames) ----------------

  const personCache = {};
  function person(look, dir, frame) {
    const key = look.id + dir + frame;
    if (personCache[key]) return personCache[key];
    const c = canvas(16, 16), k = kit(c);
    const skin = look.skin || '#f6c9a0', eye = INK;
    const { hair, shirt, pants, hat } = look;
    const side = dir === 'left' || dir === 'right';

    // legs
    if (side) {
      if (frame === 0) k.rect(6, 12, 4, 3, pants);
      else { k.rect(4, 12, 2, 3, pants); k.rect(10, 12, 2, 3, pants); }
    } else {
      k.rect(5, 12, 2, frame === 1 ? 2 : 3, pants);
      k.rect(9, 12, 2, frame === 2 ? 2 : 3, pants);
    }
    // body
    if (side) {
      k.rect(5, 8, 6, 4, shirt);
      const ax = dir === 'left' ? 8 : 7;
      k.rect(ax, 9, 1, 2, shade(shirt));
      k.px(ax, 11, skin);
    } else {
      k.rect(4, 8, 8, 4, shirt);
      k.rect(3, 9, 1, 2, shirt); k.rect(12, 9, 1, 2, shirt);
      k.px(3, 11, skin); k.px(12, 11, skin);
    }
    // head
    k.rect(4, 1, 8, 7, hair);
    if (dir === 'down') { k.rect(5, 4, 6, 4, skin); k.px(6, 5, eye); k.px(9, 5, eye); }
    if (dir === 'left') { k.rect(4, 4, 5, 4, skin); k.px(5, 5, eye); }
    if (dir === 'right') { k.rect(7, 4, 5, 4, skin); k.px(10, 5, eye); }
    if (look.long) {
      if (dir === 'down') { k.rect(3, 4, 1, 5, hair); k.rect(12, 4, 1, 5, hair); }
      else if (dir === 'up') k.rect(4, 8, 8, 2, hair);
      else k.rect(dir === 'left' ? 9 : 4, 8, 3, 2, hair);
    }
    if (hat) {
      k.rect(4, 1, 8, 3, hat);
      if (dir === 'down') k.rect(3, 3, 10, 1, hat);
      if (dir === 'left') k.rect(2, 3, 7, 1, hat);
      if (dir === 'right') k.rect(7, 3, 7, 1, hat);
    }
    k.g.clearRect(4, 1, 1, 1);
    k.g.clearRect(11, 1, 1, 1);
    personCache[key] = outline(c);
    return personCache[key];
  }

  // ---------------- creatures (designed on 32 units, drawn at 48px) ----------------

  // Every Legend faces left (toward your side of a battle), so pupils sit on the
  // left of each eye. In battle your Legend is drawn mirrored, so the two look at
  // each other. While `blinking`, eyes are drawn shut.
  let blinking = false;
  function eyes(k, x, y) {
    if (blinking) { k.rect(x, y + 2, 3, 1, INK); return; }
    k.rect(x, y, 3, 4, '#fff');
    k.rect(x, y + 1, 2, 3, INK);
    k.px(x, y + 1, '#fff');
  }

  const CREATURES = {
    sproutle(k) {
      k.ell(10, 28, 4, 2.5, '#4f9a3a');
      k.ell(22, 28, 4, 2.5, '#4f9a3a');
      k.ell(16, 20, 10, 9, '#7cc96a');
      k.ell(16, 23.5, 6.5, 5, '#d4f2b8');
      k.rect(15, 5, 2, 7, '#3f8f3a');
      k.ell(11, 6, 5, 2.6, '#5fb84a');
      k.ell(21, 6, 5, 2.6, '#5fb84a');
      k.ell(10, 5.4, 2.5, 1, '#9be07a');
      eyes(k, 10, 14); eyes(k, 19, 14);
      k.rect(14, 20, 4, 1, INK);
      k.rect(7, 19, 2, 1, '#f59aa0'); k.rect(23, 19, 2, 1, '#f59aa0');
    },
    emberkit(k) {
      k.ell(27, 14, 3.6, 6, '#ffcf3c');
      k.ell(27, 16.5, 2, 3.5, '#ff6a2a');
      k.tri(6, 15, 9, 3, 15, 11, '#e8702a');
      k.tri(26, 15, 23, 3, 17, 11, '#e8702a');
      k.tri(8.5, 12, 9.5, 6.5, 12.5, 11, '#ffc08a');
      k.tri(23.5, 12, 22.5, 6.5, 19.5, 11, '#ffc08a');
      k.ell(10, 28, 3.5, 2, '#c8642a');
      k.ell(22, 28, 3.5, 2, '#c8642a');
      k.ell(16, 19.5, 10, 9, '#f08a3c');
      k.ell(16, 24, 6, 4.5, '#ffe0b8');
      eyes(k, 10, 14); eyes(k, 19, 14);
      k.rect(15, 19, 2, 1, INK);
      k.px(14, 20, INK); k.px(17, 20, INK);
    },
    splashfin(k) {
      k.tri(11, 13, 17, 2, 22, 13, '#3a78c4');
      k.tri(24, 20, 31, 12, 31, 28, '#3a78c4');
      k.ell(15, 19, 12, 9, '#5aa8e8');
      k.ell(14, 23, 8, 4.5, '#d4f0ff');
      k.ell(6, 23, 3, 2, '#3a78c4');
      eyes(k, 8, 14); eyes(k, 16, 14);
      k.rect(11, 20, 4, 1, INK);
      k.ell(28, 5, 1.6, 1.6, '#bfe8ff');
      k.ell(25, 2, 1.1, 1.1, '#bfe8ff');
    },
    buzzlet(k) {
      k.ell(8, 10, 5.5, 4.5, '#e8f6ff');
      k.ell(24, 10, 5.5, 4.5, '#e8f6ff');
      k.rect(12, 3, 1, 5, '#3a3020'); k.rect(19, 3, 1, 5, '#3a3020');
      k.ell(12.5, 3, 1.6, 1.6, '#3a3020'); k.ell(19.5, 3, 1.6, 1.6, '#3a3020');
      k.tri(14, 26, 18, 26, 16, 31, '#3a3020');
      k.ell(16, 19, 9.5, 8.5, '#f6d23c');
      k.ell(16, 19, 9.5, 8.5, '#3a3020', (x, y) => (y > 20.5 && y < 22.5) || (y > 24.5 && y < 26.5));
      eyes(k, 11, 12); eyes(k, 18, 12);
      k.rect(15, 17, 2, 1, '#3a3020');
    },
    pebblit(k) {
      k.ell(16, 21, 12, 9, '#8e8e9e');
      k.ell(13, 17, 7, 4, '#b4b4c2');
      k.ell(19, 12.5, 4, 2, '#7cc96a');
      k.rect(23, 19, 1, 4, '#5e5e6e'); k.rect(24, 22, 2, 1, '#5e5e6e');
      k.rect(6, 24, 3, 1, '#5e5e6e');
      eyes(k, 10, 18); eyes(k, 17, 18);
      k.rect(13, 25, 4, 1, INK);
    },
    hootsum(k) {
      k.tri(6, 10, 8, 2, 13, 8, '#7a5432');
      k.tri(26, 10, 24, 2, 19, 8, '#7a5432');
      k.ell(6, 21, 2.6, 5.5, '#8a6040');
      k.ell(26, 21, 2.6, 5.5, '#8a6040');
      k.rect(12, 28, 2, 3, '#f2a23c'); k.rect(18, 28, 2, 3, '#f2a23c');
      k.ell(16, 18.5, 10.5, 11, '#a87850');
      k.ell(16, 24, 6.5, 5.5, '#ecd6ae');
      k.rect(15, 21, 2, 6, '#a87850'); k.rect(13, 23, 6, 2, '#a87850');
      k.ell(11.5, 13, 4, 4, '#fff'); k.ell(20.5, 13, 4, 4, '#fff');
      k.ell(10.8, 13.5, 2, 2.2, INK); k.ell(19.8, 13.5, 2, 2.2, INK);
      k.px(10, 12, '#fff'); k.px(19, 12, '#fff');
      k.tri(14.5, 16, 17.5, 16, 16, 19.5, '#f2a23c');
    },
    snipsnap(k) {
      // legs
      for (const x of [6, 9, 23, 26]) k.rect(x, 24, 1.5, 5, '#b8402a');
      // claws, open like scissors
      k.ell(5, 12, 4.5, 4, '#e8604a');
      k.tri(2, 8, 5, 12, 0, 13, '#fbeee8');
      k.ell(27, 12, 4.5, 4, '#e8604a');
      k.tri(30, 8, 27, 12, 32, 13, '#fbeee8');
      k.rect(7, 15, 2, 5, '#e8604a'); k.rect(23, 15, 2, 5, '#e8604a');
      // eye stalks
      k.rect(12, 9, 1.5, 6, '#b8402a'); k.rect(19, 9, 1.5, 6, '#b8402a');
      k.ell(12.7, 8.5, 2.6, 2.6, '#fff'); k.ell(19.7, 8.5, 2.6, 2.6, '#fff');
      k.ell(12, 9, 1.3, 1.5, INK); k.ell(19, 9, 1.3, 1.5, INK);
      // shell
      k.ell(16, 21, 11, 7, '#e8604a');
      k.ell(16, 19, 8, 3.5, '#f59a7a');
      k.rect(13, 23, 6, 1, INK);
      k.px(12, 22, INK); k.px(19, 22, INK);
    },
    shareling(k) {
      // stem with a face
      k.ell(16, 24, 7, 7, '#f6ead2');
      k.ell(16, 27, 5, 3, '#e6d4b0');
      eyes(k, 11.5, 20); eyes(k, 17.5, 20);
      k.rect(15, 26, 2, 1, INK);
      // cap, split down the middle for sharing
      k.ell(16, 12, 14, 9, '#a060d8', (x, y) => y < 17);
      k.ell(16, 12, 14, 9, '#7a40b8', (x, y) => y >= 15 && y < 17);
      k.rect(15.5, 3, 1, 12, '#f6ead2');
      k.ell(9, 9, 2.4, 2, '#f6ead2'); k.ell(23, 9, 2.4, 2, '#f6ead2');
      k.ell(12, 5, 1.6, 1.3, '#f6ead2'); k.ell(20.5, 5.5, 1.6, 1.3, '#f6ead2');
      k.ell(5, 13, 1.4, 1.2, '#f6ead2'); k.ell(27, 13, 1.4, 1.2, '#f6ead2');
    },
    // ---- Sunny Shore
    tallytoise(k) {
      k.ell(7, 27, 3, 2.5, '#7ac06a'); k.ell(21, 27, 3, 2.5, '#7ac06a');
      k.ell(27, 18, 4.5, 4, '#8ad07a');
      k.ell(15, 19, 12, 9, '#3f7a4e', (x, y) => y < 25);
      k.ell(15, 18, 10, 7.5, '#5a9a5e', (x, y) => y < 24);
      k.rect(3, 23, 24, 2, '#2f5a3a');
      for (const x of [9, 12, 15, 18]) k.rect(x, 13, 1.4, 7, '#e8f4d8');
      k.tri(7.5, 19, 9, 18, 21, 13, '#e8f4d8');
      k.ell(28.5, 17, 1.3, 1.5, INK); k.px(28, 16.4, '#fff');
      k.rect(27, 20, 3, 0.8, INK);
    },
    gulpgull(k) {
      k.rect(13, 26, 1.4, 4, '#f2a23c'); k.rect(18, 26, 1.4, 4, '#f2a23c');
      k.ell(17, 20, 10, 7, '#f4f6fa');
      k.ell(20, 18, 8, 4.5, '#aab4c4');
      k.ell(26, 17, 3, 2.5, '#3a3a4a');
      k.ell(10, 12, 6.5, 6, '#ffffff');
      k.tri(1, 13, 6, 11, 6, 15, '#f2a23c');
      k.px(2.5, 13.5, '#e8506a');
      eyes(k, 7, 9);
    },
    starbig(k) {
      const cx = 16, cy = 18, R = 14, r = 6.5;
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5, a1 = a - Math.PI / 5, a2 = a + Math.PI / 5;
        k.tri(cx + R * Math.cos(a), cy + R * Math.sin(a), cx + r * Math.cos(a1), cy + r * Math.sin(a1), cx + r * Math.cos(a2), cy + r * Math.sin(a2), '#f08a6a');
      }
      k.ell(cx, cy, 7, 7, '#f08a6a');
      for (const [x, y] of [[16, 7], [7, 15], [25, 15], [10, 26], [22, 26]]) k.ell(x, y, 1.2, 1.2, '#f8c8a8');
      eyes(k, 11.5, 14); eyes(k, 17.5, 14);
      k.rect(14, 21, 4, 1, INK);
    },
    octogroup(k) {
      for (let i = 0; i < 8; i++) {
        const x = 4 + i * 3.45;
        k.ell(x, 25 + (i % 2), 1.9, 5, '#8a48c0');
        k.px(x, 27 + (i % 2), '#d8b0f4');
      }
      k.ell(16, 13, 11, 10, '#a060d8');
      k.ell(12, 8, 3, 2, '#c890f0');
      eyes(k, 10.5, 12); eyes(k, 18.5, 12);
      k.ell(16, 19, 2, 1.4, '#6a3098');
    },
    jellishare(k) {
      for (const [x, d] of [[8, 0], [12, 1], [16, 0], [20, 1], [24, 0]]) {
        for (let y = 15; y < 29; y += 2) k.rect(x + ((y / 2 + d) % 2 ? 0.8 : 0), y, 1.4, 2, '#6ab8e8');
      }
      k.ell(16, 13, 12, 9, '#8ad0f0', (x, y) => y < 16);
      k.rect(4, 15, 24, 1.5, '#5aa0d8');
      k.ell(12, 8, 4, 2.4, '#d4f0ff');
      eyes(k, 11, 9.5); eyes(k, 18, 9.5);
      k.rect(8, 13, 2, 1, '#f59aa0'); k.rect(22, 13, 2, 1, '#f59aa0');
    },
    whalemax(k) {
      k.ell(11, 6, 1.4, 3, '#8ad0f0'); k.ell(8, 4, 1, 1.6, '#8ad0f0'); k.ell(14, 4, 1, 1.6, '#8ad0f0');
      k.tri(25, 18, 32, 11, 32, 25, '#2e5aa0');
      k.ell(14, 20, 13, 9, '#3a6ab8');
      k.ell(13, 25, 10, 4, '#c8dcf4', (x, y) => y > 23);
      for (const x of [7, 11, 15, 19]) k.rect(x, 24, 0.8, 4, '#9ab8e0');
      k.ell(17, 22, 3, 1.6, '#2e5aa0');
      eyes(k, 6, 16);
      k.rect(3, 21, 6, 1, INK);
    },

    // ---- Dusty Canyon
    cactotal(k) {
      k.rect(9, 26, 14, 5, '#c87a4a'); k.rect(8, 25, 16, 2, '#e09a6a');
      k.ell(7, 15, 3, 5, '#4aa84a'); k.ell(25, 12, 3, 5, '#4aa84a');
      k.rect(8, 17, 3, 2, '#4aa84a'); k.rect(21, 14, 3, 2, '#4aa84a');
      k.ell(16, 17, 7.5, 10, '#5ab85a');
      for (const x of [12, 16, 20]) k.rect(x, 9, 0.8, 15, '#3a8a3a');
      for (const [x, y] of [[10, 12], [22, 15], [14, 24], [19, 8]]) k.px(x, y, '#ffffff');
      k.ell(13, 6, 2.2, 1.8, '#f070a0'); k.ell(19, 6, 2.2, 1.8, '#f070a0'); k.ell(16, 4, 2.2, 1.8, '#f070a0');
      k.ell(16, 6, 1.5, 1.5, '#ffd23c');
      eyes(k, 11.5, 13); eyes(k, 17.5, 13);
      k.rect(14.5, 19, 3, 1, INK);
    },
    minusnake(k) {
      k.ell(16, 25, 13, 5, '#c89a30');
      k.ell(16, 24, 12, 4, '#e8c050');
      k.ell(16, 19, 9, 4, '#d8ae40');
      k.ell(16, 18, 8, 3.2, '#e8c050');
      for (const x of [8, 14, 20, 26]) k.rect(x, 22, 2, 3, '#a87a28');
      k.ell(16, 11, 6.5, 5.5, '#e8c050');
      k.rect(12.5, 6.5, 7, 1.6, '#7a5a20');
      k.tri(15, 16, 17, 16, 16, 19.5, '#e8506a');
      eyes(k, 11.5, 9); eyes(k, 17.5, 9);
    },
    lizardo(k) {
      k.ell(16, 10, 13, 8, '#e8604a', (x, y) => y < 13);
      k.ell(16, 10, 10, 5.5, '#f59a6a', (x, y) => y < 12);
      k.ell(25, 27, 5, 2.5, '#f0a040');
      k.ell(9, 26, 3, 2, '#d88a30'); k.ell(23, 23, 3, 2, '#d88a30');
      k.ell(16, 21, 8, 7, '#f0a040');
      k.ell(16, 13, 7, 6, '#f0a040');
      for (const [x, y] of [[12, 20], [19, 22], [15, 25]]) k.ell(x, y, 1.3, 1.3, '#f8d070');
      eyes(k, 11.5, 10); eyes(k, 17.5, 10);
      k.rect(14, 16, 4, 1, INK);
    },
    arraydillo(k) {
      k.ell(9, 28, 2.5, 2, '#8a6e56'); k.ell(22, 28, 2.5, 2, '#8a6e56');
      k.ell(5, 21, 4.5, 4, '#c8a888');
      k.tri(4, 15, 6, 18, 2.5, 18.5, '#c8a888');
      k.ell(17, 20, 12, 9, '#a89078', (x, y) => y < 27);
      for (let x = 9; x <= 25; x += 4) k.rect(x, 12, 1, 15, '#7a6450');
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) k.ell(11 + c * 4, 16 + r * 3.5, 0.9, 0.9, '#e0ccb0');
      k.ell(3.5, 20.5, 1.1, 1.3, INK);
      k.px(1.4, 22.5, '#5a3a2a');
    },
    coyshare(k) {
      k.ell(27, 22, 3.2, 7, '#c8985a'); k.ell(28, 27, 2, 2.2, '#fff4e0');
      k.tri(8, 2, 6, 12, 13, 9, '#c8985a'); k.tri(24, 2, 26, 12, 19, 9, '#c8985a');
      k.tri(8.5, 5, 7.5, 10.5, 11, 9, '#f0c8a0'); k.tri(23.5, 5, 24.5, 10.5, 21, 9, '#f0c8a0');
      k.ell(16, 25, 8, 6, '#c8985a');
      k.ell(16, 26, 4.5, 4, '#f0dcc0');
      k.ell(16, 14, 8.5, 7, '#d8a868');
      k.ell(16, 18, 4, 3, '#f0d8b0');
      k.ell(16, 16.5, 1.5, 1.1, INK);
      eyes(k, 10.5, 11); eyes(k, 18.5, 11);
    },
    boulderox(k) {
      k.tri(2, 4, 8, 10, 10, 7, '#f2e8c8'); k.tri(30, 4, 24, 10, 22, 7, '#f2e8c8');
      k.ell(16, 24, 14, 7, '#6a4a2a');
      k.ell(16, 21, 10, 3, '#8a8a9a', (x, y) => y < 21);
      k.ell(16, 14, 10, 8, '#7a5a3a');
      k.ell(16, 19, 6, 4, '#c8a080');
      k.ell(13.5, 19.5, 1, 1, INK); k.ell(18.5, 19.5, 1, 1, INK);
      eyes(k, 9, 11); eyes(k, 20, 11);
      k.rect(8, 10, 4, 1, INK); k.rect(20, 10, 4, 1, INK);
      k.ell(6, 13, 2.5, 1.5, '#6a4a2a'); k.ell(26, 13, 2.5, 1.5, '#6a4a2a');
    },

    // ---- Frostpeak
    pengplus(k) {
      k.ell(12, 30, 3, 1.4, '#f2a23c'); k.ell(20, 30, 3, 1.4, '#f2a23c');
      k.ell(7, 19, 2.5, 6, '#22304a'); k.ell(25, 19, 2.5, 6, '#22304a');
      k.ell(16, 18, 9.5, 12.5, '#2b3a5a');
      k.ell(16, 21, 6.5, 8.5, '#f4f8ff');
      k.rect(15, 18, 2, 7, '#4a9ae8'); k.rect(12.5, 20.5, 7, 2, '#4a9ae8');
      k.ell(12, 10, 3, 3.2, '#f4f8ff'); k.ell(20, 10, 3, 3.2, '#f4f8ff');
      k.ell(12.5, 10.5, 1.4, 1.8, INK); k.ell(19.5, 10.5, 1.4, 1.8, INK);
      k.tri(14, 13, 18, 13, 16, 16, '#f2a23c');
    },
    meltling(k) {
      k.ell(16, 30, 13, 2, '#bfe4f4');
      k.ell(16, 23, 9.5, 7.5, '#f4f8ff');
      k.ell(16, 12, 7.5, 6.5, '#ffffff');
      k.rect(8, 17, 16, 3, '#e8506a'); k.rect(19, 19, 3, 6, '#e8506a');
      k.ell(13, 10.5, 1.2, 1.4, INK); k.ell(19, 10.5, 1.2, 1.4, INK);
      k.tri(16, 12.5, 23, 13.5, 16, 14.5, '#f08a3c');
      for (const x of [13, 15, 17, 19]) k.px(x, 16, INK);
      k.ell(16, 23, 1, 1, INK); k.ell(16, 26.5, 1, 1, INK);
      k.rect(7, 22, 1, 3, '#9ccce4'); k.rect(25, 24, 1, 3, '#9ccce4');
      k.rect(11, 4, 10, 2, '#2b2840'); k.rect(13, 0, 6, 4, '#2b2840');
    },
    yetiny(k) {
      k.tri(9, 8, 10, 2, 12.5, 7, '#c8c8d4'); k.tri(23, 8, 22, 2, 19.5, 7, '#c8c8d4');
      k.ell(10, 29, 3.5, 2, '#8ab8e8'); k.ell(22, 29, 3.5, 2, '#8ab8e8');
      k.ell(4.5, 20, 3, 5, '#e0e8f4'); k.ell(27.5, 20, 3, 5, '#e0e8f4');
      k.ell(16, 18, 11, 11, '#f0f4fa');
      for (const [x, y] of [[8, 10], [24, 10], [6, 22], [26, 22], [12, 27], [20, 27]]) k.ell(x, y, 2, 2, '#f0f4fa');
      k.ell(16, 15, 6.5, 5.5, '#8ab8e8');
      eyes(k, 12, 12); eyes(k, 17, 12);
      k.rect(14, 18, 4, 1, INK);
    },
    flurrfox(k) {
      k.ell(26, 19, 5, 8.5, '#d8ecff'); k.ell(28, 12, 3, 3.5, '#9cd0f0');
      k.tri(9, 1, 7, 11, 14, 9, '#e8f4ff'); k.tri(23, 1, 25, 11, 18, 9, '#e8f4ff');
      k.tri(9.5, 4, 8.5, 9.5, 12, 8.5, '#9cd0f0'); k.tri(22.5, 4, 23.5, 9.5, 20, 8.5, '#9cd0f0');
      k.ell(14, 24, 8, 6.5, '#f4faff');
      k.ell(16, 14, 8.5, 7, '#f4faff');
      k.ell(16, 18, 4, 2.6, '#ffffff');
      k.ell(16, 17, 1.4, 1, INK);
      k.rect(15.5, 7, 1, 3, '#4aa8e8'); k.rect(14.5, 8, 3, 1, '#4aa8e8');
      eyes(k, 10.5, 11.5); eyes(k, 18.5, 11.5);
    },
    harefrost(k) {
      k.ell(12, 7, 2.6, 7.5, '#f4f8ff'); k.ell(20, 7, 2.6, 7.5, '#f4f8ff');
      k.ell(12, 7, 1.2, 5.5, '#f8c0d0'); k.ell(20, 7, 1.2, 5.5, '#f8c0d0');
      k.ell(16, 25, 8.5, 6, '#e8f0fa');
      k.ell(16, 17, 7.5, 6.5, '#f4f8ff');
      k.ell(16, 20, 1.2, 0.9, '#f59aa0');
      k.rect(9, 19, 2, 1, '#f8c0d0'); k.rect(21, 19, 2, 1, '#f8c0d0');
      k.tri(23, 25, 30, 22, 25, 28, '#f08a3c'); k.rect(29, 20, 1, 3, '#5fb84a');
      eyes(k, 11.5, 14); eyes(k, 17.5, 14);
    },
    tuskmore(k) {
      k.ell(16, 19, 14, 10, '#7a4e30');
      for (const x of [6, 10, 22, 26]) k.rect(x, 22, 1.4, 6, '#5a3820');
      k.rect(6, 27, 4, 4, '#6a4428'); k.rect(22, 27, 4, 4, '#6a4428');
      k.ell(22, 13, 4.5, 6.5, '#6a4428');
      k.ell(12, 13, 8, 7.5, '#8a5a3a');
      k.ell(8, 24, 2.6, 6, '#8a5a3a');
      k.tri(5, 19, 2, 27, 4, 27, '#fff6e0'); k.tri(14, 19, 12, 27, 14.5, 27, '#fff6e0');
      eyes(k, 8, 10); eyes(k, 13, 10);
      k.ell(12, 6, 5, 2, '#5a3820');
    },

    // ---- Glowcap Cave
    batsum(k) {
      k.tri(1, 8, 12, 12, 8, 24, '#6a4a9a'); k.tri(31, 8, 20, 12, 24, 24, '#6a4a9a');
      k.tri(1, 8, 4, 18, 8, 24, '#5a3a8a'); k.tri(31, 8, 28, 18, 24, 24, '#5a3a8a');
      k.tri(10, 4, 12, 11, 15, 9, '#8a6ac0'); k.tri(22, 4, 20, 11, 17, 9, '#8a6ac0');
      k.ell(16, 17, 7, 8, '#8a6ac0');
      k.rect(15.3, 19, 1.4, 5, '#d8c8f4'); k.rect(13.5, 20.8, 5, 1.4, '#d8c8f4');
      eyes(k, 11.5, 12); eyes(k, 17.5, 12);
      k.px(14, 17, '#fff'); k.px(17.5, 17, '#fff');
    },
    molemin(k) {
      k.ell(6, 25, 3.5, 2.5, '#f0c0a8'); k.ell(26, 25, 3.5, 2.5, '#f0c0a8');
      k.ell(16, 20, 11, 10, '#6a4a3a');
      k.ell(16, 21, 7, 6.5, '#c89a80');
      k.ell(16, 19, 2.5, 2, '#f080a0');
      k.ell(11, 13, 3.4, 3, '#f2c84b'); k.ell(21, 13, 3.4, 3, '#f2c84b');
      k.ell(11, 13, 2.2, 2, '#8ad0f0'); k.ell(21, 13, 2.2, 2, '#8ad0f0');
      k.px(10.4, 12.4, '#fff'); k.px(20.4, 12.4, '#fff');
      k.rect(14, 13, 4, 1, '#f2c84b');
      k.rect(14.5, 23, 3, 1, INK);
    },
    crystling(k) {
      k.ell(16, 27, 13, 4, '#6a5a7a');
      k.tri(5, 9, 1, 27, 10, 27, '#4aa8e8'); k.tri(27, 9, 22, 27, 31, 27, '#4aa8e8');
      k.tri(16, 1, 7, 27, 25, 27, '#7ad8f8');
      k.tri(16, 1, 12, 27, 16, 27, '#aee8ff');
      k.tri(5, 9, 4, 27, 6, 27, '#9ae0ff');
      eyes(k, 12, 15); eyes(k, 17, 15);
      k.rect(14.5, 21, 3, 1, INK);
    },
    webbit(k) {
      for (const [ax, ay, bx, by] of [[10, 18, 1, 10], [10, 20, 0, 18], [10, 22, 1, 26], [11, 24, 4, 31], [22, 18, 31, 10], [22, 20, 32, 18], [22, 22, 31, 26], [21, 24, 28, 31]]) {
        k.tri(ax, ay - 0.8, ax, ay + 0.8, bx, by, '#3a2e50');
      }
      k.ell(16, 22, 8.5, 7, '#5a4a7a');
      k.rect(16, 16, 0.8, 13, '#8a7ab0'); k.rect(9, 22, 14, 0.8, '#8a7ab0');
      k.ell(16, 12, 6.5, 5.5, '#6a5a8a');
      eyes(k, 11.5, 9); eyes(k, 17.5, 9);
      k.ell(13.5, 14.5, 0.8, 0.8, '#f2c84b'); k.ell(18.5, 14.5, 0.8, 0.8, '#f2c84b');
    },
    glowsplit(k) {
      k.rect(13, 1, 1, 5, '#3a4a6a'); k.rect(19, 1, 1, 5, '#3a4a6a');
      k.ell(8, 12, 6, 3.5, '#e8f4ff'); k.ell(24, 12, 6, 3.5, '#e8f4ff');
      k.ell(16, 22, 7, 8, '#f2e85a');
      k.ell(16, 22, 7, 8, '#d8c040', (x, y) => Math.floor(y) % 4 === 0);
      k.rect(15.5, 15, 1, 15, '#a89030');
      k.ell(16, 11, 5.5, 5.5, '#3a4a6a');
      eyes(k, 12, 9); eyes(k, 17, 9);
    },
    numdrake(k) {
      k.tri(4, 2, 2, 20, 12, 16, '#2a8a8a'); k.tri(28, 2, 30, 20, 20, 16, '#2a8a8a');
      k.tri(25, 24, 32, 30, 22, 30, '#3ac4b8');
      k.ell(16, 22, 10, 8.5, '#3ac4b8');
      k.ell(16, 24, 6, 6, '#f2e8b0');
      for (const y of [21, 24, 27]) k.rect(11, y, 10, 0.8, '#d8c890');
      k.tri(10, 3, 11, 9, 13, 7, '#f2e8b0'); k.tri(22, 3, 21, 9, 19, 7, '#f2e8b0');
      k.ell(16, 11, 8, 6.5, '#3ac4b8');
      k.ell(16, 15, 4.5, 2.6, '#5ad8cc');
      k.px(14.5, 15, INK); k.px(17.5, 15, INK);
      eyes(k, 10.5, 8.5); eyes(k, 18.5, 8.5);
      k.tri(16, 12.5, 14, 17, 18, 17, '#7ad8f8');
    },

    gridrex(k) {
      k.tri(24, 21, 32, 27, 24, 28, '#7a4ab8');
      k.tri(7, 11, 10, 3, 14, 10, '#5a3a94');
      k.tri(13, 9, 17, 1, 20, 9, '#5a3a94');
      k.tri(19, 10, 23, 3, 26, 12, '#5a3a94');
      k.ell(9, 29, 3.5, 2, '#6a42a8');
      k.ell(21, 29, 3.5, 2, '#6a42a8');
      k.ell(15, 20, 11, 9.5, '#8a5ac8');
      k.ell(15, 24, 7, 5, '#d8c2f4');
      k.ell(15, 24, 7, 5, '#a888d8', (x, y) => Math.floor(x) % 3 === 0 || Math.floor(y) % 3 === 0);
      eyes(k, 8, 13); eyes(k, 16, 13);
      k.rect(7, 12, 4, 1, INK); k.rect(16, 12, 4, 1, INK);
      k.rect(10, 19, 8, 1, INK);
      k.px(11, 20, '#fff'); k.px(16, 20, '#fff');
    },

    // ---------- Whisperwood
    plusquirrel(k) {
      k.ell(24, 13, 7, 10, '#d8823a');
      k.ell(24, 11, 4, 6, '#f0a050');
      k.rect(23, 8, 2, 7, '#fff'); k.rect(20.5, 10.5, 7, 2, '#fff');
      k.tri(6, 11, 7, 3, 11, 9, '#c8702a'); k.tri(14, 9, 17, 3, 18, 11, '#c8702a');
      k.ell(9, 29, 3, 1.6, '#8a4a1a'); k.ell(17, 29, 3, 1.6, '#8a4a1a');
      k.ell(13, 22, 8, 7.5, '#c8702a');
      k.ell(12, 14, 7, 6, '#c8702a');
      k.ell(13, 24, 4.5, 4.5, '#f6d8b0');
      eyes(k, 8, 11); eyes(k, 13, 11);
      k.px(11, 16, INK);
    },
    otteradd(k) {
      k.tri(25, 23, 32, 29, 25, 29, '#6a4028');
      k.ell(16, 21, 11, 8, '#8a5a3a');
      k.ell(16, 14, 9, 7, '#8a5a3a');
      k.ell(8, 9, 2.2, 2.2, '#6a4028'); k.ell(24, 9, 2.2, 2.2, '#6a4028');
      k.ell(16, 16, 6, 4, '#c89a70');
      k.ell(16, 23, 7, 5, '#e8c8a0');
      eyes(k, 10, 11); eyes(k, 19, 11);
      k.ell(16, 15, 1.6, 1.2, INK);
      k.rect(9, 16, 3, 1, '#5a3a24'); k.rect(20, 16, 3, 1, '#5a3a24');
      k.ell(16, 24, 4, 3, '#f2c84b');
      k.rect(15.5, 22, 1, 4, '#fff'); k.rect(14, 23.5, 4, 1, '#fff');
    },
    toadtotal(k) {
      k.ell(6, 28, 4, 2, '#4f8a3a'); k.ell(26, 28, 4, 2, '#4f8a3a');
      k.ell(16, 21, 12, 8, '#6aa848');
      k.ell(10, 12, 4, 3.5, '#6aa848'); k.ell(22, 12, 4, 3.5, '#6aa848');
      k.ell(16, 24, 8, 4.5, '#d8e8a0');
      eyes(k, 8, 10); eyes(k, 20, 10);
      k.rect(10, 18, 12, 1, INK);
      k.rect(15, 13, 2, 4, '#3f7a2a'); k.rect(14, 14, 4, 2, '#3f7a2a');
      k.ell(7, 18, 1.5, 1, '#f59aa0'); k.ell(25, 18, 1.5, 1, '#f59aa0');
    },
    mothaway(k) {
      k.ell(8, 15, 7, 9, '#c8b8e8'); k.ell(24, 15, 7, 9, '#c8b8e8');
      k.ell(8, 16, 4, 5, '#e0d4f4'); k.ell(24, 16, 4, 5, '#e0d4f4');
      k.rect(5, 15, 6, 2, '#7a5ab8'); k.rect(21, 15, 6, 2, '#7a5ab8');
      k.rect(13, 2, 1, 7, '#7a5ab8'); k.rect(18, 2, 1, 7, '#7a5ab8');
      k.ell(12.5, 2.5, 2, 1.4, '#7a5ab8'); k.ell(18.5, 2.5, 2, 1.4, '#7a5ab8');
      k.ell(16, 19, 5, 9, '#f4ecd8');
      k.ell(16, 12, 5.5, 3.5, '#fff');
      eyes(k, 12, 13); eyes(k, 17, 13);
      k.rect(15, 19, 2, 1, INK);
    },
    beaverbite(k) {
      k.ell(26, 27, 5.5, 3, '#5a3a24');
      k.ell(26, 27, 5.5, 3, '#3e2614', (x, y) => Math.floor(x) % 3 === 0);
      k.ell(15, 21, 10, 9, '#9a6a3a');
      k.ell(8, 11, 2.4, 2.4, '#7a4a24'); k.ell(22, 11, 2.4, 2.4, '#7a4a24');
      k.ell(15, 24, 6, 5, '#d8b07a');
      eyes(k, 9, 13); eyes(k, 17, 13);
      k.ell(15, 18, 2, 1.4, INK);
      k.rect(13, 20, 5, 3, '#fff'); k.rect(15, 20, 1, 3, '#c8c0b0');
    },
    snailess(k) {
      k.ell(14, 27, 13, 3.5, '#a8d8c8');
      k.ell(6, 21, 4, 6.5, '#a8d8c8');
      k.rect(3, 9, 1, 8, '#a8d8c8'); k.rect(8, 9, 1, 8, '#a8d8c8');
      k.ell(3.5, 9, 2, 2, '#fff'); k.ell(8.5, 9, 2, 2, '#fff');
      k.px(2, 9, INK); k.px(7, 9, INK);
      k.ell(20, 17, 9, 9, '#c8834a');
      k.ell(20, 17, 6, 6, '#e8a868');
      k.ell(20, 17, 3, 3, '#c8834a');
      k.rect(16, 16, 8, 2, '#fff');
      k.rect(4, 22, 3, 1, INK);
    },
    mossbig(k) {
      k.ell(16, 21, 12.5, 9.5, '#7a8a7a');
      k.ell(12, 18, 6, 3, '#9aa89a');
      k.ell(16, 12, 11, 4, '#4fa84a');
      k.ell(8, 15, 2, 3, '#4fa84a'); k.ell(23, 15, 2, 3.5, '#4fa84a');
      k.px(12, 10, '#f2c84b'); k.px(19, 9, '#fff');
      eyes(k, 10, 17); eyes(k, 18, 17);
      k.rect(13, 24, 6, 1, INK);
    },
    heronmore(k) {
      k.rect(14, 22, 1, 9, '#e8a040'); k.rect(19, 22, 1, 9, '#e8a040');
      k.rect(12, 30, 4, 1, '#e8a040'); k.rect(17, 30, 4, 1, '#e8a040');
      k.ell(15, 18, 8, 6, '#a8c4e0');
      k.ell(18, 18, 6, 4, '#7a98c4');
      k.rect(20, 8, 3, 10, '#c8dcf0');
      k.ell(21, 7, 4, 3, '#c8dcf0');
      k.tri(28, 3, 23, 4, 24, 6, '#7a98c4');
      k.tri(18, 6.5, 8, 7.5, 18, 9, '#f2c84b');
      k.rect(20, 5, 2, 3, '#fff'); k.rect(20, 6, 1, 2, INK);
    },
    toucount(k) {
      k.rect(9, 28, 3, 2, '#4ac8e8'); k.rect(14, 28, 3, 2, '#4ac8e8');
      k.ell(12, 19, 8, 10, '#2b2840');
      k.ell(12, 22, 5, 6, '#fff3c4');
      k.ell(13, 10, 3.5, 3.5, '#4ac8e8');
      k.ell(22, 12, 9, 4.5, '#f28a2a');
      k.ell(28, 13, 3, 3, '#e8506a');
      for (const x of [18, 20, 22, 24]) k.rect(x, 10, 1, 4, '#2b2840');
      k.rect(17, 11.5, 9, 1, '#2b2840');
      k.rect(12, 9, 3, 3, '#fff'); k.rect(13, 10, 2, 2, INK);
    },
    mushgroup(k) {
      k.rect(3, 22, 5, 7, '#f6ecd8'); k.ell(5.5, 21, 5, 3, '#e8506a');
      k.rect(24, 22, 5, 7, '#f6ecd8'); k.ell(26.5, 21, 5, 3, '#e8506a');
      k.rect(11, 14, 10, 15, '#f6ecd8');
      k.ell(16, 12, 11, 6.5, '#e8506a');
      k.ell(11, 10, 1.8, 1.6, '#fff'); k.ell(18, 8, 1.6, 1.4, '#fff'); k.ell(22, 12, 1.5, 1.3, '#fff');
      k.px(4, 20, '#fff'); k.px(27, 20, '#fff');
      eyes(k, 12, 18); eyes(k, 17, 18);
      k.rect(14, 24, 4, 1, INK);
    },
    dragonfleet(k) {
      k.ell(8, 9, 7.5, 3, '#c8f0ff'); k.ell(24, 9, 7.5, 3, '#c8f0ff');
      k.ell(8, 15, 6.5, 2.5, '#c8f0ff'); k.ell(24, 15, 6.5, 2.5, '#c8f0ff');
      k.rect(3, 9, 9, 1, '#8ad0e8'); k.rect(20, 9, 9, 1, '#8ad0e8');
      k.ell(16, 23, 2.2, 8, '#2a9a88');
      k.ell(16, 23, 2.2, 8, '#1a6a5a', (x, y) => Math.floor(y) % 3 === 0);
      k.ell(16, 12, 4, 4.5, '#3ac4a8');
      k.ell(13, 8, 3, 3, '#3ac4a8'); k.ell(19, 8, 3, 3, '#3ac4a8');
      eyes(k, 11, 6); eyes(k, 18, 6);
      k.rect(15, 14, 2, 1, INK);
    },
    chimpairs(k) {
      k.rect(22, 25, 6, 2, '#8a5a3a'); k.ell(28, 21, 2, 4.5, '#8a5a3a');
      k.ell(6, 13, 3, 3, '#e8b88a'); k.ell(26, 13, 3, 3, '#e8b88a');
      k.ell(16, 24, 6.5, 6, '#8a5a3a');
      k.ell(16, 13, 8.5, 7.5, '#8a5a3a');
      k.ell(16, 15, 6.5, 5, '#e8c8a0');
      eyes(k, 12, 11); eyes(k, 17, 11);
      k.rect(14, 18, 4, 1, INK);
      k.tri(5, 22, 10, 19, 9, 24, '#f2d84b'); k.tri(7, 25, 12, 22, 11, 27, '#f2d84b');
    },
    hedgeshare(k) {
      k.ell(18, 17, 12, 10, '#5a3a1a');
      k.ell(18, 17, 12, 10, '#8a6a4a', (x, y) => (Math.floor(x + y) % 4) === 0);
      k.ell(16, 22, 11, 7, '#a88a6a');
      k.ell(8, 22, 6, 5, '#e8c8a0');
      k.ell(3, 23, 1.6, 1.4, INK);
      eyes(k, 6, 19);
      k.ell(19, 9, 2.2, 2.2, '#e8506a'); k.ell(25, 11, 2.2, 2.2, '#e8506a'); k.ell(28, 16, 2.2, 2.2, '#e8506a');
      k.ell(10, 29, 2.5, 1.5, '#5a3a1a'); k.ell(22, 29, 2.5, 1.5, '#5a3a1a');
    },
    lilysplit(k) {
      k.ell(16, 22, 13.5, 7, '#4fa84a');
      k.rect(15.5, 15, 1, 14, '#3a8a3a'); k.rect(3, 21.5, 26, 1, '#3a8a3a');
      k.ell(16, 11, 5.5, 4, '#f6a1c8');
      k.tri(11, 9, 13, 3, 16, 9, '#f6a1c8'); k.tri(16, 9, 19, 3, 21, 9, '#f6a1c8');
      k.ell(16, 11, 2, 2, '#f2c84b');
      eyes(k, 8, 19); eyes(k, 21, 19);
      k.rect(11, 25, 3, 1, INK); k.rect(18, 25, 3, 1, INK);
    },
    mistsplit(k) {
      k.ell(9, 18, 6, 5, '#e8f4ff'); k.ell(23, 18, 6, 5, '#e8f4ff');
      k.ell(16, 15, 10.5, 8, '#e8f4ff');
      k.ell(16, 20, 9, 3.5, '#c8e0f4');
      eyes(k, 11, 13); eyes(k, 18, 13);
      k.rect(15, 19, 2, 1, INK);
      k.ell(8, 28, 1.8, 2.4, '#6ab0f0'); k.ell(16, 29, 1.8, 2.4, '#6ab0f0'); k.ell(24, 28, 1.8, 2.4, '#6ab0f0');
    },
    oakulus(k) {
      k.rect(7, 28, 5, 3, '#6a4020'); k.rect(20, 28, 5, 3, '#6a4020');
      k.rect(2, 16, 8, 2, '#8a5a32'); k.rect(22, 15, 8, 2, '#8a5a32');
      k.ell(3, 14, 2.5, 2, '#4fa84a'); k.ell(29, 13, 2.5, 2, '#4fa84a');
      k.rect(9, 11, 14, 18, '#8a5a32');
      k.rect(11, 13, 1, 14, '#6a4020'); k.rect(20, 13, 1, 14, '#6a4020');
      k.ell(16, 7, 14, 7, '#3f8f3a');
      k.ell(8, 9, 6, 5, '#4fa84a'); k.ell(24, 9, 6, 5, '#4fa84a'); k.ell(16, 4, 7, 4, '#5fb84a');
      eyes(k, 11, 16); eyes(k, 18, 16);
      k.rect(13, 23, 6, 1, INK);
    },
    hippomath(k) {
      k.ell(9, 29, 3.5, 2, '#7a6aa8'); k.ell(23, 29, 3.5, 2, '#7a6aa8');
      k.ell(16, 21, 13, 9, '#9a8ac8');
      k.ell(7, 9, 2.5, 2, '#7a6aa8'); k.ell(25, 9, 2.5, 2, '#7a6aa8');
      k.ell(16, 14, 10, 7, '#9a8ac8');
      k.ell(16, 22, 9, 5.5, '#b8aade');
      eyes(k, 9, 10); eyes(k, 20, 10);
      k.px(13, 20, INK); k.px(19, 20, INK);
      k.rect(12, 25, 8, 1, INK);
      k.rect(12, 26, 2, 2, '#fff'); k.rect(18, 26, 2, 2, '#fff');
    },
    crocalc(k) {
      k.tri(27, 17, 32, 26, 26, 25, '#4f8a3a');
      k.ell(21, 21, 10, 8, '#5f9a48');
      k.ell(21, 15, 8, 3.5, '#3f7a2a', (x, y) => (Math.floor(x) % 3) !== 0);
      k.ell(21, 25, 7, 3, '#d8e8a0');
      k.ell(10, 19, 10, 4.5, '#5f9a48');
      k.ell(13, 13, 3.5, 3, '#5f9a48');
      eyes(k, 11, 11);
      k.px(2, 17, INK);
      k.rect(2, 20.5, 16, 1, INK);
      k.tri(5, 21, 6.5, 23.5, 8, 21, '#fff'); k.tri(10, 21, 11.5, 23.5, 13, 21, '#fff');
      k.ell(12, 29, 3, 1.5, '#4f8a3a'); k.ell(26, 29, 3, 1.5, '#4f8a3a');
    },
    owlgebra(k) {
      k.tri(5, 11, 7, 1, 12, 8, '#5a4a7a'); k.tri(27, 11, 25, 1, 20, 8, '#5a4a7a');
      k.rect(11, 29, 3, 2, '#f2a23c'); k.rect(18, 29, 3, 2, '#f2a23c');
      k.ell(16, 19, 11, 11, '#6a5a94');
      k.ell(16, 23, 7, 6, '#d8d0f0');
      for (const y of [20, 23, 26]) { k.rect(13, y, 2, 1, '#8a7ab4'); k.rect(17, y, 2, 1, '#8a7ab4'); }
      k.ell(11, 13, 4.5, 4.5, '#f2c84b'); k.ell(21, 13, 4.5, 4.5, '#f2c84b');
      k.ell(11, 13, 3.2, 3.2, '#fff'); k.ell(21, 13, 3.2, 3.2, '#fff');
      k.ell(10, 13.5, 1.6, 1.8, INK); k.ell(20, 13.5, 1.6, 1.8, INK);
      k.rect(15, 12, 2, 1, '#f2c84b');
      k.tri(15, 16, 17, 16, 16, 19, '#f2a23c');
    },
    cascoi(k) {
      k.tri(27, 19, 32, 11, 32, 27, '#e8702a');
      k.tri(16, 25, 20, 31, 23, 25, '#e8506a');
      k.ell(19, 20, 11, 7, '#f6f0e8');
      k.ell(15, 18, 3, 2.5, '#e8702a'); k.ell(23, 22, 3, 2, '#e8702a'); k.ell(21, 16, 2, 1.6, '#e8506a');
      k.ell(13, 10, 3.5, 3, '#6ab0f0');
      k.tri(7, 9, 5, 2, 10, 8, '#f2c84b'); k.tri(11, 9, 12, 2, 14, 9, '#f2c84b');
      k.ell(9, 14, 6, 5, '#f6f0e8');
      eyes(k, 5, 12);
      k.rect(1, 17, 5, 1, '#f2c84b'); k.rect(2, 19, 4, 1, '#f2c84b');
      k.rect(4, 15, 3, 1, INK);
    },

    // ---------- Brightport City
    pigeonplus(k) {
      k.rect(12, 27, 1, 4, '#e8a040'); k.rect(18, 27, 1, 4, '#e8a040');
      k.ell(17, 19, 10, 8, '#8a9ab8');
      k.ell(21, 20, 6, 4.5, '#6a7a98');
      k.ell(12, 13, 6.5, 6, '#8a9ab8');
      k.ell(13, 17, 5, 3, '#6ac8a8');
      k.tri(5, 13, 1, 14, 5, 15, '#e8a040');
      eyes(k, 8, 10);
      k.rect(20, 14, 1, 5, '#fff'); k.rect(18, 16, 5, 1, '#fff');
    },
    taxicub(k) {
      k.ell(8, 9, 3, 3, '#f2c84b'); k.ell(24, 9, 3, 3, '#f2c84b');
      k.ell(16, 21, 10, 9, '#f2c84b');
      k.ell(16, 21, 10, 9, '#2b2840', (x, y) => y > 22 && y < 24 && Math.floor(x / 2) % 2 === 0);
      k.ell(16, 14, 8, 7, '#f2c84b');
      k.ell(16, 17, 4, 3, '#fff2b8');
      k.ell(16, 15.5, 1.5, 1.1, INK);
      eyes(k, 10, 11); eyes(k, 19, 11);
      k.rect(13, 4, 6, 3, '#2b2840'); k.rect(14, 5, 4, 1, '#f2c84b');
    },
    crabplus(k) {
      for (const [x, y] of [[4, 24], [7, 27], [25, 27], [28, 24]]) k.rect(x, y, 2, 4, '#c8402a');
      k.ell(5, 12, 4.5, 4, '#e8502a'); k.ell(27, 12, 4.5, 4, '#e8502a');
      k.tri(2, 10, 6, 8, 5, 12, '#f6e8e8');
      k.ell(16, 20, 11, 7, '#e8502a');
      k.ell(16, 22, 7, 4, '#f08a6a');
      k.rect(11, 8, 1, 6, '#c8402a'); k.rect(20, 8, 1, 6, '#c8402a');
      k.ell(11.5, 8, 2.2, 2.2, '#fff'); k.ell(20.5, 8, 2.2, 2.2, '#fff');
      k.px(10, 8, INK); k.px(19, 8, INK);
      k.rect(15.5, 17, 1, 6, '#fff'); k.rect(13, 19.5, 6, 1, '#fff');
    },
    raccminus(k) {
      k.ell(27, 22, 3, 7, '#8a8a9a'); k.ell(27, 22, 3, 7, '#3a3a4a', (x, y) => Math.floor(y) % 3 === 0);
      k.ell(15, 22, 9, 8, '#9a9aaa');
      k.ell(15, 24, 5, 4.5, '#d8d8e4');
      k.tri(8, 10, 8, 3, 12, 8, '#9a9aaa'); k.tri(18, 8, 22, 3, 22, 10, '#9a9aaa');
      k.ell(15, 13, 8, 6.5, '#9a9aaa');
      k.rect(8, 11, 15, 4, '#3a3a4a');
      eyes(k, 10, 11); eyes(k, 17, 11);
      k.ell(15, 17, 1.6, 1.2, INK); k.ell(15, 18.5, 4, 1.5, '#d8d8e4');
      k.rect(13, 24, 5, 1, '#fff');
    },
    mouseless(k) {
      k.rect(23, 26, 8, 1, '#e8a0b0'); k.ell(31, 24, 1, 2, '#e8a0b0');
      k.ell(8, 9, 5, 5, '#c8c8d4'); k.ell(24, 9, 5, 5, '#c8c8d4');
      k.ell(8, 9, 3, 3, '#f0b8c8'); k.ell(24, 9, 3, 3, '#f0b8c8');
      k.ell(16, 21, 9, 8, '#c8c8d4');
      k.ell(16, 15, 7, 6, '#c8c8d4');
      eyes(k, 11, 12); eyes(k, 18, 12);
      k.ell(14, 18, 1.5, 1.2, '#e8506a');
      k.tri(3, 22, 9, 18, 9, 27, '#f2c84b'); k.ell(6, 23, 1, 1, '#d8a020');
    },
    seaslurp(k) {
      k.tri(24, 26, 32, 22, 32, 30, '#6a5a4a');
      k.ell(17, 22, 12, 7, '#8a7a6a');
      k.ell(17, 24, 8, 4, '#b8a898');
      k.ell(10, 13, 6, 6, '#8a7a6a');
      k.ell(7, 16, 3, 2, '#b8a898');
      eyes(k, 6, 10); eyes(k, 11, 10);
      k.ell(5, 15, 1.4, 1, INK);
      k.rect(3, 17, 2, 1, '#5a4a3a'); k.rect(8, 17, 2, 1, '#5a4a3a');
      k.ell(12, 29, 3.5, 1.5, '#6a5a4a');
    },
    lampling(k) {
      k.rect(14, 18, 4, 11, '#2b2840'); k.rect(10, 28, 12, 3, '#2b2840');
      k.tri(8, 8, 24, 8, 16, 2, '#2b2840');
      k.rect(9, 8, 14, 11, '#f2d88a');
      k.rect(9, 8, 14, 11, '#fff2b8', (x, y) => y < 11);
      k.rect(8, 18, 16, 2, '#2b2840');
      eyes(k, 11, 11); eyes(k, 18, 11);
      k.rect(14, 16, 4, 1, INK);
    },
    neonewt(k) {
      k.tri(24, 22, 32, 18, 31, 25, '#3ac4a8');
      k.ell(17, 22, 10, 5.5, '#3ac4a8');
      k.ell(17, 22, 10, 5.5, '#e86ab8', (x) => Math.floor(x) % 5 === 0);
      k.ell(8, 17, 6, 5, '#3ac4a8');
      eyes(k, 4, 14); eyes(k, 9, 14);
      k.rect(3, 19, 4, 1, INK);
      for (const x of [10, 16, 21, 25]) k.rect(x, 26, 2, 4, '#2a9a88');
    },
    lighthousey(k) {
      k.tri(9, 30, 23, 30, 16, 8, '#f4f4f8');
      k.tri(9, 30, 23, 30, 16, 8, '#e8402a', (x, y) => Math.floor(y / 4) % 2 === 0);
      k.rect(11, 3, 10, 7, '#2b2840'); k.rect(12, 4, 8, 5, '#f2d88a');
      k.tri(10, 3, 22, 3, 16, 0, '#e8402a');
      eyes(k, 12, 15); eyes(k, 17, 15);
      k.rect(14, 21, 4, 1, INK);
      k.tri(0, 4, 11, 5, 0, 8, '#fff6c0');
    },
    sprinklet(k) {
      for (const [x, y] of [[6, 4], [10, 2], [16, 1], [22, 2], [26, 4]]) k.ell(x, y, 1.4, 2, '#6ab0f0');
      k.ell(16, 21, 10, 9, '#4a9ae8');
      k.ell(16, 23, 6, 5, '#c8e8ff');
      k.rect(14, 7, 4, 6, '#a8a8b8'); k.ell(16, 7, 4, 2, '#c8ccd8');
      eyes(k, 11, 16); eyes(k, 18, 16);
      k.rect(14, 22, 4, 1, INK);
      k.ell(10, 30, 3, 1.5, '#2a6aa8'); k.ell(22, 30, 3, 1.5, '#2a6aa8');
    },
    bricklet(k) {
      k.rect(5, 6, 22, 22, '#b85a3a');
      for (const y of [11, 16, 21]) k.rect(5, y, 22, 1, '#8a3a2a');
      for (const [x, y] of [[11, 6], [20, 6], [15, 12], [24, 12], [10, 17], [19, 17], [15, 22]]) k.rect(x, y, 1, 5, '#8a3a2a');
      eyes(k, 10, 12); eyes(k, 19, 12);
      k.rect(13, 19, 6, 1, INK);
      k.rect(8, 28, 5, 3, '#8a3a2a'); k.rect(19, 28, 5, 3, '#8a3a2a');
    },
    traintrio(k) {
      for (const x of [3, 13, 23]) { k.rect(x, 12, 8, 12, x === 3 ? '#e8402a' : '#3a78c4'); k.rect(x + 1, 14, 6, 3, '#c8e8ff'); }
      k.rect(3, 23, 28, 2, '#2b2840');
      for (const x of [5, 9, 15, 19, 25, 29]) k.ell(x, 27, 2, 2, '#2b2840');
      k.rect(4, 7, 3, 5, '#2b2840'); k.ell(5, 4, 2.5, 2, '#d8dce4');
      k.rect(3, 18, 8, 5, '#f2c84b');
      eyes(k, 4, 18); eyes(k, 8, 18);
    },
    pelishare(k) {
      k.rect(14, 26, 1, 5, '#e8a040'); k.rect(19, 26, 1, 5, '#e8a040');
      k.ell(19, 19, 9, 8, '#f4f4f8');
      k.ell(22, 20, 6, 5, '#d8d8e4');
      k.ell(11, 10, 5, 5, '#f4f4f8');
      k.tri(7, 11, 0, 12, 7, 13, '#f2c84b');
      k.ell(4, 15, 4, 3, '#f2a23c');
      for (const x of [2, 4, 6]) k.ell(x, 15, 0.8, 1.6, '#6ab0f0');
      eyes(k, 8, 8);
    },
    slicerat(k) {
      k.rect(23, 25, 8, 1, '#c8a0a0');
      k.ell(8, 9, 4, 4, '#a89a9a'); k.ell(22, 9, 4, 4, '#a89a9a');
      k.ell(16, 21, 9, 8, '#a89a9a');
      k.ell(15, 15, 7, 6, '#a89a9a');
      eyes(k, 10, 12); eyes(k, 17, 12);
      k.ell(13, 18, 1.4, 1.1, '#e8506a');
      k.tri(9, 20, 22, 20, 15.5, 30, '#f2c84b'); k.rect(9, 20, 13, 2, '#c8843a');
      k.ell(13, 23, 1, 1, '#e8304a'); k.ell(17, 24, 1, 1, '#e8304a'); k.ell(15, 27, 0.9, 0.9, '#e8304a');
    },
    balloonsplit(k) {
      k.rect(15.5, 22, 1, 9, '#6a6a7a');
      k.ell(16, 13, 10, 11, '#e86ab8');
      k.ell(12, 9, 3, 4, '#f6a8d8');
      k.tri(14, 23, 18, 23, 16, 26, '#c84a98');
      k.ell(5, 26, 3, 3.5, '#4a9ae8'); k.ell(27, 26, 3, 3.5, '#f2c84b');
      eyes(k, 11, 12); eyes(k, 18, 12);
      k.rect(14, 18, 4, 1, INK);
    },
    fountitan(k) {
      k.rect(4, 26, 24, 5, '#a8a8b8'); k.rect(4, 26, 24, 1, '#c8c8d4');
      k.ell(16, 19, 11, 8, '#c8c8d4');
      k.ell(16, 19, 8, 5, '#6ab8f0');
      k.rect(14, 4, 4, 14, '#a8a8b8');
      k.ell(16, 6, 6, 5, '#c8c8d4');
      eyes(k, 12, 4); eyes(k, 17, 4);
      for (const [x, y] of [[8, 9], [24, 9], [5, 13], [27, 13]]) k.ell(x, y, 1.4, 2.2, '#6ab0f0');
      k.rect(4, 15, 6, 2, '#a8a8b8'); k.rect(22, 15, 6, 2, '#a8a8b8');
    },
    towerex(k) {
      k.tri(26, 22, 32, 28, 26, 30, '#7a7a8a');
      k.rect(10, 6, 14, 24, '#8a8a9a');
      for (let y = 8; y < 26; y += 4) for (const x of [12, 16, 20]) k.rect(x, y, 2, 2, '#f2d88a');
      k.rect(4, 6, 12, 8, '#8a8a9a');
      eyes(k, 6, 7);
      k.rect(4, 12, 8, 1, INK);
      for (const x of [5, 8, 11]) k.tri(x, 13, x + 2, 13, x + 1, 15, '#fff');
      k.rect(8, 18, 3, 2, '#8a8a9a');
      k.rect(11, 29, 4, 2, '#5a5a6a'); k.rect(19, 29, 4, 2, '#5a5a6a');
    },
    metrodrake(k) {
      k.tri(26, 16, 32, 12, 32, 22, '#5a6a8a');
      k.ell(18, 19, 12, 8, '#5a6a8a');
      k.rect(8, 16, 22, 3, '#f2c84b');
      for (const x of [14, 20, 26]) k.rect(x, 12, 4, 3, '#c8e8ff');
      k.ell(7, 13, 6, 5, '#5a6a8a');
      k.ell(3, 14, 1.8, 1.8, '#fff6a0');
      eyes(k, 5, 10);
      k.tri(5, 8, 7, 3, 9, 8, '#3a4a6a');
      for (const x of [10, 18, 26]) k.ell(x, 28, 2.5, 2.5, '#2b2840');
    },
    anchorca(k) {
      k.tri(26, 18, 32, 12, 32, 24, '#2b2840');
      k.tri(16, 12, 20, 3, 22, 13, '#2b2840');
      k.ell(16, 19, 13, 8, '#2b2840');
      k.ell(13, 23, 9, 4, '#f4f4f8');
      k.ell(8, 14, 3, 2, '#f4f4f8');
      eyes(k, 6, 13);
      k.rect(3, 20, 5, 1, '#f4f4f8');
      k.rect(21, 14, 1, 6, '#f2c84b'); k.rect(19, 15, 5, 1, '#f2c84b'); k.ell(21.5, 20, 3, 1.5, '#f2c84b', (x, y) => y > 20);
    },
    gearadon(k) {
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; k.rect(22 + Math.cos(a) * 7 - 1, 12 + Math.sin(a) * 7 - 1, 3, 3, '#c89a2a'); }
      k.ell(22, 12, 6, 6, '#c89a2a'); k.ell(22, 12, 3, 3, '#8a6a1a');
      k.ell(15, 21, 11, 8, '#a8957a');
      k.ell(15, 23, 7, 4, '#d8c8aa');
      k.ell(7, 14, 6, 5, '#a8957a');
      eyes(k, 3, 11); eyes(k, 8, 11);
      k.rect(3, 17, 5, 1, INK);
      k.ell(9, 29, 3, 2, '#8a7a5a'); k.ell(21, 29, 3, 2, '#8a7a5a');
    },
    brightwing(k) {
      k.tri(14, 16, 0, 4, 4, 22, '#e86ab8'); k.tri(18, 16, 32, 4, 28, 22, '#4ac8e8');
      k.tri(14, 17, 3, 10, 8, 20, '#f2c84b'); k.tri(18, 17, 29, 10, 24, 20, '#f2c84b');
      k.tri(14, 24, 10, 31, 22, 31, '#e86ab8'); k.tri(18, 24, 22, 31, 16, 31, '#4ac8e8');
      k.ell(16, 18, 6, 7, '#fff6d6');
      k.ell(16, 10, 4.5, 4.5, '#fff6d6');
      k.tri(14, 6, 15, 0, 17, 6, '#e86ab8'); k.tri(16, 6, 18, 1, 19, 6, '#4ac8e8');
      eyes(k, 12, 8); eyes(k, 17, 8);
      k.tri(14, 12, 18, 12, 16, 15, '#f2a23c');
    },

    // ---------- Coral Deep
    clownplus(k) {
      k.tri(24, 18, 31, 12, 31, 24, '#f28a3c');
      k.ell(15, 18, 11, 8, '#f28a3c');
      k.rect(9, 10, 3, 16, '#fff'); k.rect(17, 11, 3, 14, '#fff');
      k.rect(17, 16, 3, 4, '#2b2840');
      k.rect(16, 17, 5, 2, '#2b2840');
      k.tri(12, 11, 16, 5, 18, 12, '#f28a3c');
      eyes(k, 5, 14);
      k.rect(4, 20, 3, 1, INK);
    },
    barnaplus(k) {
      k.ell(16, 20, 12, 9, '#a8a8b8');
      for (const [x, y] of [[9, 15], [16, 13], [23, 16], [12, 22], [20, 23]]) { k.ell(x, y, 3, 2.5, '#d8d8e4'); k.ell(x, y - 0.5, 1.2, 1, '#6a6a7a'); }
      eyes(k, 11, 17); eyes(k, 18, 17);
      k.rect(14, 26, 4, 1, INK);
      k.rect(15, 7, 2, 6, '#f4f4f8'); k.rect(13, 9, 6, 2, '#f4f4f8');
    },
    anglerplus(k) {
      k.rect(14, 1, 1, 8, '#4a5a7a'); k.rect(10, 1, 4, 1, '#4a5a7a'); k.ell(9, 3, 2.5, 2.5, '#fff6a0'); k.px(9, 3, '#f2c84b');
      k.tri(26, 18, 32, 12, 32, 24, '#4a5a7a');
      k.ell(16, 19, 12, 9, '#4a5a7a');
      k.ell(15, 22, 8, 5, '#6a7a9a');
      eyes(k, 7, 13);
      k.rect(4, 22, 12, 1, INK);
      for (const x of [6, 9, 12]) k.tri(x, 22, x + 2, 22, x + 1, 25, '#fff');
    },
    urchless(k) {
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; k.tri(16 + Math.cos(a) * 8, 17 + Math.sin(a) * 8, 16 + Math.cos(a + 0.2) * 14, 17 + Math.sin(a + 0.2) * 14, 16 + Math.cos(a + 0.35) * 8, 17 + Math.sin(a + 0.35) * 8, '#5a3a7a'); }
      k.ell(16, 17, 9, 9, '#7a4a9a');
      eyes(k, 11, 14); eyes(k, 18, 14);
      k.rect(14, 21, 4, 1, INK);
    },
    squidrop(k) {
      for (const x of [9, 13, 17, 21]) k.rect(x, 20, 2, 10, '#e88ab8');
      k.ell(16, 13, 9, 11, '#f0a8c8');
      k.ell(16, 7, 6, 5, '#f6c8dc');
      eyes(k, 11, 14); eyes(k, 18, 14);
      k.ell(5, 27, 2, 2.5, '#2b2840'); k.ell(3, 22, 1.4, 1.8, '#2b2840');
    },
    eelaway(k) {
      k.ell(20, 22, 10, 4, '#3a8a7a');
      k.ell(24, 15, 6, 4, '#3a8a7a');
      k.ell(14, 12, 6, 4, '#3a8a7a');
      k.ell(8, 12, 5, 4, '#4aa890');
      for (const x of [16, 22, 26]) k.rect(x, 20, 1, 4, '#f2c84b');
      eyes(k, 4, 10);
      k.rect(3, 15, 4, 1, INK);
    },
    puffbig(k) {
      for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; k.tri(16 + Math.cos(a) * 11, 17 + Math.sin(a) * 11, 16 + Math.cos(a + 0.15) * 14, 17 + Math.sin(a + 0.15) * 14, 16 + Math.cos(a + 0.3) * 11, 17 + Math.sin(a + 0.3) * 11, '#c89a3a'); }
      k.ell(16, 17, 12, 12, '#f2c84b');
      k.ell(16, 21, 8, 6, '#fff2b8');
      eyes(k, 9, 12); eyes(k, 18, 12);
      k.ell(14, 19, 2, 1.5, INK);
    },
    seamore(k) {
      k.rect(13, 20, 3, 6, '#f2a23c'); k.ell(17, 27, 4, 3, '#f2a23c'); k.ell(18, 27, 2, 1.5, '#e4d4a4');
      k.ell(16, 16, 6, 7, '#f2a23c');
      k.ell(17, 18, 3, 5, '#f8d88a');
      k.ell(12, 7, 5, 4, '#f2a23c');
      k.rect(4, 7, 5, 2, '#f2a23c');
      k.tri(14, 3, 20, 6, 15, 7, '#e8702a');
      eyes(k, 10, 5);
    },
    lanternfin(k) {
      k.tri(24, 17, 31, 11, 31, 23, '#3a4a6a');
      k.ell(15, 17, 11, 8, '#3a4a6a');
      for (const x of [10, 15, 20]) k.ell(x, 21, 1.4, 1.4, '#5fd8e8');
      k.rect(8, 4, 1, 6, '#3a4a6a'); k.ell(8, 4, 2.5, 2.5, '#fff6a0');
      eyes(k, 6, 13);
      k.rect(4, 19, 4, 1, INK);
    },
    schoolio(k) {
      for (const [x, y, c] of [[9, 9, '#4a9ae8'], [21, 9, '#4a9ae8'], [9, 22, '#4a9ae8'], [21, 22, '#4a9ae8'], [15, 15.5, '#f2c84b']]) {
        k.ell(x, y, 5, 3.5, c); k.tri(x + 4, y, x + 8, y - 3, x + 8, y + 3, c);
        if (c === '#f2c84b') eyes(k, x - 4, y - 2); else k.px(x - 3, y - 1, INK);
      }
    },
    prawnpairs(k) {
      for (const dx of [0, 13]) {
        k.ell(9 + dx, 18, 5, 8, '#f28a6a');
        k.ell(9 + dx, 18, 5, 8, '#e8604a', (x, y) => Math.floor(y) % 3 === 0);
        k.tri(7 + dx, 26, 11 + dx, 26, 9 + dx, 31, '#e8604a');
        k.rect(6 + dx, 3, 1, 8, '#e8604a'); k.rect(11 + dx, 3, 1, 8, '#e8604a');
        eyes(k, 6 + dx, 12);
      }
    },
    mantarray(k) {
      k.tri(16, 10, 0, 20, 16, 26, '#3a5a8a'); k.tri(16, 10, 32, 20, 16, 26, '#3a5a8a');
      k.ell(16, 18, 7, 8, '#3a5a8a');
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) k.ell(8 + c * 5.3, 18 + r * 3, 0.9, 0.9, '#c8e8ff');
      k.rect(15.5, 26, 1, 6, '#2a4a7a');
      eyes(k, 11, 12); eyes(k, 18, 12);
    },
    starsplit(k) {
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; k.tri(16 + Math.cos(a - 0.6) * 6, 17 + Math.sin(a - 0.6) * 6, 16 + Math.cos(a) * 15, 17 + Math.sin(a) * 15, 16 + Math.cos(a + 0.6) * 6, 17 + Math.sin(a + 0.6) * 6, '#e8706a'); }
      k.ell(16, 17, 7, 7, '#e8706a');
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; k.ell(16 + Math.cos(a) * 9, 17 + Math.sin(a) * 9, 1, 1, '#ffd0c0'); }
      eyes(k, 12, 14); eyes(k, 17, 14);
    },
    clamshare(k) {
      k.ell(16, 21, 13, 7, '#a888c8');
      k.ell(16, 21, 13, 7, '#c8a8e8', (x) => Math.floor(x) % 4 < 2);
      k.ell(16, 13, 12, 8, '#a888c8', (x, y) => y < 15);
      k.rect(4, 15, 24, 4, '#f8e8f0');
      for (const x of [8, 13, 18, 23]) k.ell(x, 17, 1.6, 1.6, '#fff');
      eyes(k, 11, 9); eyes(k, 18, 9);
    },
    narwhalf(k) {
      k.tri(1, 9, 9, 13, 9, 15, '#f4f0e0');
      k.tri(26, 20, 32, 14, 32, 26, '#7a9ac8');
      k.ell(17, 20, 12, 8, '#7a9ac8', (x) => x < 17);
      k.ell(17, 20, 12, 8, '#9ab8e0', (x) => x >= 17);
      k.ell(16, 24, 8, 3, '#e4ecf8');
      eyes(k, 9, 16);
      k.rect(16.5, 12, 1, 16, '#fff');
    },
    coralord(k) {
      k.rect(5, 6, 3, 10, '#f08a6a'); k.rect(24, 4, 3, 12, '#e86ab8'); k.rect(14, 1, 4, 8, '#f2a23c');
      k.ell(6.5, 5, 2.5, 2, '#f08a6a'); k.ell(25.5, 3, 2.5, 2, '#e86ab8');
      k.ell(16, 20, 13, 10, '#e8708a');
      k.ell(16, 22, 8, 6, '#f6b0c0');
      eyes(k, 10, 15); eyes(k, 19, 15);
      k.rect(14, 23, 5, 1, INK);
      k.ell(9, 30, 3.5, 1.5, '#c8506a'); k.ell(23, 30, 3.5, 1.5, '#c8506a');
    },
    kelpsquatch(k) {
      k.ell(16, 19, 12, 12, '#3a6a4a');
      for (const x of [6, 10, 22, 26]) k.rect(x, 4, 2, 14, '#2f7a4a');
      k.ell(16, 16, 8, 7, '#8a6a4a');
      eyes(k, 11, 13); eyes(k, 18, 13);
      k.rect(14, 19, 4, 1, INK);
      k.ell(9, 30, 4, 2, '#2a4a3a'); k.ell(23, 30, 4, 2, '#2a4a3a');
    },
    krakenumb(k) {
      for (let i = 0; i < 6; i++) { const x = 4 + i * 4.8; k.rect(x, 18, 3, 12, '#a04a6a'); k.ell(x + 1.5, 30, 2, 1.5, '#c86a8a'); }
      k.ell(16, 12, 11, 10, '#b85a7a');
      k.ell(13, 8, 4, 3, '#d88aa8');
      eyes(k, 10, 11); eyes(k, 19, 11);
      k.rect(13, 17, 6, 1, INK);
      k.rect(20, 4, 6, 2, '#2b2840'); k.rect(22, 1, 2, 3, '#2b2840');
    },
    abyssaur(k) {
      k.tri(24, 20, 32, 16, 31, 26, '#2a3a58');
      k.ell(18, 21, 11, 8, '#2a3a58');
      for (const x of [14, 19, 24]) k.ell(x, 17, 1.4, 1.4, '#5fd8e8');
      k.ell(8, 13, 7, 6, '#2a3a58');
      eyes(k, 3, 10); eyes(k, 8, 10);
      k.rect(2, 16, 9, 1, INK);
      for (const x of [3, 6, 9]) k.tri(x, 16, x + 2, 16, x + 1, 18, '#fff');
      k.ell(12, 29, 3, 2, '#1a2a40'); k.ell(23, 29, 3, 2, '#1a2a40');
    },
    tritonix(k) {
      k.rect(26, 2, 2, 28, '#c89a2a'); k.rect(23, 2, 8, 2, '#c89a2a'); k.rect(23, 0, 2, 4, '#c89a2a'); k.rect(29, 0, 2, 4, '#c89a2a');
      k.ell(14, 26, 10, 5, '#3ac4c8');
      k.tri(4, 26, 0, 31, 8, 30, '#2aa0a8');
      k.ell(14, 16, 7, 8, '#5ab8c8');
      k.ell(14, 8, 6, 5.5, '#5ab8c8');
      k.tri(9, 5, 10, 0, 13, 4, '#f2c84b'); k.tri(13, 4, 15, -1, 17, 4, '#f2c84b');
      eyes(k, 9, 7); eyes(k, 14, 7);
      k.rect(11, 12, 4, 1, INK);
    },
    leviathorn(k) {
      k.ell(24, 24, 7, 5, '#2a6a9a'); k.ell(14, 26, 8, 4, '#2a6a9a');
      k.ell(22, 14, 6, 7, '#2a7aaa');
      k.ell(10, 9, 8, 6, '#3a8aba');
      k.ell(10, 12, 5, 3, '#a8dcf0');
      for (const [x, c] of [[5, '#e8708a'], [9, '#f2a23c'], [13, '#e86ab8']]) k.rect(x, 0, 2, 5, c);
      eyes(k, 5, 7);
      k.rect(3, 13, 6, 1, INK);
      k.tri(28, 22, 32, 18, 32, 28, '#5fd8e8');
    },

    // ---------- Sky Isles
    fluffadd(k) {
      for (const x of [10, 14, 19, 23]) k.rect(x, 25, 2, 6, '#5a5a6a');
      k.ell(17, 18, 12, 9, '#f8f8ff');
      for (const [x, y] of [[8, 13], [14, 10], [21, 10], [26, 14], [26, 21], [8, 22]]) k.ell(x, y, 4, 3.5, '#ffffff');
      k.ell(8, 17, 5, 5, '#6a6a7a');
      k.ell(4, 14, 2, 1.4, '#6a6a7a');
      eyes(k, 4, 15); eyes(k, 8, 15);
      k.rect(16, 15, 1, 6, '#9ac8f4'); k.rect(13.5, 17.5, 6, 1, '#9ac8f4');
    },
    zapadd(k) {
      for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.9 + i * 0.32; k.tri(18 + Math.cos(a) * 6, 16 + Math.sin(a) * 6, 18 + Math.cos(a + 0.12) * 14, 16 + Math.sin(a + 0.12) * 14, 18 + Math.cos(a + 0.24) * 6, 16 + Math.sin(a + 0.24) * 6, '#f2c84b'); }
      k.ell(17, 20, 10, 8, '#f2d84b');
      k.ell(10, 19, 6, 5, '#fff2b8');
      eyes(k, 6, 16); eyes(k, 11, 16);
      k.px(5, 21, INK);
      k.tri(20, 18, 17, 24, 22, 22, '#e8702a');
      k.ell(10, 29, 2.5, 1.4, '#c8a020'); k.ell(22, 29, 2.5, 1.4, '#c8a020');
    },
    gustplus(k) {
      k.ell(14, 16, 10, 8, '#c8f0e8');
      k.ell(22, 12, 6, 5, '#c8f0e8');
      k.ell(24, 22, 6, 4, '#e0faf4');
      k.rect(3, 26, 10, 1, '#9ad8d0'); k.rect(18, 29, 10, 1, '#9ad8d0'); k.rect(6, 4, 8, 1, '#9ad8d0');
      eyes(k, 9, 13); eyes(k, 15, 13);
      k.rect(11, 19, 3, 1, INK);
      k.rect(22, 9, 1, 6, '#5fb84a'); k.rect(19.5, 11.5, 6, 1, '#5fb84a');
    },
    drizzless(k) {
      k.ell(16, 12, 12, 8, '#a8b8d0');
      k.ell(9, 13, 6, 5, '#a8b8d0'); k.ell(23, 13, 6, 5, '#a8b8d0');
      k.ell(16, 16, 10, 3, '#8a9ab8');
      eyes(k, 11, 10); eyes(k, 18, 10);
      k.rect(14, 16, 4, 1, INK);
      for (const [x, y] of [[8, 23], [14, 26], [20, 23], [25, 28]]) k.ell(x, y, 1.4, 2.2, '#6ab0f0');
    },
    plumeless(k) {
      k.rect(14, 26, 1, 5, '#e8a040'); k.rect(18, 26, 1, 5, '#e8a040');
      k.tri(22, 16, 32, 10, 28, 22, '#e88ab8');
      k.ell(17, 19, 9, 8, '#f4b8d4');
      k.ell(11, 11, 6, 5.5, '#f4b8d4');
      k.tri(10, 6, 9, 0, 13, 5, '#e86ab8');
      k.tri(5, 11, 0, 12, 5, 13, '#f2a23c');
      eyes(k, 7, 9);
      k.tri(26, 28, 28, 31, 30, 27, '#f4b8d4'); k.tri(4, 26, 6, 30, 8, 26, '#e88ab8');
    },
    fadebow(k) {
      const c = ['#e8506a', '#f2a23c', '#f2c84b', '#5fb84a', '#4a9ae8'];
      c.forEach((col, i) => k.ell(16, 24, 15 - i * 2, 15 - i * 2, col, (x, y) => y < 24));
      k.ell(16, 24, 5, 5, '#f4f0ff', (x, y) => y < 24);
      k.ell(3, 25, 3, 2.5, '#fff'); k.ell(29, 25, 3, 2.5, '#fff');
      eyes(k, 11, 14); eyes(k, 18, 14);
      k.rect(14, 20, 4, 1, INK);
    },
    kitebig(k) {
      k.tri(16, 1, 4, 13, 16, 26, '#e8506a'); k.tri(16, 1, 28, 13, 16, 26, '#4a9ae8');
      k.rect(15.5, 1, 1, 25, '#2b2840'); k.rect(4, 12.5, 24, 1, '#2b2840');
      eyes(k, 10, 9); eyes(k, 18, 9);
      k.rect(14, 17, 4, 1, INK);
      for (const [x, y, c] of [[17, 27, '#f2c84b'], [19, 29, '#5fb84a'], [22, 30, '#e8506a']]) k.tri(x, y, x + 2, y - 1, x + 2, y + 1, c);
    },
    starmore(k) {
      k.tri(16, 1, 11, 13, 21, 13, '#f2c84b'); k.tri(1, 12, 13, 18, 11, 12, '#f2c84b'); k.tri(31, 12, 21, 12, 19, 18, '#f2c84b');
      k.tri(6, 30, 12, 17, 16, 23, '#f2c84b'); k.tri(26, 30, 20, 17, 16, 23, '#f2c84b');
      k.ell(16, 16, 7, 7, '#f2c84b');
      k.ell(14, 13, 3, 2, '#fff2b8');
      eyes(k, 12, 13); eyes(k, 17, 13);
      k.rect(14, 19, 4, 1, INK);
    },
    boltbig(k) {
      k.tri(18, 0, 6, 16, 15, 16, '#f2c84b'); k.tri(15, 14, 26, 14, 12, 32, '#f2c84b');
      k.ell(14, 15, 7, 6, '#f2d84b');
      eyes(k, 9, 12); eyes(k, 15, 12);
      k.rect(11, 18, 5, 1, INK);
      k.px(4, 4, '#fff6c0'); k.px(27, 8, '#fff6c0');
    },
    goosegroup(k) {
      for (const [x, y] of [[7, 22], [12, 16], [17, 10], [22, 16], [27, 22]]) {
        k.ell(x, y, 3.5, 2.5, '#f4f4f8'); k.tri(x - 3, y, x, y - 5, x + 1, y, '#d8d8e4');
        k.tri(x - 5, y, x - 3, y - 1, x - 3, y + 1, '#f2a23c'); k.px(x - 2, y - 1, INK);
      }
      eyes(k, 13, 13);
    },
    pinwheelie(k) {
      k.rect(15, 16, 2, 15, '#a07a4a');
      k.tri(16, 15, 16, 2, 26, 8, '#e8506a'); k.tri(16, 15, 29, 15, 23, 25, '#4a9ae8');
      k.tri(16, 15, 16, 28, 6, 22, '#f2c84b'); k.tri(16, 15, 3, 15, 9, 5, '#5fb84a');
      k.ell(16, 15, 4, 4, '#f4f4f8');
      k.px(15, 14, INK); k.px(17, 14, INK); k.rect(15, 16, 3, 1, INK);
    },
    hailgroup(k) {
      k.ell(16, 11, 12, 7, '#8a9ab8'); k.ell(9, 12, 6, 5, '#8a9ab8'); k.ell(23, 12, 6, 5, '#8a9ab8');
      eyes(k, 11, 9); eyes(k, 18, 9);
      k.rect(14, 15, 4, 1, INK);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) k.ell(8 + c * 5.3, 21 + r * 4, 1.6, 1.6, '#e8f4ff');
    },
    cloudsplit(k) {
      k.ell(16, 13, 10, 7, '#f4f8ff'); k.ell(10, 15, 6, 5, '#f4f8ff'); k.ell(22, 15, 6, 5, '#f4f8ff');
      k.ell(16, 17, 9, 3, '#dce6f8');
      eyes(k, 11, 11); eyes(k, 18, 11);
      k.rect(15, 16, 2, 1, INK);
      k.ell(6, 27, 4, 2.5, '#f4f8ff'); k.ell(16, 28, 4, 2.5, '#f4f8ff'); k.ell(26, 27, 4, 2.5, '#f4f8ff');
    },
    prismshare(k) {
      for (const [y, c] of [[18, '#e8506a'], [20, '#f2c84b'], [22, '#5fb84a'], [24, '#4a9ae8']]) k.tri(20, 18, 32, y - 3, 32, y, c);
      k.tri(4, 28, 24, 28, 14, 4, '#d8f0fa');
      k.tri(9, 28, 24, 28, 16.5, 10, '#b8e0f4');
      k.rect(0, 15, 9, 1, '#fff6c0');
      eyes(k, 10, 18); eyes(k, 15, 18);
      k.rect(12, 24, 4, 1, INK);
    },
    sailsplit(k) {
      k.ell(16, 26, 13, 4, '#a07a4a', (x, y) => y > 24);
      k.rect(3, 24, 26, 2, '#8a5a32');
      k.rect(15.5, 4, 1, 21, '#5a3418');
      k.tri(16, 4, 16, 22, 4, 22, '#f4f4f8'); k.tri(17, 6, 17, 22, 28, 22, '#e8e4f4');
      k.rect(16, 4, 7, 4, '#a07ae8');
      eyes(k, 9, 15);
      k.ell(4, 29, 2, 1, '#9ac8f4');
    },
    cloudram(k) {
      for (const x of [9, 13, 20, 24]) k.rect(x, 25, 3, 6, '#4a4a5a');
      k.ell(17, 18, 13, 10, '#f8f8ff');
      for (const [x, y] of [[7, 12], [13, 8], [21, 8], [28, 13], [28, 22], [7, 23]]) k.ell(x, y, 5, 4, '#ffffff');
      k.ell(8, 17, 6, 6, '#4a4a5a');
      k.ell(8, 10, 5, 4, '#c8a050', (x, y) => y < 11); k.ell(6, 11, 2, 2, '#e2c070');
      eyes(k, 4, 15); eyes(k, 9, 15);
      k.rect(5, 21, 4, 1, '#f4f4f8');
    },
    gustgiant(k) {
      k.ell(16, 18, 13, 12, '#b8e8e0');
      k.ell(16, 18, 13, 12, '#d8f8f0', (x, y) => (Math.floor(x + y) % 6) < 2);
      for (const [x, y] of [[2, 8], [4, 28], [28, 6], [29, 26]]) k.rect(x, y, 6, 1, '#9ad8d0');
      eyes(k, 10, 13); eyes(k, 19, 13);
      k.ell(16, 22, 4, 3, '#2b2840');
      k.ell(16, 22, 2.5, 1.8, '#5a8a9a');
    },
    prismadon(k) {
      k.tri(24, 22, 32, 18, 31, 28, '#b8a8e8');
      for (const [x, c] of [[12, '#e8506a'], [17, '#f2c84b'], [22, '#4a9ae8']]) k.tri(x - 3, 13, x, 4, x + 3, 13, c);
      k.ell(17, 20, 11, 8, '#c8b8f0');
      k.ell(17, 22, 7, 4, '#e8e0fa');
      k.ell(7, 15, 6, 5, '#c8b8f0');
      eyes(k, 3, 12); eyes(k, 8, 12);
      k.rect(2, 18, 6, 1, INK);
      k.ell(11, 29, 3, 2, '#a898d8'); k.ell(23, 29, 3, 2, '#a898d8');
    },
    thundroar(k) {
      k.tri(25, 20, 32, 14, 30, 26, '#3a3a58');
      k.ell(17, 21, 11, 8, '#4a4a6a');
      k.tri(15, 14, 12, 22, 18, 20, '#f2c84b'); k.tri(22, 15, 20, 24, 26, 20, '#f2c84b');
      k.ell(9, 13, 8, 7, '#5a5a7a');
      k.ell(9, 13, 9.5, 8.5, '#f2c84b', (x, y) => (Math.floor(x * 2 + y) % 5) === 0);
      eyes(k, 4, 10); eyes(k, 10, 10);
      k.rect(4, 17, 8, 1, INK);
      k.ell(12, 29, 3, 2, '#2a2a40'); k.ell(23, 29, 3, 2, '#2a2a40');
    },
    crowncrane(k) {
      k.rect(14, 22, 1, 9, '#2b2840'); k.rect(19, 22, 1, 9, '#2b2840');
      k.ell(18, 18, 9, 6, '#f4f4f8');
      k.tri(20, 14, 32, 10, 26, 22, '#f4f4f8'); k.tri(24, 18, 32, 20, 26, 24, '#2b2840');
      k.rect(9, 6, 3, 12, '#f4f4f8');
      k.ell(10, 6, 4, 3.5, '#f4f4f8');
      k.ell(10, 3, 2.5, 1.5, '#e8304a');
      k.tri(6, 2, 8, -1, 9, 2, '#f2c84b'); k.tri(10, 1, 12, -2, 13, 2, '#f2c84b');
      k.tri(7, 6, 0, 7, 7, 8, '#2b2840');
      eyes(k, 8, 4);
    },
    celestail(k) {
      for (const [x, y] of [[27, 27], [30, 23], [24, 30], [29, 30]]) { k.rect(x - 1, y, 3, 1, '#f2c84b'); k.rect(x, y - 1, 1, 3, '#f2c84b'); }
      k.ell(22, 22, 7, 5, '#5a4ab8'); k.ell(14, 25, 7, 4, '#6a5ac8');
      k.ell(20, 13, 6, 7, '#7a6ad8');
      k.ell(10, 9, 7, 6, '#8a7ae8');
      k.ell(10, 12, 4, 2.5, '#d8d0ff');
      k.tri(9, 4, 7, -1, 12, 3, '#f2c84b'); k.tri(13, 4, 15, -1, 16, 4, '#f2c84b');
      for (const [x, y] of [[19, 11], [22, 15], [17, 16]]) k.px(x, y, '#fff');
      eyes(k, 5, 7);
      k.rect(3, 13, 5, 1, INK);
    },

    // ---------- Grade ultra rares
    glimmerdot(k) {
      for (const x of [9, 16, 23]) k.rect(x, 26, 1, 4, INK);
      k.ell(16, 20, 12, 10, '#e8304a');
      k.ell(13, 16, 5, 3, '#ff6a7a');
      k.rect(15.5, 11, 1, 19, INK);
      for (const [x, y] of [[9, 16], [12, 22], [8, 24], [12, 27], [10, 19], [23, 16], [20, 22], [24, 24], [20, 27], [22, 19]]) k.ell(x, y, 1.4, 1.4, '#fff');
      k.ell(16, 10, 7, 5, INK);
      k.rect(11, 2, 1, 5, INK); k.rect(20, 2, 1, 5, INK);
      k.ell(11.5, 2, 2, 2, '#f2c84b'); k.ell(20.5, 2, 2, 2, '#f2c84b');
      eyes(k, 11, 8); eyes(k, 17, 8);
    },
    plushbloom(k) {
      k.rect(15, 19, 2, 10, '#3f8f3a');
      k.ell(10, 24, 4.5, 2, '#4fa84a'); k.ell(22, 22, 4.5, 2, '#4fa84a');
      k.ell(16, 30, 7, 2, '#8a5a32');
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        k.ell(16 + Math.cos(a) * 8, 12 + Math.sin(a) * 8, 3.4, 3.4, i % 2 ? '#f2c84b' : '#ffdc5a');
      }
      k.ell(16, 12, 6.5, 6.5, '#a86a32');
      eyes(k, 12, 9); eyes(k, 17, 9);
      k.rect(14, 15, 4, 1, INK);
      k.px(11, 14, '#f59aa0'); k.px(21, 14, '#f59aa0');
    },
    hopscotchy(k) {
      k.tri(22, 22, 32, 30, 22, 28, '#c88a4a');
      k.ell(11, 30, 4.5, 1.6, '#a8703a'); k.ell(21, 30, 4.5, 1.6, '#a8703a');
      k.ell(17, 21, 8, 9, '#d89a5a');
      k.ell(17, 23, 4.5, 4, '#f0c890');
      k.ell(17, 22, 2.5, 1.6, '#c88a4a');
      k.tri(9, 8, 8, 0, 12, 6, '#d89a5a'); k.tri(14, 7, 15, 0, 17, 7, '#d89a5a');
      k.ell(11, 10, 6, 5.5, '#d89a5a');
      eyes(k, 7, 8); eyes(k, 12, 8);
      k.ell(6, 12, 1.4, 1, INK);
      k.rect(8, 14, 3, 1, INK);
    },
    tentails(k) {
      // Ten thin tails fanned out like a peacock, each with a white tip.
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI * 0.95 + (i / 9) * Math.PI * 1.05;
        for (let r = 3; r <= 11; r += 1.5) k.ell(20 + Math.cos(a) * r, 19 + Math.sin(a) * r, 1.3, 1.3, '#f08a3c');
        k.ell(20 + Math.cos(a) * 12, 19 + Math.sin(a) * 12, 1.6, 1.6, '#fff6e0');
      }
      k.ell(13, 22, 8, 7, '#f08a3c');
      k.ell(13, 24, 4.5, 4, '#fff6e0');
      k.tri(6, 10, 7, 1, 11, 7, '#f08a3c'); k.tri(13, 7, 17, 1, 18, 9, '#f08a3c');
      k.ell(12, 13, 6.5, 5.5, '#f08a3c');
      k.ell(10, 15, 4, 2.5, '#fff6e0');
      eyes(k, 8, 11); eyes(k, 13, 11);
      k.px(7, 15, INK);
      k.ell(9, 30, 2.5, 1.4, '#c8642a'); k.ell(17, 30, 2.5, 1.4, '#c8642a');
    },
    mirrowl(k) {
      k.tri(6, 10, 7, 1, 12, 8, '#7a5ab8'); k.tri(26, 10, 25, 1, 20, 8, '#3ac4a8');
      k.ell(16, 18, 11, 11.5, '#9a7ad8', (x) => x < 16);
      k.ell(16, 18, 11, 11.5, '#5ad8c0', (x) => x >= 16);
      k.ell(16, 23, 6.5, 6, '#f4f0ff');
      k.ell(11, 13, 4, 4, '#fff'); k.ell(21, 13, 4, 4, '#fff');
      if (blinking) { k.rect(8, 13, 6, 1, INK); k.rect(18, 13, 6, 1, INK); }
      else { k.ell(10, 13.5, 2, 2.2, INK); k.ell(20, 13.5, 2, 2.2, INK); }
      k.tri(15, 16, 17, 16, 16, 19, '#f2a23c');
      k.rect(16, 6, 0.6, 24, '#ffffff');
      k.rect(12, 29, 3, 2, '#f2a23c'); k.rect(17, 29, 3, 2, '#f2a23c');
    },
    riddlynx(k) {
      k.rect(25, 10, 2, 10, '#6a7aa8'); k.ell(24, 9, 4, 3, '#6a7aa8'); k.rect(20, 7, 4, 2, '#6a7aa8');
      k.ell(26, 23, 1.6, 1.6, '#6a7aa8');
      k.ell(15, 22, 9, 7.5, '#8a9ac8');
      k.ell(15, 24, 5, 4, '#e0e6f8');
      k.tri(6, 10, 6, 1, 11, 8, '#8a9ac8'); k.tri(14, 8, 17, 1, 18, 10, '#8a9ac8');
      k.rect(6, 0, 1, 3, INK); k.rect(17, 0, 1, 3, INK);
      k.ell(12, 13, 6.5, 5.5, '#8a9ac8');
      k.ell(12, 16, 4, 2.5, '#e0e6f8');
      if (blinking) { k.rect(8, 12, 3, 1, INK); k.rect(13, 12, 3, 1, INK); }
      else { k.rect(8, 10, 3, 4, '#f2c84b'); k.rect(8, 11, 1, 3, INK); k.rect(13, 10, 3, 4, '#f2c84b'); k.rect(13, 11, 1, 3, INK); }
      k.px(11, 15, '#e8506a');
    },
    hundrake(k) {
      k.tri(18, 14, 30, 4, 28, 18, '#2a7a6a'); k.tri(20, 16, 29, 10, 27, 20, '#3ac4a8');
      k.tri(24, 24, 32, 28, 24, 28, '#2a7a6a');
      k.ell(17, 21, 10, 8, '#3a9a8a');
      k.ell(17, 22, 6.5, 5.5, '#f6ecd8');
      k.rect(11, 18, 12, 2, '#4a7ae8'); k.rect(11, 21, 12, 2, '#e8506a'); k.rect(11, 24, 12, 2, '#f2c84b');
      k.ell(9, 12, 6.5, 5.5, '#3a9a8a');
      k.tri(8, 7, 7, 1, 11, 6, '#f2c84b'); k.tri(12, 7, 14, 2, 15, 8, '#f2c84b');
      eyes(k, 5, 10); eyes(k, 10, 10);
      k.px(3, 14, INK); k.rect(4, 15, 4, 1, INK);
      k.ell(12, 29, 2.5, 1.4, '#2a7a6a'); k.ell(22, 29, 2.5, 1.4, '#2a7a6a');
    },
    arraycorn(k) {
      for (const x of [12, 16, 22, 26]) k.rect(x, 24, 2, 7, '#e8e4f4');
      k.ell(20, 20, 10, 6.5, '#ffffff');
      k.ell(20, 22, 7, 3, '#f0ecfa');
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) k.rect(28 + c * 2, 15 + r * 2, 1.6, 1.6, ['#e8506a', '#f2c84b', '#4a9ae8'][r]);
      k.rect(10, 9, 5, 9, '#ffffff');
      k.ell(9, 9, 5, 4.5, '#ffffff');
      k.ell(5, 11, 3, 2.5, '#f6eef8');
      for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) k.rect(13 + c * 2, 6 + r * 2.5, 1.6, 1.8, ['#e8506a', '#f2c84b', '#4a9ae8', '#5fb84a'][r]);
      k.tri(7, 6, 6, -1, 9, 5, '#f2c84b');
      eyes(k, 7, 8);
      k.px(4, 11, INK);
    },
    halfmoon(k) {
      k.tri(9, 11, 8, 0, 13, 9, '#f6e8b0'); k.tri(19, 9, 22, 0, 24, 11, '#4a4a8a');
      k.ell(16, 19, 10.5, 10, '#f6e8b0', (x) => x < 16);
      k.ell(16, 19, 10.5, 10, '#4a4a8a', (x) => x >= 16);
      k.px(21, 14, '#fff6d6'); k.px(24, 21, '#fff6d6'); k.px(19, 25, '#fff6d6');
      eyes(k, 11, 15); eyes(k, 18, 15);
      k.rect(15, 21, 2, 1, INK);
      k.ell(11, 29, 3, 1.5, '#d8c890'); k.ell(21, 29, 3, 1.5, '#3a3a6a');
      k.tri(27, 3, 29, 7, 25, 7, '#f2c84b');
    },
    timesphinx(k) {
      k.tri(26, 22, 32, 18, 31, 24, '#c8903a');
      k.ell(19, 23, 11, 6, '#e0b060');
      k.ell(8, 28, 4, 1.8, '#c8903a'); k.ell(15, 28, 4, 1.8, '#c8903a');
      k.tri(4, 12, 18, 12, 6, 26, '#3a6ab8');
      k.tri(4, 12, 18, 12, 6, 26, '#f2c84b', (x, y) => Math.floor(y) % 4 < 2);
      k.ell(11, 13, 6, 6, '#e0b060');
      k.rect(5, 7, 12, 3, '#3a6ab8'); k.rect(5, 7, 12, 1, '#f2c84b');
      eyes(k, 7, 11); eyes(k, 12, 11);
      k.rect(9, 16, 3, 1, INK);
      k.rect(19, 20, 1, 1, '#8a5a1a'); k.rect(21, 20, 1, 1, '#8a5a1a'); k.rect(20, 21, 1, 1, '#8a5a1a'); k.rect(19, 22, 1, 1, '#8a5a1a'); k.rect(21, 22, 1, 1, '#8a5a1a');
    },
    dividolphin(k) {
      k.tri(26, 18, 32, 11, 32, 25, '#3a78c4');
      k.tri(15, 12, 20, 4, 21, 13, '#3a78c4');
      k.ell(16, 19, 12, 7, '#5aa8e8');
      k.ell(15, 22, 9, 3.5, '#d4f0ff');
      k.ell(4, 20, 3.5, 2, '#5aa8e8');
      eyes(k, 8, 15);
      k.rect(2, 21, 4, 1, INK);
      k.ell(19, 15, 1, 1, '#fff'); k.rect(17, 17, 5, 1, '#fff'); k.ell(19, 19, 1, 1, '#fff');
      k.ell(8, 30, 1.4, 1.8, '#9ad4f4'); k.ell(24, 30, 1.4, 1.8, '#9ad4f4');
    },
    rolypolar(k) {
      k.ell(8, 9, 3, 3, '#f4f8ff'); k.ell(24, 9, 3, 3, '#f4f8ff');
      k.ell(8, 9, 1.5, 1.5, '#c8d8ec'); k.ell(24, 9, 1.5, 1.5, '#c8d8ec');
      k.ell(16, 19, 12.5, 11.5, '#f4f8ff');
      k.ell(20, 22, 7, 7, '#e0e8f4');
      k.ell(14, 19, 4.5, 3.5, '#e8eef8');
      k.ell(14, 18, 1.8, 1.3, INK);
      eyes(k, 9, 13); eyes(k, 17, 13);
      k.rect(13, 21, 3, 1, INK);
      k.ell(8, 27, 3.5, 2.5, '#e0e8f4'); k.ell(24, 27, 3.5, 2.5, '#e0e8f4');
    },
    blazemult(k) {
      k.tri(16, 24, 28, 31, 22, 22, '#f2c84b'); k.tri(16, 24, 10, 31, 12, 22, '#e8702a');
      k.tri(14, 14, 0, 6, 6, 22, '#e8502a'); k.tri(18, 14, 32, 6, 26, 22, '#e8502a');
      k.tri(14, 15, 3, 10, 8, 20, '#f2a23c'); k.tri(18, 15, 29, 10, 24, 20, '#f2a23c');
      k.ell(16, 18, 6, 7, '#e8502a');
      k.ell(16, 20, 3.5, 4, '#f2c84b');
      k.tri(14, 6, 15, 0, 17, 6, '#f2c84b'); k.tri(16, 6, 19, 1, 19, 7, '#e8702a');
      k.ell(16, 10, 4.5, 4.5, '#e8502a');
      eyes(k, 12, 8); eyes(k, 17, 8);
      k.tri(14, 12, 18, 12, 16, 15, '#f2c84b');
    },
    pizzapup(k) {
      k.tri(24, 20, 30, 14, 28, 22, '#c89a60');
      k.ell(16, 22, 9, 8, '#e8c890');
      k.ell(8, 13, 3, 5.5, '#a8784a'); k.ell(24, 13, 3, 5.5, '#a8784a');
      k.ell(16, 12, 7, 6, '#e8c890');
      k.ell(16, 15, 3.5, 2.5, '#f4e0c0');
      k.ell(16, 13.5, 1.5, 1.2, INK);
      eyes(k, 11, 9); eyes(k, 18, 9);
      k.ell(16, 23, 5.5, 5.5, '#c8843a'); k.ell(16, 23, 4.5, 4.5, '#f2c84b');
      k.rect(15.5, 18.5, 1, 9, '#c8843a'); k.rect(11.5, 22.5, 9, 1, '#c8843a');
      k.ell(14, 21, 0.9, 0.9, '#e8304a'); k.ell(18, 25, 0.9, 0.9, '#e8304a'); k.ell(18, 21, 0.9, 0.9, '#e8304a'); k.ell(14, 25, 0.9, 0.9, '#e8304a');
      k.ell(11, 30, 2.5, 1.4, '#c89a60'); k.ell(21, 30, 2.5, 1.4, '#c89a60');
    },
    roundolith(k) {
      k.ell(16, 19, 13.5, 11.5, '#8a8a9a');
      k.ell(11, 14, 6, 3, '#a8a8b8');
      k.ell(16, 9, 9, 3, '#4fa84a');
      k.ell(16, 21, 5.5, 5.5, '#5fd8e8'); k.ell(16, 21, 4, 4, '#8a8a9a');
      k.rect(15.5, 17, 1, 8, '#5fd8e8');
      eyes(k, 9, 14); eyes(k, 20, 14);
      k.ell(8, 30, 3.5, 1.6, '#6a6a7a'); k.ell(24, 30, 3.5, 1.6, '#6a6a7a');
    },
    decimeow(k) {
      k.rect(22, 22, 6, 2, '#9a8ab0'); k.ell(28, 18, 2, 4.5, '#9a8ab0');
      k.ell(28, 15, 1.2, 1.2, '#f2c84b'); k.ell(26, 23, 1.2, 1.2, '#f2c84b');
      k.ell(15, 22, 8, 7, '#9a8ab0');
      k.ell(15, 24, 4.5, 4, '#e8e0f4');
      k.tri(7, 10, 8, 2, 12, 8, '#9a8ab0'); k.tri(16, 8, 20, 2, 21, 10, '#9a8ab0');
      k.ell(14, 12, 7, 6, '#9a8ab0');
      k.ell(14, 7.5, 1.8, 1.8, '#f2c84b');
      eyes(k, 9, 11); eyes(k, 15, 11);
      k.px(13, 15, '#f59aa0'); k.rect(12, 16, 3, 1, INK);
      k.ell(10, 30, 2.5, 1.4, '#7a6a90'); k.ell(19, 30, 2.5, 1.4, '#7a6a90');
    },
    griffinity(k) {
      k.tri(25, 20, 32, 16, 30, 24, '#b8884a');
      for (const x of [14, 18, 23, 27]) k.rect(x, 24, 2, 7, '#c89a5a');
      k.ell(20, 20, 9, 6.5, '#d8a860');
      k.tri(16, 16, 30, 4, 28, 20, '#7a5a3a'); k.tri(18, 17, 29, 9, 26, 21, '#a07a4a');
      k.ell(11, 11, 6, 5.5, '#ffffff');
      k.ell(13, 15, 4, 3, '#f0f0f6');
      k.tri(5, 11, 1, 13, 5, 15, '#f2c84b');
      eyes(k, 7, 9);
      k.tri(9, 6, 11, 2, 13, 6, '#ffffff');
    },
    piewyvern(k) {
      k.tri(25, 22, 32, 28, 24, 28, '#7a4ab8');
      k.tri(15, 16, 6, 4, 13, 20, '#b88ae8'); k.tri(22, 16, 31, 6, 26, 20, '#b88ae8');
      k.ell(17, 22, 9, 7, '#9a6ad8');
      k.ell(17, 24, 5, 3.5, '#e8dcf8');
      k.ell(19, 14, 5.5, 2.6, '#c8843a'); k.ell(19, 13.5, 4.5, 1.8, '#e8a868');
      k.rect(18.5, 11.5, 1, 4, '#c8843a'); k.rect(15, 13.5, 8, 1, '#c8843a');
      k.ell(8, 14, 5, 4.5, '#9a6ad8');
      k.tri(7, 10, 5, 5, 10, 10, '#7a4ab8');
      eyes(k, 4, 12);
      k.rect(3, 16, 3, 1, INK);
      k.ell(12, 29, 2.5, 1.4, '#7a4ab8'); k.ell(21, 29, 2.5, 1.4, '#7a4ab8');
    },

    // ---------- World Legends and the mythical
    equalion(k) {
      k.tri(27, 20, 32, 14, 31, 24, '#c88a3a'); k.ell(31, 13, 1.6, 2, '#a86a2a');
      for (const x of [17, 21, 25, 28]) k.rect(x, 24, 2.4, 7, '#e8b860');
      k.ell(22, 21, 9, 6, '#f2c870');
      k.ell(12, 14, 10.5, 10.5, '#d88a2a');
      k.rect(5, 10, 14, 2, '#ffe08a'); k.rect(5, 17, 14, 2, '#ffe08a');
      k.ell(11, 15, 6, 6, '#f2c870');
      k.ell(9, 18, 3, 2, '#fff0c8');
      eyes(k, 6, 12); eyes(k, 12, 12);
      k.ell(8, 17, 1.4, 1, INK);
      k.tri(9, 3, 11, -1, 13, 3, '#f2c84b'); k.tri(5, 4, 6, 0, 9, 4, '#f2c84b'); k.tri(13, 4, 16, 0, 17, 4, '#f2c84b');
    },
    whisperstag(k) {
      for (const x of [16, 20, 25, 28]) k.rect(x, 24, 2, 7, '#8a5a32');
      k.ell(22, 21, 9, 6, '#a8784a');
      k.ell(21, 19, 1, 1, '#fff6e0'); k.ell(25, 21, 1, 1, '#fff6e0'); k.ell(19, 22, 1, 1, '#fff6e0');
      k.rect(11, 12, 4, 9, '#a8784a');
      k.ell(10, 12, 5, 4, '#a8784a');
      k.ell(6, 14, 2.5, 2, '#c89a6a');
      k.rect(8, 2, 1, 8, '#6a4a2a'); k.rect(5, 4, 3, 1, '#6a4a2a'); k.rect(13, 1, 1, 9, '#6a4a2a'); k.rect(14, 3, 3, 1, '#6a4a2a');
      k.ell(5, 3, 2, 1.5, '#5fb84a'); k.ell(8, 1, 2, 1.5, '#4fa84a'); k.ell(13, 0.5, 2, 1.5, '#5fb84a'); k.ell(17, 2.5, 2, 1.5, '#4fa84a');
      k.tri(14, 8, 18, 6, 16, 10, '#a8784a');
      eyes(k, 6, 10);
      k.px(4, 14, INK);
    },
    infinix(k) {
      k.tri(26, 17, 31, 13, 31, 21, '#5fd8e8');
      k.ell(10, 18, 7, 6.5, '#7a5ad8'); k.ell(21, 18, 7, 6.5, '#7a5ad8');
      k.ell(10, 18, 3.5, 3, '#c8b8ff'); k.ell(21, 18, 3.5, 3, '#c8b8ff');
      k.ell(15.5, 18, 3, 2.5, '#9a7af0');
      for (const [x, y] of [[9, 17], [21, 19], [20, 16], [11, 19]]) k.px(x, y, '#ffffff');
      k.ell(6, 9, 5, 4.5, '#7a5ad8');
      k.tri(3, 6, 2, 1, 6, 5, '#7a5ad8'); k.tri(7, 5, 10, 1, 10, 6, '#7a5ad8');
      eyes(k, 2, 7); eyes(k, 7, 7);
      k.px(5, 12, '#f2c84b');
      for (const [x, y] of [[16, 6], [26, 8], [4, 28], [25, 28]]) { k.px(x, y, '#f2c84b'); k.px(x - 1, y, '#fff6d6'); k.px(x + 1, y, '#fff6d6'); }
    },
  };

  // These were drawn facing right; they're mirrored so every Legend faces left.
  const FACES_RIGHT = new Set(['tallytoise', 'toucount']);
  function mirrored(c) {
    if (!FACES_RIGHT.has(c.id)) return c.img;
    const m = canvas(c.img.width, c.img.height), g = m.getContext('2d');
    g.translate(m.width, 0);
    g.scale(-1, 1);
    g.drawImage(c.img, 0, 0);
    return m;
  }

  // Golden Legends: the same art in shades of gold. Outlines and eye whites stay put.
  function goldify(src) {
    const c = canvas(src.width, src.height), g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    const img = g.getImageData(0, 0, c.width, c.height), d = img.data;
    const ramp = [[122, 74, 16], [224, 160, 32], [255, 242, 168]];
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const [r, gg, b] = [d[i], d[i + 1], d[i + 2]];
      if (r < 70 && gg < 70 && b < 90) continue;
      if (r > 235 && gg > 235 && b > 235) continue;
      const t = Math.min(1, (0.3 * r + 0.59 * gg + 0.11 * b) / 230);
      const [lo, hi, f] = t < 0.5 ? [ramp[0], ramp[1], t * 2] : [ramp[1], ramp[2], (t - 0.5) * 2];
      for (let k = 0; k < 3; k++) d[i + k] = Math.round(lo[k] + (hi[k] - lo[k]) * f);
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  const creatureCache = {};
  function creature(id, blink = false, golden = false) {
    const key = id + (blink ? ':blink' : '') + (golden ? ':gold' : '');
    if (!creatureCache[key]) {
      if (golden) creatureCache[key] = goldify(creature(id, blink));
      else {
        const c = canvas(48, 48);
        blinking = blink;
        CREATURES[id](kit(c, 1.5));
        blinking = false;
        creatureCache[key] = mirrored({ id, img: outline(c) });
      }
    }
    return creatureCache[key];
  }

  // A small 20px version for walking around the map, with a hop frame.
  const smallCache = {};
  function creatureSmall(id, frame, golden = false) {
    if (golden) {
      const key = id + frame + ':gold';
      return smallCache[key] || (smallCache[key] = goldify(creatureSmall(id, frame)));
    }
    const key = id + frame;
    if (!smallCache[key]) {
      const c = canvas(20, 20);
      const inner = canvas(20, 20);
      CREATURES[id](kit(inner, 18 / 32));
      outline(inner);
      c.getContext('2d').drawImage(mirrored({ id, img: inner }), 0, frame ? 0 : 1);
      smallCache[key] = c;
    }
    return smallCache[key];
  }

  const urlCache = {};
  function creatureURL(id, golden = false) {
    const key = id + (golden ? ':gold' : '');
    return urlCache[key] || (urlCache[key] = creature(id, false, golden).toDataURL());
  }

  const platformCache = {};
  function platform(rx, ry, dark = '#a8c878', light = '#c4dc94') {
    const key = rx + 'x' + ry + dark;
    if (!platformCache[key]) {
      const c = canvas(rx * 2, ry * 2), k = kit(c);
      k.ell(rx, ry, rx, ry, dark);
      k.ell(rx, ry - 1, rx - 3, ry - 2, light);
      platformCache[key] = c;
    }
    return platformCache[key];
  }

  // A world portal on the ground: a glowing ring in the world's color that
  // swirls when awake, and a dark stone ring when asleep.
  const portalCache = {};
  function portal(color, frame, awake) {
    const key = color + frame + awake;
    if (!portalCache[key]) {
      const c = canvas(16, 16), k = kit(c);
      k.ell(8, 9, 7.5, 6, '#2b2840');
      if (awake) {
        k.ell(8, 9, 6.5, 5, color);
        k.ell(8, 9, 4.5, 3.4, shade(color, 1.35));
        k.ell(8, 9, 2.4, 1.8, '#ffffff');
        const a = frame * Math.PI / 2;
        k.rect(8 + Math.round(Math.cos(a) * 5) - 1, 9 + Math.round(Math.sin(a) * 3.6) - 1, 2, 2, '#ffffff');
      } else {
        k.ell(8, 9, 6.5, 5, '#6a6488');
        k.ell(8, 9, 4.5, 3.4, '#4a4566');
      }
      portalCache[key] = c;
    }
    return portalCache[key];
  }

  return { tile, person, creature, creatureSmall, creatureURL, platform, portal };
})();
