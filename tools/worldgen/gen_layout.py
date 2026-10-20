"""Seeded layout generator for area maps.

Every area gets its own size, a winding path from the bottom gate to the top gate,
its own features (water, rails, rock bands), grass patches and obstacles. Each layout
is checked before it's kept: the path must reach the exit, Rest Center, boss, kid,
sign and portals, with enough wild-Legend tiles. If a try fails, the next seed is used.
The same seed always gives the same map, so every player sees the same world.
"""
import random
from collections import deque

HOUSE = {'cabin': 'DENS', 'tent': '<>?/', 'tower': '#![]', 'dome': 'ay$+'}
DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]


def generate(a, first, last, solid, seed='v1'):
    for attempt in range(600):
        rng = random.Random('%s-%s-%d' % (a['id'], seed, attempt))
        res = _try(a, first, last, solid, rng)
        if res:
            res['attempt'] = attempt
            return res
    raise SystemExit('%s: no valid layout found' % a['id'])


def _try(a, first, last, solid, rng):
    gen = a.get('gen', {})
    W = rng.randint(*gen.get('w', (20, 26)))
    H = rng.randint(*gen.get('h', (18, 24)))
    F, P, E, B = a['floor'], a['path'], a['enc'], a['border']
    feat, bridge = a.get('strip'), a.get('bridge', P)
    g = [[F] * W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            if y in (0, H - 1) or x in (0, W - 1):
                g[y][x] = B
    inside = lambda x, y: 1 <= x <= W - 2 and 1 <= y <= H - 2

    # ---------- a winding 2-wide path from the bottom gate (bg) to the top gate (tg)
    tg, bg = rng.randint(3, W - 5), rng.randint(3, W - 5)
    path = set()
    x, y = bg, H - 2

    def carve(cx, cy):
        path.add((cx, cy)); path.add((cx + 1, cy))
    carve(x, y)
    while y > 2:
        for _ in range(rng.randint(1, 3)):
            if y > 2:
                y -= 1; carve(x, y)
        target = tg if y <= 4 or rng.random() < 0.35 else rng.randint(2, W - 4)
        d = 1 if target > x else -1
        for _ in range(min(abs(target - x), rng.randint(2, 7))):
            x += d; carve(x, y)
    while x != tg:
        x += 1 if tg > x else -1; carve(x, y)
    for yy in range(y, 0, -1):
        carve(tg, yy)

    # ---------- features: bands across the map or blobs (water, rails, rock...)
    kind = gen.get('feature', 'band' if feat else 'none')
    if feat and kind == 'band':
        for _ in range(gen.get('bands', rng.randint(1, 2))):
            r = rng.randint(4, H - 6)
            x0 = rng.choice([1, rng.randint(1, W // 3)])
            x1 = rng.choice([W - 2, rng.randint(2 * W // 3, W - 2)])
            for yy in range(r, r + rng.randint(1, 2)):
                for xx in range(x0, x1 + 1):
                    g[yy][xx] = feat
    elif feat and kind == 'blobs':
        for _ in range(gen.get('blobs', rng.randint(2, 4))):
            cx, cy, rx, ry = rng.randint(2, W - 3), rng.randint(3, H - 4), rng.randint(2, 4), rng.randint(1, 3)
            for yy in range(cy - ry, cy + ry + 1):
                for xx in range(cx - rx, cx + rx + 1):
                    if inside(xx, yy) and ((xx - cx) / (rx + .5)) ** 2 + ((yy - cy) / (ry + .5)) ** 2 <= 1:
                        g[yy][xx] = feat

    # ---------- wild-Legend patches: random blobs
    for _ in range(rng.randint(*gen.get('patches', (4, 7)))):
        cx, cy, rx, ry = rng.randint(2, W - 3), rng.randint(2, H - 3), rng.randint(2, 4), rng.randint(1, 3)
        for yy in range(cy - ry, cy + ry + 1):
            for xx in range(cx - rx, cx + rx + 1):
                if inside(xx, yy) and g[yy][xx] == F and ((xx - cx) / (rx + .5)) ** 2 + ((yy - cy) / (ry + .5)) ** 2 <= 1:
                    g[yy][xx] = E

    # ---------- obstacles: scattered, plus a few small clusters
    obs = a['obstacles']
    for _ in range(int(W * H * gen.get('density', 0.03))):
        xx, yy = rng.randint(1, W - 2), rng.randint(1, H - 2)
        if g[yy][xx] == F:
            g[yy][xx] = rng.choice(obs)
    for _ in range(rng.randint(*gen.get('clusters', (1, 3)))):
        xx, yy = rng.randint(2, W - 3), rng.randint(2, H - 3)
        for _ in range(rng.randint(3, 6)):
            if inside(xx, yy) and g[yy][xx] in (F, E):
                g[yy][xx] = rng.choice(obs)
            dx, dy = rng.choice(DIRS)
            xx, yy = xx + dx, yy + dy

    # ---------- lay the path (bridges over features)
    for (px, py) in path:
        g[py][px] = bridge if g[py][px] == feat else P
    if not first:
        g[H - 1][bg] = g[H - 1][bg + 1] = P
    if not last:
        g[0][tg], g[0][tg + 1] = 'g', 'G'

    taken = set()

    def free_rect(x0, y0, w, h, margin=1):
        for yy in range(y0 - margin, y0 + h + margin):
            for xx in range(x0 - margin, x0 + w + margin):
                if (xx, yy) in taken:
                    return False
        for yy in range(y0, y0 + h):
            for xx in range(x0, x0 + w):
                if not inside(xx, yy) or (xx, yy) in path or g[yy][xx] == feat:
                    return False
        return True

    def dist_to_path(x, y):
        return min(abs(x - px) + abs(y - py) for (px, py) in path)

    def connect(sx, sy):
        """Carve an L-shaped path from (sx, sy) to the nearest path tile."""
        tx, ty = min(path, key=lambda p: abs(p[0] - sx) + abs(p[1] - sy))
        cx, cy = sx, sy
        order = rng.choice([0, 1])
        steps = []
        while (cx, cy) != (tx, ty):
            if (order == 0 and cx != tx) or cy == ty:
                cx += 1 if tx > cx else -1
            else:
                cy += 1 if ty > cy else -1
            steps.append((cx, cy))
        for (xx, yy) in [(sx, sy)] + steps:
            if (xx, yy) in taken or not inside(xx, yy):
                continue
            g[yy][xx] = bridge if g[yy][xx] == feat else P
            path.add((xx, yy))

    # Rest Center: 5 wide x 2 tall, door in the middle of the bottom row
    spots = [(x0, y0) for y0 in range(1, H - 4) for x0 in range(1, W - 6) if free_rect(x0, y0, 5, 3) and dist_to_path(x0 + 2, y0 + 2) <= 5]
    if not spots:
        return None
    cx, cy = rng.choice(spots)
    for i, ch in enumerate('CC4CC'):
        g[cy][cx + i] = ch
    for i, ch in enumerate('wWdWw'):
        g[cy + 1][cx + i] = ch
    for yy in range(cy - 1, cy + 3):
        for xx in range(cx - 1, cx + 6):
            taken.add((xx, yy))
    door, heal = (cx + 2, cy + 1), (cx + 2, cy + 2)
    taken.discard(heal)
    connect(*heal)

    # Boss house: 3 wide x 2 tall in the top half; the boss stands at its door
    spots = [(x0, y0) for y0 in range(1, max(2, H // 2)) for x0 in range(1, W - 4) if free_rect(x0, y0, 3, 3) and dist_to_path(x0 + 1, y0 + 2) <= 6]
    if not spots:
        return None
    hx, hy = rng.choice(spots)
    roof, emb, wall, hdoor = HOUSE[a['house']]
    for i, ch in enumerate((roof, emb, roof)):
        g[hy][hx + i] = ch
    for i, ch in enumerate((wall, hdoor, wall)):
        g[hy + 1][hx + i] = ch
    for yy in range(hy - 1, hy + 3):
        for xx in range(hx - 1, hx + 4):
            taken.add((xx, yy))
    boss = (hx + 1, hy + 2)
    taken.discard(boss)
    connect(*boss)
    taken.add(boss)

    def beside_path(cond=lambda x, y: True):
        out = []
        for (px, py) in path:
            for dx, dy in DIRS:
                xx, yy = px + dx, py + dy
                if inside(xx, yy) and (xx, yy) not in path and (xx, yy) not in taken and g[yy][xx] in (F, E) and cond(xx, yy):
                    out.append((xx, yy))
        return sorted(set(out))

    def claim(spot):
        taken.add(spot)
        for dx, dy in DIRS:
            taken.add((spot[0] + dx, spot[1] + dy))

    picks = beside_path(lambda x, y: 4 <= y <= H - 4)
    if len(picks) < 4:
        return None
    sign = rng.choice(picks); g[sign[1]][sign[0]] = 's'; claim(sign)
    picks = [p for p in beside_path(lambda x, y: 3 <= y <= H - 3) if p not in taken]
    if not picks:
        return None
    kid = rng.choice(picks); g[kid[1]][kid[0]] = F; claim(kid)
    home = exitp = legend = None
    if first:
        picks = beside_path(lambda x, y: y >= H - 4)
        if not picks:
            return None
        home = rng.choice(picks); g[home[1]][home[0]] = F; claim(home)
    if last:
        picks = beside_path(lambda x, y: y <= 4)
        if not picks:
            return None
        exitp = rng.choice(picks); g[exitp[1]][exitp[0]] = F; claim(exitp)
        far = [(x, y) for y in range(2, H - 2) for x in range(2, W - 2)
               if g[y][x] in (F, E) and (x, y) not in taken and dist_to_path(x, y) >= 3]
        if not far:
            return None
        legend = rng.choice(far); g[legend[1]][legend[0]] = F; claim(legend)

    # ---------- check: everything important is reachable from the bottom
    blocked = {boss, kid, sign} | ({legend} if legend else set())
    walk = lambda x, y: 0 <= y < H and 0 <= x < W and g[y][x] not in solid and (x, y) not in blocked
    start = (bg, H - 2)
    seen, q = {start}, deque([start])
    while q:
        cx2, cy2 = q.popleft()
        for dx, dy in DIRS:
            n = (cx2 + dx, cy2 + dy)
            if n not in seen and walk(*n):
                seen.add(n); q.append(n)
    near = lambda p: any((p[0] + dx, p[1] + dy) in seen for dx, dy in DIRS)
    need = [heal in seen, near(boss), near(kid), near(sign), (bg + 1, H - 2) in seen]
    if not last:
        need += [(tg, 1) in seen, (tg + 1, 1) in seen]
    if home:
        need.append(home in seen)
    if exitp:
        need.append(exitp in seen)
    if legend:
        need.append(near(legend))
    wild = sum(1 for (x, y) in seen if g[y][x] == E)
    if not all(need) or wild < gen.get('min_wild', 22):
        return None
    return {
        'rows': [''.join(r) for r in g], 'W': W, 'H': H, 'tg': tg, 'bg': bg,
        'door': door, 'heal': heal, 'boss': boss, 'kid': kid, 'sign': sign,
        'home': home, 'exit': exitp, 'legend': legend, 'wild': wild,
    }
