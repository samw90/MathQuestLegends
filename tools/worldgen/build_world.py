"""Adds a world to Math Quest Legends from a spec (see world3.py etc.).

Usage: python3 tools/worldgen/build_world.py tools/worldgen/world3.py
(run on files without that world yet; worlds 3-5 were built in order).

Edits js/data.js, js/art.js and js/game.js in place. Each area's layout comes from
gen_layout.py (seeded, so it's the same every time) using that area's settings in
shapes.py. QC (tools/qc.html) checks the result.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_layout import generate  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'js') + os.sep
HOUSE = {'cabin': 'DENS', 'tent': '<>?/', 'tower': '#![]', 'dome': 'ay$+'}

# Wild-Legend patches (c0, c1, r0, r1) and obstacle spots for three layout variants.
PATCHES = [
    [(2, 7, 6, 8), (12, 17, 6, 8), (2, 6, 11, 13), (13, 17, 11, 13), (1, 3, 14, 15)],
    [(1, 4, 6, 9), (14, 18, 9, 12), (3, 7, 12, 15), (12, 16, 13, 15), (15, 18, 6, 7)],
    [(2, 8, 10, 14), (11, 17, 10, 14), (1, 4, 6, 8), (15, 18, 6, 8)],
]
OBSTACLES = [
    [(3, 10), (16, 10), (6, 16), (13, 16), (17, 4), (8, 5), (11, 9)],
    [(6, 5), (16, 4), (2, 11), (17, 15), (8, 10), (11, 7), (7, 16)],
    [(5, 5), (14, 8), (2, 15), (17, 16), (8, 15), (11, 15), (17, 4)],
]
SIGN = [(7, 9), (11, 10), (7, 5)]
KID = [(15, 9), (5, 10), (13, 8)]


def make_map(a, world, first, last, variant):
    W, H = 20, 18
    g = [[a['floor']] * W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            if y in (0, H - 1) or x in (0, W - 1):
                g[y][x] = a['border']
    for y in range(H):
        g[y][9] = g[y][10] = a['path']
    if last:
        g[0][9] = g[0][10] = a['border']
    else:
        g[0][9], g[0][10] = 'g', 'G'
    if first:
        g[H - 1][9] = g[H - 1][10] = a['border']
    # features first (rails, water...) so structures sit on top of them
    for r in a.get('strip_rows', []):
        for x in range(1, W - 1):
            g[r][x] = a['strip'] if x not in (9, 10) else a['bridge']
    # patches of wild-Legend tiles
    for (c0, c1, r0, r1) in PATCHES[variant]:
        for y in range(r0, r1 + 1):
            for x in range(c0, c1 + 1):
                if g[y][x] == a['floor']:
                    g[y][x] = a['enc']
    # Rest Center (door at 14,3), path down to the main road
    for x, ch in zip(range(12, 17), 'CC4CC'):
        g[2][x] = ch
    for x, ch in zip(range(12, 17), 'wWdWw'):
        g[3][x] = ch
    for x in range(11, 15):
        g[4][x] = a['path'] if x == 14 else a['floor']
    g[4][14] = a['path']
    for x in range(11, 15):
        g[5][x] = a['path']
    # boss house, cols 5-7 rows 1-2; boss stands at (6, 3)
    roof, emb, wall, door = HOUSE[a['house']]
    for x, ch in zip((5, 6, 7), (roof, emb, roof)):
        g[1][x] = ch
    for x, ch in zip((5, 6, 7), (wall, door, wall)):
        g[2][x] = ch
    for (x, y) in [(5, 3), (6, 3), (7, 3), (6, 4), (4, 1), (4, 2), (8, 1), (8, 2)]:
        if g[y][x] in (a['enc'], a.get('strip')):
            g[y][x] = a['floor']
    # obstacles only on plain floor, never next to the path or structures
    sx, sy = SIGN[variant]
    kx, ky = KID[variant]
    for (x, y) in OBSTACLES[variant]:
        if g[y][x] == a['floor'] and (x, y) not in ((sx, sy), (kx, ky)):
            g[y][x] = a['obstacles'][(x + y) % len(a['obstacles'])]
    g[sy][sx] = 's'
    if g[ky][kx] not in (a['floor'], a['enc']):
        raise SystemExit(f"{a['id']}: kid spot {kx},{ky} is {g[ky][kx]}")
    g[ky][kx] = a['floor']
    rows = [''.join(r) for r in g]
    return rows, (sx, sy), (kx, ky)


def js(v):
    """A JS literal with single-quoted strings (apostrophes escaped)."""
    if isinstance(v, str):
        return "'" + v.replace('\\', '\\\\').replace("'", "\\'") + "'"
    if isinstance(v, (list, tuple)):
        return '[' + ', '.join(js(x) for x in v) + ']'
    return json.dumps(v)


def build(spec):
    data = open(ROOT + 'data.js', encoding='utf-8').read()
    art = open(ROOT + 'art.js', encoding='utf-8').read()
    game = open(ROOT + 'game.js', encoding='utf-8').read()
    w = spec['world']
    areas = spec['areas']
    ids = [a['id'] for a in areas]
    first_flag = spec['first_badge']

    def rep(text, old, new, count=1):
        assert text.count(old) == count, (text.count(old), old[:60])
        return text.replace(old, new)

    # ---------- species
    anchor = data.index('\n  // ---------- Grade ultra rares')
    data = data[:anchor] + '\n\n  // ---------- World %d: %s\n' % (w, spec['name']) + spec['species'].rstrip() + data[anchor:]

    # ---------- areas
    lines = []
    for i, a in enumerate(areas):
        lines.append("  %s: { name: %s, world: %d, base: %d, boss: '%s', species: { add: '%s', sub: '%s', compare: '%s', mult: '%s', div: '%s' } }," % (
            a['id'], js(a['name']), w, spec['base'] + 4 * i, a['partner'], *[a['legends'][f] for f in ('add', 'sub', 'compare', 'mult', 'div')]))
    data = rep(data, "\n};\nconst WORLD1_AREAS", '\n' + '\n'.join(lines) + "\n};\nconst WORLD1_AREAS")
    var = 'WORLD%d_AREAS' % w
    prev = 'WORLD%d_AREAS' % (w - 1)
    data = re.sub(r"(const %s = \[[^\]]*\];)" % prev, lambda m: m.group(1) + "\nconst %s = %s;" % (var, js(ids)), data, count=1)
    data = re.sub(r"const AREA_ORDER = \[([^\]]*)\];", lambda m: "const AREA_ORDER = [%s, ...%s];" % (m.group(1), var), data, count=1)

    # ---------- bosses
    blines = []
    for i, a in enumerate(areas):
        b = a['boss']
        blines.append("""  %s: {
    name: %s, badge: %s, flag: 'badge%d',
    intro: %s,
    win: %s,
    after: %s,
  },""" % (a['id'], js(b['name']), js(b['badge']), first_flag + i, js(b['intro']), js(b['win']), js(b['after'])))
    data = rep(data, "\n};\nconst BADGE_FLAGS", '\n' + '\n'.join(blines) + "\n};\nconst BADGE_FLAGS")

    # ---------- world entry
    old = re.search(r"  \{ id: %d, name: '[^']*', color: '[^']*', areas: \[\], start: null, done: null \}," % w, data).group(0)
    solid = set(re.search(r"const SOLID = new Set\('([^']*)'", data).group(1)) | set(spec['solid'])
    L = [generate(a, i == 0, i == len(areas) - 1, solid) for i, a in enumerate(areas)]
    for a, lay in zip(areas, L):
        print('  %-12s %dx%d, %d wild tiles (try %d)' % (a['id'], lay['W'], lay['H'], lay['wild'], lay['attempt']))
    data = data.replace(old, "  { id: %d, name: %s, color: '%s', areas: %s, start: { map: '%s', x: %d, y: %d, dir: 'up' }, done: 'badge%d' }," % (
        w, js(spec['name']), spec['color'], var, ids[0], L[0]['bg'], L[0]['H'] - 2, first_flag + 4))

    # ---------- looks
    looks = ''.join("  %s: %s,\n" % (k, v) for k, v in spec['looks'].items())
    data = rep(data, "  sage: { id: 'sage',", looks + "  sage: { id: 'sage',")

    # ---------- tiles: solid / encounter sets
    m = re.search(r"const SOLID = new Set\('([^']*)'\.split\(''\)\);", data)
    data = data.replace(m.group(0), "const SOLID = new Set('%s'.split(''));" % (m.group(1) + spec['solid']))
    m = re.search(r"const ENCOUNTER = new Set\(\[([^\]]*)\]\);", data)
    data = data.replace(m.group(0), "const ENCOUNTER = new Set([%s, %s]);" % (m.group(1), ', '.join("'%s'" % c for c in spec['enc'])))
    data = rep(data, "//   shrine  j stone floor", spec['tile_legend'] + "\n//   shrine  j stone floor")

    # ---------- maps
    out = ['  // ---------- World %d: %s' % (w, spec['name'])]
    for i, a in enumerate(areas):
        first, last = i == 0, i == len(areas) - 1
        lay = L[i]
        warps = []
        if not first:
            pv = L[i - 1]
            warps += ["back(%d, %d, '%s', %d, 1)" % (lay['bg'], lay['H'] - 1, ids[i - 1], pv['tg']),
                      "back(%d, %d, '%s', %d, 1)" % (lay['bg'] + 1, lay['H'] - 1, ids[i - 1], pv['tg'] + 1)]
        if not last:
            nx = L[i + 1]
            warps += ["gate(%d, 0, '%s', %d, %d, 'badge%d')" % (lay['tg'], ids[i + 1], nx['bg'], nx['H'] - 2, first_flag + i),
                      "gate(%d, 0, '%s', %d, %d, 'badge%d')" % (lay['tg'] + 1, ids[i + 1], nx['bg'] + 1, nx['H'] - 2, first_flag + i)]
        warps.append('centerDoor(%d, %d)' % lay['door'])
        portals = []
        if first:
            portals.append("{ x: %d, y: %d, world: 1, home: true }" % lay['home'])
        if last:
            nxt = spec.get('next_world')
            ex = lay['exit']
            portals.append("{ x: %d, y: %d, world: %d, show: 'badge%d' }" % (ex[0], ex[1], nxt, first_flag + 4) if nxt else
                           "{ x: %d, y: %d, world: 1, home: true, show: 'badge%d' }" % (ex[0], ex[1], first_flag + 4))
        out.append("""  %s: {
    name: %s,
    area: '%s',
    border: '%s',
    wild: true,
    heal: [%d, %d],
    tiles: [
%s
    ],
    npcs: [
      { x: %d, y: %d, dir: 'down', look: '%s', script: 'boss', arg: '%s' },
      { x: %d, y: %d, dir: 'left', look: '%s', script: '%sKid' },
    ],
    warps: [
      %s,
    ],%s
    signs: { '%d,%d': %s },
  },
""" % (a['id'], js(a['name']), a['id'], a['border'], lay['heal'][0], lay['heal'][1], '\n'.join("      '%s'," % r for r in lay['rows']),
            lay['boss'][0], lay['boss'][1], a['boss']['look'], a['id'], lay['kid'][0], lay['kid'][1], a['kid_look'], a['id'],
            ',\n      '.join(warps),
            ('\n    portals: [%s],' % ', '.join(portals)) if portals else '',
            lay['sign'][0], lay['sign'][1], js([a['name'].upper(), a['sign']])))
    data = rep(data, "  // An open clearing west of town", '\n'.join(out) + "\n  // An open clearing west of town")

    # the previous world's exit portal already points at this world; travel stops
    tl = ''.join("  { world: %d, map: '%s', label: %s, mx: %d, my: %d },\n" % (w, a['id'], js(a['name']), a['mx'], a['my']) for a in areas)
    data = rep(data, "\n];\n\n// Rare Legends waiting" if "\n];\n\n// Rare Legends waiting" in data else "XX", "\n" + tl.rstrip('\n') + "\n];\n\n// Rare Legends waiting") if False else data
    m = re.search(r"(  \{ world: \d+, map: '[^']*', label: '[^']*', mx: \d+, my: \d+ \},\n)\];", data)
    data = data.replace(m.group(0), m.group(1) + tl + "];")

    # world Legend
    data = rep(data, "  { id: 'infinix', kind: 'mythical'", "  { id: '%s', kind: 'world', world: %d, need: 'badge%d', map: '%s', x: %d, y: %d },\n  { id: 'infinix', kind: 'mythical'" % (
        spec['world_legend'], w, first_flag + 4, ids[-1], *L[-1]['legend']))

    # ---------- art
    art = rep(art, "    // Portal Shrine standing stone.", spec['tiles_js'].rstrip() + "\n\n    // Portal Shrine standing stone.")
    art = rep(art, "\n    // ---------- Grade ultra rares", '\n' + spec['creatures_js'].rstrip() + "\n\n    // ---------- Grade ultra rares")
    if spec.get('helpers_js'):
        art = rep(art, "  function forestFloor(k) {", spec['helpers_js'].rstrip() + "\n  function forestFloor(k) {")

    # ---------- game: battle colors, local kids, world map picture
    bl = ''.join("    %s: %s,\n" % (a['id'], js(a['battle'])) for a in areas)
    game = rep(game, "    waterfall: ['#e6f2fa', '#cfdce6', '#7a8a98', '#a8b8c4'],\n", "    waterfall: ['#e6f2fa', '#cfdce6', '#7a8a98', '#a8b8c4'],\n" + bl)
    kids = ''.join("    %sKid: () => say(%s),\n" % (a['id'], js(a['kid'])) for a in areas)
    game = rep(game, "    waterfallKid: () =>", kids + "    waterfallKid: () =>")
    pic = "    %d: [\n%s\n    ],\n" % (w, '\n'.join("      '%s'," % r for r in spec['picture']))
    game = rep(game, "  };\n  function drawWorldMap(world) {", pic + "  };\n  function drawWorldMap(world) {")

    open(ROOT + 'data.js', 'w', encoding='utf-8').write(data)
    open(ROOT + 'art.js', 'w', encoding='utf-8').write(art)
    open(ROOT + 'game.js', 'w', encoding='utf-8').write(game)
    print('built world', w)


if __name__ == '__main__':
    import importlib.util
    sp = importlib.util.spec_from_file_location('spec', sys.argv[1])
    mod = importlib.util.module_from_spec(sp)
    sp.loader.exec_module(mod)
    # Per-area layout settings (features, size, density) live in shapes.py.
    from shapes import SHAPES
    for a in mod.SPEC['areas']:
        a.update(SHAPES[a['id']])
    build(mod.SPEC)
