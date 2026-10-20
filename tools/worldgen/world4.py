SPEC = {
    'world': 4, 'name': 'Coral Deep', 'color': '#3ac4c8', 'base': 66, 'first_badge': 16, 'next_world': 5,
    'world_legend': 'leviathorn', 'world_legend_spot': (2, 16),
    'solid': '¤£¥®°¿ßÐ',
    'enc': ['¢', 'µ', '±', 'Ø', 'Þ'],
    'tile_legend': "//   sea     § sand  ð sand trail  ¢ anemones  ¤ coral  £ rock  µ kelp  ¥ kelp wall  © ship deck\n//           ® hull  ° barrels  ± seaweed  ¶ trench floor  Ø glow plants  ¿ vent  ß dark rock\n//           Æ temple floor  Þ glyph tiles  Ð temple pillar",
    'areas': [
        {'id': 'reef', 'name': 'Rainbow Reef', 'border': '¤', 'floor': '§', 'path': 'ð', 'enc': '¢', 'obstacles': ['¤', '£'], 'house': 'dome', 'variant': 0,
         'partner': 'coralord', 'legends': {'add': 'clownplus', 'sub': 'urchless', 'compare': 'puffbig', 'mult': 'schoolio', 'div': 'starsplit'},
         'boss': {'name': 'Diver Dot', 'badge': 'Coral Badge', 'look': 'diver',
                  'intro': ['Blub! I mean, hi! I\'m Diver Dot.', 'The reef is full of colors and puzzles.', 'Let\'s dive in!'],
                  'win': ['Fin-tastic! The Coral Badge is yours.', 'The path to the Kelp Forest is open.'],
                  'after': ['Keep swimming, {name}!', 'The Kelp Forest is north.']},
         'sign': 'Swim gently. Coral is alive!', 'kid_look': 'swimmer', 'kid': ['Schoolio swims in groups of fish.', '4 groups of 5 fish is 20 fish!'],
         'battle': ['#d8f4f8', '#b8e4ec', '#e8a868', '#f2c88a'], 'mx': 80, 'my': 116},
        {'id': 'kelp', 'name': 'Kelp Forest', 'border': '¥', 'floor': '§', 'path': 'ð', 'enc': 'µ', 'obstacles': ['£'], 'house': 'cabin', 'variant': 1,
         'partner': 'kelpsquatch', 'legends': {'add': 'clownplus', 'sub': 'squidrop', 'compare': 'seamore', 'mult': 'schoolio', 'div': 'clamshare'},
         'boss': {'name': 'Ranger Kip', 'badge': 'Kelp Badge', 'look': 'kip',
                  'intro': ['Shh, the kelp is swaying.', 'I\'m Ranger Kip. I look after this forest.', 'Show me your calm thinking!'],
                  'win': ['Wonderful! The Kelp Badge is yours.', 'The way to the Sunken Ship is open.'],
                  'after': ['Sway with the kelp, {name}!', 'The Sunken Ship is north.']},
         'sign': 'Kelp grows taller than a house!', 'kid_look': 'kid', 'kid': ['Seamore is a seahorse who picks the bigger number.', 'Look at the biggest place first!'],
         'battle': ['#d4f0e4', '#b4dcc8', '#5a9a5a', '#7cb87a'], 'mx': 40, 'my': 96},
        {'id': 'wreck', 'name': 'Sunken Ship', 'border': '®', 'floor': '©', 'path': 'ð', 'enc': '±', 'obstacles': ['°'], 'house': 'tent', 'variant': 2,
         'strip_rows': [9], 'strip': '®', 'bridge': 'ð',
         'partner': 'krakenumb', 'legends': {'add': 'barnaplus', 'sub': 'urchless', 'compare': 'seamore', 'mult': 'prawnpairs', 'div': 'clamshare'},
         'boss': {'name': 'Captain Barnacle', 'badge': 'Treasure Badge', 'look': 'barnacle',
                  'intro': ['Arr! Welcome to my old ship!', 'I\'m Captain Barnacle.', 'My treasure is puzzles. Can you win it?'],
                  'win': ['Treasure found! The Treasure Badge is yours.', 'The way down to the Dark Trench is open.'],
                  'after': ['Arr, well done, {name}!', 'The Dark Trench is north. Bring a light!']},
         'sign': 'This ship sank long ago.', 'kid_look': 'hiker', 'kid': ['Prawnpairs always swim in pairs.', 'Doubles are pairs: 6 + 6 is 12!'],
         'battle': ['#d8e8f0', '#b8c8d4', '#8a6a4a', '#a8885a'], 'mx': 116, 'my': 72},
        {'id': 'trench', 'name': 'Dark Trench', 'border': 'ß', 'floor': '¶', 'path': 'ð', 'enc': 'Ø', 'obstacles': ['¿'], 'house': 'tower', 'variant': 0,
         'partner': 'abyssaur', 'legends': {'add': 'anglerplus', 'sub': 'squidrop', 'compare': 'lanternfin', 'mult': 'prawnpairs', 'div': 'narwhalf'},
         'boss': {'name': 'Explorer Nyx', 'badge': 'Abyss Badge', 'look': 'nyx',
                  'intro': ['Whoa, you found me down here!', 'I\'m Explorer Nyx.', 'Let\'s see if your mind shines in the dark!'],
                  'win': ['Brilliant! The Abyss Badge is yours.', 'The Sunken Temple is open now.'],
                  'after': ['Shine on, {name}!', 'The Sunken Temple is north.']},
         'sign': 'It\'s dark, but the plants glow!', 'kid_look': 'girl', 'kid': ['Narwhalf splits things in half.', 'Half of 20 is 10!'],
         'battle': ['#1e2a40', '#2a3a58', '#3a5a7a', '#5a7aa0'], 'mx': 52, 'my': 42},
        {'id': 'temple', 'name': 'Sunken Temple', 'border': 'Ð', 'floor': 'Æ', 'path': 'ð', 'enc': 'Þ', 'obstacles': ['Ð'], 'house': 'dome', 'variant': 1,
         'partner': 'tritonix', 'legends': {'add': 'anglerplus', 'sub': 'eelaway', 'compare': 'puffbig', 'mult': 'mantarray', 'div': 'starsplit'},
         'boss': {'name': 'Oracle Pearl', 'badge': 'Pearl Badge', 'look': 'oracle',
                  'intro': ['I saw you coming in a dream.', 'I\'m Oracle Pearl.', 'Show me everything the sea has taught you!'],
                  'win': ['Wise and brave! The Pearl Badge is yours.', 'You\'ve beaten all of Coral Deep!'],
                  'after': ['The sea sings your name, {name}!', 'A portal glows in the temple.']},
         'sign': 'The old glyphs are math puzzles!', 'kid_look': 'swimmer', 'kid': ['Mantarray has spots in neat rows.', 'Rows times spots in each row tells how many!'],
         'battle': ['#e0ecf0', '#c4d4dc', '#7a9aa8', '#9ab8c4'], 'mx': 96, 'my': 14},
    ],
    'looks': {
        'diver': "{ id: 'diver', hat: '#f2c84b', hair: '#3a2a1a', shirt: '#e8502a', pants: '#2a3a5a', long: true }",
        'kip': "{ id: 'kip', hat: '#2f7a5a', hair: '#5a3418', shirt: '#4fa84a', pants: '#2a4a3a' }",
        'barnacle': "{ id: 'barnacle', hat: '#2b2840', hair: '#e8e8f0', shirt: '#a8402a', pants: '#3a2a1a' }",
        'nyx': "{ id: 'nyx', hat: '#f2c84b', hair: '#2b2840', shirt: '#3a4a6a', pants: '#2b2840', long: true }",
        'oracle': "{ id: 'oracle', hair: '#f4f0ff', shirt: '#3ac4c8', pants: '#2a6a7a', long: true }",
    },
    'picture': [
        'ÐÆÆÞÆÆÞÆÆÐ',
        'ßØ¶¶ð¶¶Øßß',
        'ß¶Ø¶ð¶¿¶Øß',
        '®©©±ð©©°©®',
        '¥µµ§ð§µµ§¥',
        '¥§µµð§§µµ¥',
        '¤§¢¢ð§£¢§¤',
        '¤¢§§ð§¢¢¤¤',
    ],
    'species': """  clownplus: { name: 'Clownplus', hp: 22, atk: 12, family: 'add', moves: ['Stripe Swish', 'Fin Flip'], dex: 'Its stripes look like plus signs. It adds up its friends.' },
  barnaplus: { name: 'Barnaplus', hp: 30, atk: 10, family: 'add', moves: ['Cling', 'Shell Shield'], dex: 'Barnacles keep sticking to it. One more, one more!' },
  anglerplus: { name: 'Anglerplus', hp: 26, atk: 12, family: 'add', moves: ['Lure Light', 'Big Bite'], dex: 'Its glowing lure adds one more light at a time.' },
  urchless: { name: 'Urchless', hp: 24, atk: 12, family: 'sub', moves: ['Spine Shot', 'Roll'], dex: 'It shoots spines away. Count how many are left!' },
  squidrop: { name: 'Squidrop', hp: 24, atk: 12, family: 'sub', moves: ['Ink Drop', 'Tentacle Tap'], dex: 'Every puff of ink means one less drop in its tank.' },
  eelaway: { name: 'Eelaway', hp: 24, atk: 13, family: 'sub', moves: ['Zap', 'Slither'], dex: 'It zips away so fast, there are fewer each time you look.' },
  puffbig: { name: 'Puffbig', hp: 26, atk: 11, family: 'compare', moves: ['Puff Up', 'Spike Bump'], dex: 'It puffs up big to show which number is bigger.' },
  seamore: { name: 'Seamore', hp: 22, atk: 12, family: 'compare', moves: ['Tail Curl', 'Bubble Kiss'], dex: 'A seahorse that always swims toward the bigger number.' },
  lanternfin: { name: 'Lanternfin', hp: 24, atk: 12, family: 'compare', moves: ['Lantern Glow', 'Dark Dart'], dex: 'Its lantern shines brighter on the bigger number.' },
  schoolio: { name: 'Schoolio', hp: 24, atk: 12, family: 'mult', moves: ['School Swirl', 'Fin Wave'], dex: 'Little fish swim together in equal groups.' },
  prawnpairs: { name: 'Prawnpairs', hp: 22, atk: 12, family: 'mult', moves: ['Pair Pinch', 'Hop Back'], dex: 'Two little prawns who do everything in pairs.' },
  mantarray: { name: 'Mantarray', hp: 30, atk: 12, family: 'mult', moves: ['Glide', 'Spot Flash'], dex: 'A manta ray with spots in neat rows. An array!' },
  starsplit: { name: 'Starsplit', hp: 24, atk: 12, family: 'div', moves: ['Arm Spin', 'Star Stick'], dex: 'A starfish that shares its five arms fairly.' },
  clamshare: { name: 'Clamshare', hp: 28, atk: 11, family: 'div', moves: ['Clam Snap', 'Pearl Toss'], dex: 'It opens up to share its pearls in equal groups.' },
  narwhalf: { name: 'Narwhalf', hp: 28, atk: 12, family: 'div', moves: ['Horn Split', 'Ice Splash'], dex: 'A narwhal whose horn splits things exactly in half.' },
  coralord: { name: 'Coralord', hp: 46, atk: 14, family: 'mixed', moves: ['Reef Wall', 'Color Burst'], dex: 'Diver Dot\\'s partner. A whole coral reef that can walk.' },
  kelpsquatch: { name: 'Kelpsquatch', hp: 48, atk: 14, family: 'mixed', moves: ['Kelp Wrap', 'Big Stomp'], dex: 'Ranger Kip\\'s partner. Shy, hairy and covered in kelp.' },
  krakenumb: { name: 'Krakenumb', hp: 50, atk: 15, family: 'mixed', moves: ['Tentacle Storm', 'Ink Cloud'], dex: 'Captain Barnacle\\'s partner. It counts with eight long arms.' },
  abyssaur: { name: 'Abyssaur', hp: 50, atk: 15, family: 'mixed', moves: ['Deep Roar', 'Glow Bite'], dex: 'Explorer Nyx\\'s partner. A dinosaur from the deepest sea.' },
  tritonix: { name: 'Tritonix', hp: 52, atk: 16, family: 'mixed', moves: ['Trident Strike', 'Tide Turn'], dex: 'Oracle Pearl\\'s partner. Guardian of the Sunken Temple.' },
  leviathorn: { name: 'Leviathorn', hp: 56, atk: 16, family: 'mixed', rarity: 'world', moves: ['Tidal Crash', 'Coral Crown'], dex: 'The Legend of Coral Deep. A sea serpent with a crown of coral.' },""",
    'tiles_js': r"""    // ---------- Coral Deep
    '§': seaSand,
    'ð': (k) => { k.rect(0, 0, 16, 16, '#fbf0d0'); for (const [x, y] of [[3, 3], [10, 2], [6, 9], [13, 11], [2, 13]]) k.rect(x, y, 2, 1, '#d8c094'); k.px(8, 6, '#ffffff'); },
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
    },""",
    'helpers_js': r"""  function seaSand(k) {
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
  }""",
    'creatures_js': r"""    // ---------- Coral Deep
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
    },""",
}
