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
    g: (k) => {
      k.rect(0, 0, 16, 16, '#ead7a0');
      k.rect(1, 2, 2, 13, '#6b4423');
      k.rect(13, 2, 2, 13, '#6b4423');
      k.rect(0, 4, 16, 6, '#f2c84b');
      for (let x = 1; x < 16; x += 5) k.rect(x, 4, 2, 6, INK);
      k.rect(0, 4, 16, 1, '#6b4423');
      k.rect(0, 9, 16, 1, '#6b4423');
    },
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
  function platform(rx, ry) {
    const key = rx + 'x' + ry;
    if (!platformCache[key]) {
      const c = canvas(rx * 2, ry * 2), k = kit(c);
      k.ell(rx, ry, rx, ry, '#a8c878');
      k.ell(rx, ry - 1, rx - 3, ry - 2, '#c4dc94');
      platformCache[key] = c;
    }
    return platformCache[key];
  }

  return { tile, person, creature, creatureSmall, creatureURL, platform };
})();
