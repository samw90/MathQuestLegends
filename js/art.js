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
    w: wall,
    W: (k) => {
      wall(k);
      k.rect(3, 3, 10, 8, '#5a4030');
      k.rect(4, 4, 8, 6, '#8fd3f7');
      k.rect(4, 4, 3, 2, '#d4f1ff');
      k.rect(7, 4, 1, 6, '#5a4030');
      k.rect(4, 7, 8, 1, '#5a4030');
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

  function eyes(k, x, y) {
    k.rect(x, y, 3, 4, '#fff');
    k.rect(x + 1, y + 1, 2, 3, INK);
    k.px(x + 1, y + 1, '#fff');
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
      k.ell(12, 13.5, 2, 2.2, INK); k.ell(20, 13.5, 2, 2.2, INK);
      k.px(11, 12, '#fff'); k.px(19, 12, '#fff');
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
      k.ell(13.2, 9, 1.3, 1.5, INK); k.ell(20.2, 9, 1.3, 1.5, INK);
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
  };

  const creatureCache = {};
  function creature(id) {
    if (!creatureCache[id]) {
      const c = canvas(48, 48);
      CREATURES[id](kit(c, 1.5));
      creatureCache[id] = outline(c);
    }
    return creatureCache[id];
  }

  // A small 20px version for walking around the map, with a hop frame.
  const smallCache = {};
  function creatureSmall(id, frame) {
    const key = id + frame;
    if (!smallCache[key]) {
      const c = canvas(20, 20);
      const inner = canvas(20, 20);
      CREATURES[id](kit(inner, 18 / 32));
      outline(inner);
      c.getContext('2d').drawImage(inner, 0, frame ? 0 : 1);
      smallCache[key] = c;
    }
    return smallCache[key];
  }

  const urlCache = {};
  function creatureURL(id) {
    return urlCache[id] || (urlCache[id] = creature(id).toDataURL());
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

  return { tile, person, creature, creatureSmall, creatureURL, platform };
})();
