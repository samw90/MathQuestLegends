SPEC = {
    'world': 5, 'name': 'Sky Isles', 'color': '#a07ae8', 'base': 86, 'first_badge': 21, 'next_world': None,
    'world_legend': 'celestail', 'world_legend_spot': (2, 16),
    'solid': 'ÅÇÎÒÔÕÁ',
    'enc': ['Ä', 'È', 'Ì', 'Ï', 'Ó'],
    'tile_legend': "//   sky     À cloud  Á cloud wall  Ã sky grass  Ä sky flowers  Å floating rock  Ç windmill\n//           È wheat  Ê golden path  Ë rainbow  Ì rainbow sparkles  Í storm cloud  Î lightning rod\n//           Ï storm grass  Ñ castle floor  Ò castle wall  Ó star patch  Ô banner  Õ open sky",
    'areas': [
        {'id': 'meadow2', 'name': 'Cloud Meadow', 'border': 'Õ', 'floor': 'Ã', 'path': 'Ê', 'enc': 'Ä', 'obstacles': ['Å'], 'house': 'cabin', 'variant': 0,
         'partner': 'cloudram', 'legends': {'add': 'fluffadd', 'sub': 'drizzless', 'compare': 'kitebig', 'mult': 'goosegroup', 'div': 'cloudsplit'},
         'boss': {'name': 'Shepherd Sky', 'badge': 'Cloud Badge', 'look': 'shepherd',
                  'intro': ['Welcome to the clouds! I\'m Shepherd Sky.', 'I count my cloud sheep every day.', 'Can you count on yourself?'],
                  'win': ['Wonderful! The Cloud Badge is yours.', 'The breeze to Windmill Isle is open.'],
                  'after': ['Float on, {name}!', 'Windmill Isle is north.']},
         'sign': 'Don\'t look down!', 'kid_look': 'kid', 'kid': ['Goosegroup flies in a V of equal groups.', '2 groups of 5 geese is 10 geese!'],
         'battle': ['#eef4ff', '#d8e6fa', '#9ad47a', '#bce8a0'], 'mx': 80, 'my': 116},
        {'id': 'windmill', 'name': 'Windmill Isle', 'border': 'Õ', 'floor': 'Ã', 'path': 'Ê', 'enc': 'È', 'obstacles': ['Ç'], 'house': 'tent', 'variant': 1,
         'partner': 'gustgiant', 'legends': {'add': 'gustplus', 'sub': 'plumeless', 'compare': 'kitebig', 'mult': 'pinwheelie', 'div': 'sailsplit'},
         'boss': {'name': 'Miller Mo', 'badge': 'Wind Badge', 'look': 'miller',
                  'intro': ['Hello! I\'m Miller Mo.', 'My windmills turn wheat into bread.', 'Let\'s turn puzzles into answers!'],
                  'win': ['Breezy! The Wind Badge is yours.', 'The Rainbow Bridge is open now.'],
                  'after': ['Keep spinning, {name}!', 'The Rainbow Bridge is north.']},
         'sign': 'The wind always blows here.', 'kid_look': 'girl', 'kid': ['Pinwheelie has blades in equal groups.', '4 blades times 3 pinwheels is 12 blades!'],
         'battle': ['#f2f6ff', '#e8e4c8', '#c8a050', '#e2c070'], 'mx': 40, 'my': 96},
        {'id': 'rainbow', 'name': 'Rainbow Bridge', 'border': 'Õ', 'floor': 'À', 'path': 'Ë', 'enc': 'Ì', 'obstacles': ['Å'], 'house': 'dome', 'variant': 2,
         'partner': 'prismadon', 'legends': {'add': 'fluffadd', 'sub': 'fadebow', 'compare': 'starmore', 'mult': 'pinwheelie', 'div': 'prismshare'},
         'boss': {'name': 'Painter Iris', 'badge': 'Rainbow Badge', 'look': 'painter',
                  'intro': ['Oh, hello! I\'m Painter Iris.', 'I paint the rainbow every morning.', 'Let\'s add some color to your math!'],
                  'win': ['Beautiful! The Rainbow Badge is yours.', 'The way up to Storm Peak is open.'],
                  'after': ['Stay colorful, {name}!', 'Storm Peak is north. It\'s loud up there!']},
         'sign': 'Seven colors, one bridge.', 'kid_look': 'hiker', 'kid': ['Prismshare splits light into equal colors.', 'Sharing equally is dividing!'],
         'battle': ['#fff4fa', '#f0e4f8', '#c8a8e8', '#e4d0f8'], 'mx': 116, 'my': 72},
        {'id': 'storm', 'name': 'Storm Peak', 'border': 'Á', 'floor': 'Í', 'path': 'Ê', 'enc': 'Ï', 'obstacles': ['Î'], 'house': 'tower', 'variant': 0,
         'partner': 'thundroar', 'legends': {'add': 'zapadd', 'sub': 'drizzless', 'compare': 'boltbig', 'mult': 'hailgroup', 'div': 'cloudsplit'},
         'boss': {'name': 'Captain Bolt', 'badge': 'Thunder Badge', 'look': 'bolt',
                  'intro': ['BOOM! Ha, did I scare you?', 'I\'m Captain Bolt.', 'Think fast, like lightning!'],
                  'win': ['Electric! The Thunder Badge is yours.', 'The gates of the Sky Castle are open.'],
                  'after': ['You\'re a lightning thinker, {name}!', 'The Sky Castle is north.']},
         'sign': 'Thunder ahead. Stay brave!', 'kid_look': 'kid', 'kid': ['Boltbig zaps the bigger number.', 'Compare the biggest place first!'],
         'battle': ['#3a3a58', '#4a4a6a', '#6a6a8a', '#8a8aaa'], 'mx': 52, 'my': 42},
        {'id': 'castle', 'name': 'Sky Castle', 'border': 'Ò', 'floor': 'Ñ', 'path': 'Ê', 'enc': 'Ó', 'obstacles': ['Ô'], 'house': 'dome', 'variant': 1,
         'partner': 'crowncrane', 'legends': {'add': 'zapadd', 'sub': 'plumeless', 'compare': 'starmore', 'mult': 'goosegroup', 'div': 'prismshare'},
         'boss': {'name': 'Queen Aria', 'badge': 'Crown Badge', 'look': 'queen',
                  'intro': ['Welcome to my castle in the sky.', 'I\'m Queen Aria.', 'Only a true Math Quest Legend can win my crown!'],
                  'win': ['Amazing! The Crown Badge is yours.', 'You\'ve beaten every world! You are a true Math Quest Legend!'],
                  'after': ['All hail {name}, the Math Quest Legend!', 'A portal by the castle leads home.']},
         'sign': 'The highest place in all the worlds.', 'kid_look': 'girl', 'kid': ['Starmore twinkles on the bigger number.', 'Every star you see is a number!'],
         'battle': ['#f6f0ff', '#e4dcf4', '#b8a8d8', '#d4c8ec'], 'mx': 96, 'my': 14},
    ],
    'looks': {
        'shepherd': "{ id: 'shepherd', hat: '#f4f4f8', hair: '#a8582a', shirt: '#9ad47a', pants: '#5a4a3a' }",
        'miller': "{ id: 'miller', hat: '#e8d8a8', hair: '#5a3418', shirt: '#c8843a', pants: '#3a4a6a' }",
        'painter': "{ id: 'painter', hat: '#e8506a', hair: '#2b2840', shirt: '#f2c84b', pants: '#7a5ad8', long: true }",
        'bolt': "{ id: 'bolt', hat: '#f2c84b', hair: '#2b2840', shirt: '#3a3a58', pants: '#2b2840' }",
        'queen': "{ id: 'queen', hat: '#f2c84b', hair: '#e8e0ff', shirt: '#a07ae8', pants: '#5a3a94', long: true }",
    },
    'picture': [
        'ÒÑÑÓÊÑÔÑÑÒ',
        'ÁÍÏÍÊÍÎÍÏÁ',
        'ÕÀÌÀËÀÌÀÕÕ',
        'ÕÀÀÌËÌÀÀÀÕ',
        'ÕÃÈÈÊÃÇÈÕÕ',
        'ÕÃÈÃÊÈÈÃÃÕ',
        'ÕÃÄÄÊÃÅÄÃÕ',
        'ÕÄÃÃÊÃÄÄÕÕ',
    ],
    'species': """  fluffadd: { name: 'Fluffadd', hp: 26, atk: 12, family: 'add', moves: ['Fluff Puff', 'Cloud Hop'], dex: 'A cloud sheep. Its wool grows one more puff at a time.' },
  zapadd: { name: 'Zapadd', hp: 24, atk: 13, family: 'add', moves: ['Spark', 'Zap Dash'], dex: 'Every spark adds up. Zap, zap, zap makes three!' },
  gustplus: { name: 'Gustplus', hp: 24, atk: 13, family: 'add', moves: ['Gust', 'Swirl'], dex: 'A wind spirit that gathers leaves: one more, one more!' },
  drizzless: { name: 'Drizzless', hp: 24, atk: 13, family: 'sub', moves: ['Drizzle', 'Splash Down'], dex: 'A rain cloud that gets smaller with every drop.' },
  plumeless: { name: 'Plumeless', hp: 26, atk: 13, family: 'sub', moves: ['Feather Drop', 'Wing Flap'], dex: 'It drops feathers as it flies. How many are left?' },
  fadebow: { name: 'Fadebow', hp: 24, atk: 13, family: 'sub', moves: ['Color Fade', 'Arc Swing'], dex: 'A little rainbow that loses a color each time it hides.' },
  kitebig: { name: 'Kitebig', hp: 24, atk: 13, family: 'compare', moves: ['Tail Flick', 'Dive'], dex: 'A kite that always flies toward the bigger number.' },
  starmore: { name: 'Starmore', hp: 26, atk: 12, family: 'compare', moves: ['Twinkle', 'Star Fall'], dex: 'It twinkles brightest on the bigger number.' },
  boltbig: { name: 'Boltbig', hp: 26, atk: 14, family: 'compare', moves: ['Bolt Strike', 'Rumble'], dex: 'It zaps the bigger number with a lightning bolt.' },
  goosegroup: { name: 'Goosegroup', hp: 26, atk: 13, family: 'mult', moves: ['Honk Squad', 'V Formation'], dex: 'Geese that fly in equal groups. Count by fives!' },
  pinwheelie: { name: 'Pinwheelie', hp: 24, atk: 13, family: 'mult', moves: ['Spin', 'Breeze'], dex: 'Its blades come in equal groups. Spin, spin!' },
  hailgroup: { name: 'Hailgroup', hp: 28, atk: 13, family: 'mult', moves: ['Hail Storm', 'Ice Pebble'], dex: 'Little balls of ice fall from it in neat rows.' },
  cloudsplit: { name: 'Cloudsplit', hp: 24, atk: 13, family: 'div', moves: ['Split Puff', 'Mist'], dex: 'One big cloud that splits into equal little clouds.' },
  prismshare: { name: 'Prismshare', hp: 26, atk: 13, family: 'div', moves: ['Prism Beam', 'Light Split'], dex: 'It splits light into equal colors and shares them.' },
  sailsplit: { name: 'Sailsplit', hp: 26, atk: 13, family: 'div', moves: ['Sail Swoop', 'Wind Share'], dex: 'A sky boat that shares the wind with every sail.' },
  cloudram: { name: 'Cloudram', hp: 52, atk: 16, family: 'mixed', moves: ['Thunder Horns', 'Wool Wall'], dex: 'Shepherd Sky\\'s partner. The biggest cloud sheep of all.' },
  gustgiant: { name: 'Gustgiant', hp: 54, atk: 16, family: 'mixed', moves: ['Tornado', 'Big Breath'], dex: 'Miller Mo\\'s partner. Its breath turns every windmill.' },
  prismadon: { name: 'Prismadon', hp: 54, atk: 17, family: 'mixed', moves: ['Rainbow Roar', 'Crystal Spikes'], dex: 'Painter Iris\\'s partner. A dinosaur made of rainbow crystal.' },
  thundroar: { name: 'Thundroar', hp: 56, atk: 17, family: 'mixed', moves: ['Thunder Roar', 'Storm Claw'], dex: 'Captain Bolt\\'s partner. Its roar is the thunder.' },
  crowncrane: { name: 'Crowncrane', hp: 58, atk: 17, family: 'mixed', moves: ['Royal Dance', 'Crown Shine'], dex: 'Queen Aria\\'s partner. It dances above the clouds.' },
  celestail: { name: 'Celestail', hp: 62, atk: 18, family: 'mixed', rarity: 'world', moves: ['Starlight', 'Sky Spiral'], dex: 'The Legend of the Sky Isles. Its tail leaves a trail of stars.' },""",
    'tiles_js': r"""    // ---------- Sky Isles
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
    },""",
    'helpers_js': r"""  function cloudFloor(k) {
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
  }""",
    'creatures_js': r"""    // ---------- Sky Isles
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
    },""",
}
