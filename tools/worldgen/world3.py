SPEC = {
    'world': 3, 'name': 'Brightport City', 'color': '#e0a030', 'base': 46, 'first_badge': 11, 'next_world': 4,
    'world_legend': 'brightwing', 'world_legend_spot': (2, 16),
    'solid': 'ζηθικμοφχΔΞ',
    'enc': ['ε', 'ν', 'τ', 'ψ', 'Λ'],
    'tile_legend': "//   city    α sidewalk  δ lawn  ε flower bushes  ζ planter tree  η fountain  θ bench\n//           ι brick  κ windows  λ roof  μ air vent  ν roof garden  ξ subway tiles  ο rails\n//           σ platform  τ puddles  υ dock  φ harbor water  χ crates  ψ nets  Γ cobbles\n//           Δ tower wall  Λ ivy  Ξ lamppost",
    'areas': [
        {'id': 'park', 'name': 'Sunny Park', 'border': 'ζ', 'floor': 'δ', 'path': 'α', 'enc': 'ε', 'obstacles': ['η', 'θ'], 'house': 'dome', 'variant': 0,
         'partner': 'fountitan', 'legends': {'add': 'pigeonplus', 'sub': 'raccminus', 'compare': 'lampling', 'mult': 'sprinklet', 'div': 'pelishare'},
         'boss': {'name': 'Gardener Rose', 'badge': 'Blossom Badge', 'look': 'gardener',
                  'intro': ['Welcome to my park! I\'m Gardener Rose.', 'I plant flowers in neat rows.', 'Let\'s see your puzzle power!'],
                  'win': ['Lovely! The Blossom Badge is yours.', 'The stairs up to Rooftop Run are open.'],
                  'after': ['Stop and smell the flowers, {name}!', 'Rooftop Run is just north.']},
         'sign': 'Pigeons gather in groups here.', 'kid_look': 'kid', 'kid': ['Sprinklet sprays water in equal groups.', '3 groups of 4 drops is 12 drops!'],
         'battle': ['#f2f8ea', '#d8ecc4', '#7cc060', '#a0d884'], 'mx': 80, 'my': 116},
        {'id': 'rooftops', 'name': 'Rooftop Run', 'border': 'ι', 'floor': 'λ', 'path': 'α', 'enc': 'ν', 'obstacles': ['μ'], 'house': 'tower', 'variant': 1,
         'partner': 'towerex', 'legends': {'add': 'pigeonplus', 'sub': 'mouseless', 'compare': 'neonewt', 'mult': 'bricklet', 'div': 'balloonsplit'},
         'boss': {'name': 'Courier Kai', 'badge': 'Skyline Badge', 'look': 'courier',
                  'intro': ['Whoa, you made it up here!', 'I\'m Courier Kai. I deliver fast.', 'Can you solve puzzles just as fast?'],
                  'win': ['Delivered! The Skyline Badge is yours.', 'The subway stairs are open now.'],
                  'after': ['Keep moving, {name}!', 'The Subway Station is north.']},
         'sign': 'Mind the edges! The view is great.', 'kid_look': 'girl', 'kid': ['Bricklet stacks bricks in rows.', 'Rows times columns tells you how many!'],
         'battle': ['#e8f0fa', '#c8ccd8', '#8a8a9a', '#a8a8b8'], 'mx': 44, 'my': 96},
        {'id': 'subway', 'name': 'Subway Station', 'border': 'ι', 'floor': 'ξ', 'path': 'σ', 'enc': 'τ', 'obstacles': ['θ'], 'house': 'dome', 'variant': 2,
         'strip_rows': [6, 7], 'strip': 'ο', 'bridge': 'σ',
         'partner': 'metrodrake', 'legends': {'add': 'taxicub', 'sub': 'mouseless', 'compare': 'neonewt', 'mult': 'traintrio', 'div': 'slicerat'},
         'boss': {'name': 'Conductor Lou', 'badge': 'Ticket Badge', 'look': 'conductor',
                  'intro': ['All aboard! I\'m Conductor Lou.', 'My trains run on time and in equal groups.', 'Tickets, please!'],
                  'win': ['Next stop: a badge! Here\'s the Ticket Badge.', 'The way out to Harbor Docks is open.'],
                  'after': ['Mind the gap, {name}!', 'Harbor Docks is north.']},
         'sign': 'Stand behind the yellow line.', 'kid_look': 'hiker', 'kid': ['Traintrio has cars in groups of three.', 'Count by 3s to count the cars!'],
         'battle': ['#e4e4ec', '#c8c8d4', '#6a6a7a', '#8a8a9a'], 'mx': 116, 'my': 80},
        {'id': 'harbor', 'name': 'Harbor Docks', 'border': 'φ', 'floor': 'υ', 'path': 'α', 'enc': 'ψ', 'obstacles': ['χ'], 'house': 'tent', 'variant': 0,
         'strip_rows': [10], 'strip': 'φ', 'bridge': 'α',
         'partner': 'anchorca', 'legends': {'add': 'crabplus', 'sub': 'seaslurp', 'compare': 'lighthousey', 'mult': 'traintrio', 'div': 'pelishare'},
         'boss': {'name': 'Skipper Jo', 'badge': 'Anchor Badge', 'look': 'skipper',
                  'intro': ['Ahoy there! I\'m Skipper Jo.', 'Every boat here carries puzzles.', 'Ready to set sail?'],
                  'win': ['Shipshape! The Anchor Badge is yours.', 'The road to Clock Tower Square is open.'],
                  'after': ['Smooth sailing, {name}!', 'Clock Tower Square is north.']},
         'sign': 'Fresh fish and fresh puzzles!', 'kid_look': 'swimmer', 'kid': ['Lighthousey shines on the bigger number.', 'Look at the biggest place first!'],
         'battle': ['#e4f2fc', '#d8e4ec', '#a07a4a', '#c89a6a'], 'mx': 52, 'my': 44},
        {'id': 'clocktower', 'name': 'Clock Tower Square', 'border': 'Δ', 'floor': 'Γ', 'path': 'α', 'enc': 'Λ', 'obstacles': ['Ξ'], 'house': 'tower', 'variant': 1,
         'partner': 'gearadon', 'legends': {'add': 'taxicub', 'sub': 'raccminus', 'compare': 'lampling', 'mult': 'bricklet', 'div': 'balloonsplit'},
         'boss': {'name': 'Mayor Bell', 'badge': 'Clockwork Badge', 'look': 'mayor',
                  'intro': ['Tick, tock! I\'m Mayor Bell.', 'This whole city runs like clockwork.', 'Let\'s see if your math does too!'],
                  'win': ['Right on time! The Clockwork Badge is yours.', 'You\'ve beaten all of Brightport City!'],
                  'after': ['The city is proud of you, {name}!', 'A portal glows by the tower.']},
         'sign': 'The clock strikes every hour.', 'kid_look': 'kid', 'kid': ['Balloonsplit splits into equal balloons.', 'Sharing equally is dividing!'],
         'battle': ['#f6ecdc', '#e2d4bc', '#a8957a', '#c8b89a'], 'mx': 96, 'my': 14},
    ],
    'looks': {
        'gardener': "{ id: 'gardener', hat: '#e8a040', hair: '#7a4a2a', shirt: '#e86a8a', pants: '#3a6a3a', long: true }",
        'courier': "{ id: 'courier', hat: '#e8502a', hair: '#2b2840', shirt: '#f2c84b', pants: '#2a3a5a' }",
        'conductor': "{ id: 'conductor', hat: '#2a3a6a', hair: '#c8c8d4', shirt: '#2a3a6a', pants: '#2a3a6a' }",
        'skipper': "{ id: 'skipper', hat: '#f4f4f8', hair: '#a8582a', shirt: '#3a78c4', pants: '#f4f4f8', long: true }",
        'mayor': "{ id: 'mayor', hat: '#2b2840', hair: '#8a8a9a', shirt: '#7a3a5a', pants: '#2b2840' }",
    },
    'picture': [
        'ΔΓΓΛΓΓΞΓΓΔ',
        'ΓΓΛΛαΓΓΓΓΓ',
        'φφυυαυυψυφ',
        'φυψυαυυυφφ',
        'ιξξτσξτξξι',
        'οοοοσοοοοο',
        'ιλλναλμλλι',
        'ζδεεαδηδδζ',
    ],
    'species': """  pigeonplus: { name: 'Pigeonplus', hp: 22, atk: 11, family: 'add', moves: ['Coo Call', 'Crumb Peck'], dex: 'It counts every crumb. One more crumb, one more friend!' },
  taxicub: { name: 'Taxicub', hp: 26, atk: 11, family: 'add', moves: ['Honk', 'Zoom'], dex: 'A bear cub that picks up riders and adds them up.' },
  crabplus: { name: 'Crabplus', hp: 26, atk: 10, family: 'add', moves: ['Pinch', 'Side Step'], dex: 'It collects shells in its claws: two here, three there!' },
  raccminus: { name: 'Raccminus', hp: 24, atk: 11, family: 'sub', moves: ['Sneak', 'Snack Grab'], dex: 'It takes snacks away, one by one. Count what\\'s left!' },
  mouseless: { name: 'Mouseless', hp: 20, atk: 12, family: 'sub', moves: ['Nibble', 'Scurry'], dex: 'It nibbles cheese until there\\'s less and less.' },
  seaslurp: { name: 'Seaslurp', hp: 26, atk: 10, family: 'sub', moves: ['Slurp', 'Splash'], dex: 'A sea lion that slurps up fish. How many are left?' },
  lampling: { name: 'Lampling', hp: 22, atk: 11, family: 'compare', moves: ['Glow Up', 'Flicker'], dex: 'A little lamp that glows brighter on the bigger number.' },
  neonewt: { name: 'Neonewt', hp: 22, atk: 11, family: 'compare', moves: ['Neon Flash', 'Tail Whip'], dex: 'Its neon stripes light up to show which is more.' },
  lighthousey: { name: 'Lighthousey', hp: 28, atk: 10, family: 'compare', moves: ['Beam', 'Fog Horn'], dex: 'It shines its light on the biggest number in the harbor.' },
  sprinklet: { name: 'Sprinklet', hp: 22, atk: 11, family: 'mult', moves: ['Spray', 'Drip Drop'], dex: 'It sprays water in equal groups of drops.' },
  bricklet: { name: 'Bricklet', hp: 28, atk: 10, family: 'mult', moves: ['Stack', 'Brick Bonk'], dex: 'It stacks bricks in rows and columns.' },
  traintrio: { name: 'Traintrio', hp: 26, atk: 11, family: 'mult', moves: ['Choo Choo', 'Track Dash'], dex: 'A tiny train with cars in groups of three.' },
  pelishare: { name: 'Pelishare', hp: 24, atk: 11, family: 'div', moves: ['Pouch Scoop', 'Dive'], dex: 'A pelican that shares the fish in its pouch fairly.' },
  slicerat: { name: 'Slicerat', hp: 22, atk: 12, family: 'div', moves: ['Slice', 'Crust Toss'], dex: 'It cuts pizza into equal slices for its friends.' },
  balloonsplit: { name: 'Balloonsplit', hp: 22, atk: 11, family: 'div', moves: ['Pop', 'Float'], dex: 'One big balloon splits into equal little balloons.' },
  fountitan: { name: 'Fountitan', hp: 42, atk: 13, family: 'mixed', moves: ['Geyser', 'Statue Stomp'], dex: 'Gardener Rose\\'s partner. A fountain that came to life.' },
  towerex: { name: 'Towerex', hp: 42, atk: 14, family: 'mixed', moves: ['Skyscraper Stomp', 'Window Roar'], dex: 'Courier Kai\\'s partner. A dinosaur shaped like a tall building.' },
  metrodrake: { name: 'Metrodrake', hp: 44, atk: 14, family: 'mixed', moves: ['Rail Rush', 'Headlight'], dex: 'Conductor Lou\\'s partner. It zooms through tunnels.' },
  anchorca: { name: 'Anchorca', hp: 46, atk: 14, family: 'mixed', moves: ['Anchor Drop', 'Wave'], dex: 'Skipper Jo\\'s partner. An orca with an anchor tattoo.' },
  gearadon: { name: 'Gearadon', hp: 46, atk: 15, family: 'mixed', moves: ['Gear Grind', 'Tick Tock'], dex: 'Mayor Bell\\'s partner. Made of gears that turn just right.' },
  brightwing: { name: 'Brightwing', hp: 50, atk: 15, family: 'mixed', rarity: 'world', moves: ['Neon Blaze', 'City Lights'], dex: 'The Legend of Brightport City. It lights up the whole skyline.' },""",
    'tiles_js': r"""    // ---------- Brightport City
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
    },""",
    'helpers_js': r"""  function sidewalk(k) {
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
  }""",
    'creatures_js': r"""    // ---------- Brightport City
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
    },""",
}
