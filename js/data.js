// Game data: Legends, areas, bosses, people and maps.

const GRADES = ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

// Every wild Legend asks one kind of math puzzle (its `family`), so kids learn
// "Snipsnap means taking away". Each area has its own Legend for every kind of
// math, and the game sends the ones that match the skills a player most needs
// to practise. Sidekicks have no family: they help with every kind of math.
// Bosses ("mixed") ask a bit of everything.
const SPECIES = {
  // buddies
  sproutle: { name: 'Sproutle', hp: 22, atk: 11, sidekick: true, moves: ['Leaf Swipe', 'Vine Whip'], dex: 'A cheerful little sprout who loves helping you think.' },
  emberkit: { name: 'Emberkit', hp: 20, atk: 12, sidekick: true, moves: ['Ember Pounce', 'Warm Glow'], dex: 'A brave little cat. Its tail glows whenever it gets an idea.' },
  splashfin: { name: 'Splashfin', hp: 24, atk: 10, sidekick: true, moves: ['Bubble Burst', 'Tail Splash'], dex: 'A calm little fish. It blows a bubble when it finds the answer.' },

  // Route 1 meadow
  hootsum: { name: 'Hootsum', hp: 20, atk: 10, family: 'add', moves: ['Plus Gust', 'Wing Flap'], dex: 'It loves adding puzzles. See the plus sign on its chest?' },
  snipsnap: { name: 'Snipsnap', hp: 20, atk: 10, family: 'sub', moves: ['Snip Away', 'Claw Pinch'], dex: 'It loves take-away puzzles. Snip, snip!' },
  pebblit: { name: 'Pebblit', hp: 22, atk: 9, family: 'compare', moves: ['Rock Roll', 'Pebble Toss'], dex: 'It loves asking which number is bigger.' },
  buzzlet: { name: 'Buzzlet', hp: 18, atk: 10, family: 'mult', moves: ['Buzz Loop', 'Group Sting'], dex: 'It loves equal groups and counts by 2s, 5s, and 10s.' },
  shareling: { name: 'Shareling', hp: 22, atk: 10, family: 'div', moves: ['Spore Share', 'Cap Bonk'], dex: 'It loves sharing things equally, even its own cap!' },
  gridrex: { name: 'Gridrex', hp: 30, atk: 12, family: 'mixed', moves: ['Grid Stomp', 'Array Slam'], dex: 'Ranger Rowan\'s partner. It loves every kind of math puzzle.' },

  // Sunny Shore
  tallytoise: { name: 'Tallytoise', hp: 26, atk: 9, family: 'add', moves: ['Shell Spin', 'Tally Tap'], dex: 'It keeps count with tally marks on its shell.' },
  gulpgull: { name: 'Gulpgull', hp: 19, atk: 11, family: 'sub', moves: ['Swoop', 'Gulp'], dex: 'It gulps down snacks, so there are always fewer left.' },
  starbig: { name: 'Starbig', hp: 22, atk: 10, family: 'compare', moves: ['Star Spin', 'Shine'], dex: 'It always wants to know which pile is bigger.' },
  octogroup: { name: 'Octogroup', hp: 22, atk: 10, family: 'mult', moves: ['Ink Splash', 'Eight Arm Hug'], dex: 'Eight arms make it great at equal groups.' },
  jellishare: { name: 'Jellishare', hp: 20, atk: 11, family: 'div', moves: ['Jelly Wobble', 'Zap'], dex: 'It floats along sharing bubbles with everyone.' },
  whalemax: { name: 'Whalemax', hp: 34, atk: 12, family: 'mixed', moves: ['Tidal Splash', 'Spout'], dex: 'Captain Marina\'s partner. Its spout shoots puzzles into the sky.' },

  // Dusty Canyon
  cactotal: { name: 'Cactotal', hp: 24, atk: 10, family: 'add', moves: ['Needle Poke', 'Bloom'], dex: 'It grows a new flower for every number it adds.' },
  minusnake: { name: 'Minusnake', hp: 20, atk: 11, family: 'sub', moves: ['Hiss', 'Coil Squeeze'], dex: 'It wiggles away with part of whatever it finds.' },
  lizardo: { name: 'Lizardo', hp: 21, atk: 11, family: 'compare', moves: ['Frill Flash', 'Tail Whip'], dex: 'It puffs up its frill to look bigger than it is.' },
  arraydillo: { name: 'Arraydillo', hp: 24, atk: 10, family: 'mult', moves: ['Roll Out', 'Band Bash'], dex: 'The bands on its back line up in neat rows.' },
  coyshare: { name: 'Coyshare', hp: 21, atk: 11, family: 'div', moves: ['Howl', 'Quick Bite'], dex: 'It shares its food fairly with the whole pack.' },
  boulderox: { name: 'Boulderox', hp: 36, atk: 13, family: 'mixed', moves: ['Horn Charge', 'Rock Slide'], dex: 'Sheriff Sol\'s partner. Strong as a mountain.' },

  // Frostpeak
  pengplus: { name: 'Pengplus', hp: 23, atk: 11, family: 'add', moves: ['Belly Slide', 'Flipper Slap'], dex: 'It slides down hills, adding up speed as it goes.' },
  meltling: { name: 'Meltling', hp: 21, atk: 11, family: 'sub', moves: ['Snowball', 'Drip'], dex: 'A little snow melts away each time it takes away.' },
  yetiny: { name: 'Yetiny', hp: 24, atk: 11, family: 'compare', moves: ['Stomp', 'Fluff Puff'], dex: 'A tiny yeti who dreams of being the biggest.' },
  flurrfox: { name: 'Flurrfox', hp: 22, atk: 12, family: 'mult', moves: ['Frost Pounce', 'Flurry'], dex: 'It counts snowflakes in groups as they fall.' },
  harefrost: { name: 'Harefrost', hp: 21, atk: 12, family: 'div', moves: ['Ice Hop', 'Ear Flick'], dex: 'It splits its carrots evenly with its friends.' },
  tuskmore: { name: 'Tuskmore', hp: 38, atk: 13, family: 'mixed', moves: ['Tusk Toss', 'Blizzard'], dex: 'Coach Ivy\'s partner. Warm, woolly, and very wise.' },

  // Glowcap Cave
  batsum: { name: 'Batsum', hp: 22, atk: 12, family: 'add', moves: ['Wing Beat', 'Echo'], dex: 'It hangs upside down and adds up the stars.' },
  molemin: { name: 'Molemin', hp: 24, atk: 12, family: 'sub', moves: ['Dig', 'Claw Scratch'], dex: 'It digs away dirt, one scoop at a time.' },
  crystling: { name: 'Crystling', hp: 26, atk: 11, family: 'compare', moves: ['Gem Gleam', 'Crystal Crash'], dex: 'Its crystals grow bigger when it compares numbers.' },
  webbit: { name: 'Webbit', hp: 22, atk: 12, family: 'mult', moves: ['Web Weave', 'Leg Sweep'], dex: 'It weaves its webs in perfect rows and columns.' },
  glowsplit: { name: 'Glowsplit', hp: 22, atk: 12, family: 'div', moves: ['Flash', 'Glow Dart'], dex: 'It shares its light so the whole cave can see.' },
  numdrake: { name: 'Numdrake', hp: 40, atk: 14, family: 'mixed', moves: ['Crystal Breath', 'Wing Storm'], dex: 'Keeper Onyx\'s partner. The legend of the cave.' },
};

const STARTERS = ['sproutle', 'emberkit', 'splashfin'];

// Each area has a starting level for its wild Legends and one Legend per kind of math.
const AREAS = {
  meadow: { name: 'Route 1', base: 2, boss: 'gridrex', species: { add: 'hootsum', sub: 'snipsnap', compare: 'pebblit', mult: 'buzzlet', div: 'shareling' } },
  shore: { name: 'Sunny Shore', base: 7, boss: 'whalemax', species: { add: 'tallytoise', sub: 'gulpgull', compare: 'starbig', mult: 'octogroup', div: 'jellishare' } },
  canyon: { name: 'Dusty Canyon', base: 12, boss: 'boulderox', species: { add: 'cactotal', sub: 'minusnake', compare: 'lizardo', mult: 'arraydillo', div: 'coyshare' } },
  snow: { name: 'Frostpeak', base: 17, boss: 'tuskmore', species: { add: 'pengplus', sub: 'meltling', compare: 'yetiny', mult: 'flurrfox', div: 'harefrost' } },
  cave: { name: 'Glowcap Cave', base: 22, boss: 'numdrake', species: { add: 'batsum', sub: 'molemin', compare: 'crystling', mult: 'webbit', div: 'glowsplit' } },
};
const AREA_ORDER = ['meadow', 'shore', 'canyon', 'snow', 'cave'];

const DEX_ORDER = [...STARTERS, ...AREA_ORDER.flatMap((a) => [...Object.values(AREAS[a].species), AREAS[a].boss])];

// One boss guards the way out of each area.
const BOSSES = {
  meadow: {
    name: 'Ranger Rowan', badge: 'Sum Badge', flag: 'badge1',
    intro: ['I\'m Ranger Rowan.', 'I keep watch over the road north.', 'Let\'s see your math power!'],
    win: ['Wow, you two make a great team!', 'This Sum Badge is yours!', 'The road north to Sunny Shore is open now.'],
    after: ['Great job, {name}!', 'Sunny Shore is just north of here.'],
  },
  shore: {
    name: 'Captain Marina', badge: 'Wave Badge', flag: 'badge2',
    intro: ['Ahoy! I\'m Captain Marina.', 'Nobody sails past me without solving my puzzles!', 'Ready?'],
    win: ['Splendid! You earned the Wave Badge!', 'The trail to Dusty Canyon is open.'],
    after: ['Fair winds, {name}!', 'Dusty Canyon is north of here.'],
  },
  canyon: {
    name: 'Sheriff Sol', badge: 'Mesa Badge', flag: 'badge3',
    intro: ['Howdy! I\'m Sheriff Sol.', 'Out here, we solve puzzles fast and fair.', 'Let\'s see what you\'ve got!'],
    win: ['Well, I\'ll be! The Mesa Badge is yours.', 'The path up to Frostpeak is open.'],
    after: ['Nice work, {name}!', 'Bundle up! Frostpeak is cold.'],
  },
  snow: {
    name: 'Coach Ivy', badge: 'Frost Badge', flag: 'badge4',
    intro: ['Hi! I\'m Coach Ivy.', 'Cold weather, warm brains!', 'Let\'s go!'],
    win: ['Amazing! You earned the Frost Badge!', 'Glowcap Cave is open now. Be brave!'],
    after: ['Keep it up, {name}!', 'Glowcap Cave is just north.'],
  },
  cave: {
    name: 'Keeper Onyx', badge: 'Crystal Badge', flag: 'badge5',
    intro: ['So, you made it to the heart of the cave.', 'I\'m Keeper Onyx.', 'Only true Math Legends get past me. Show me!'],
    win: ['Wow! You earned the Crystal Badge!', 'You are a true Math Quest Legend!'],
    after: ['You\'re a true Math Quest Legend, {name}!', 'Keep practicing. Your team will keep growing!'],
  },
};
const BADGE_FLAGS = AREA_ORDER.map((a) => BOSSES[a].flag);

const LOOKS = {
  hero: { id: 'hero', hat: '#2a9d8f', hair: '#3a2a1a', shirt: '#f08a3c', pants: '#3a4a8a' },
  mom: { id: 'mom', hair: '#7a4a2a', shirt: '#e86a8a', pants: '#5a5a8a', long: true },
  prof: { id: 'prof', hair: '#c8c8d4', shirt: '#f4f4f8', pants: '#6a6a7a' },
  nurse: { id: 'nurse', hair: '#f08ab0', shirt: '#ffffff', pants: '#f08ab0', long: true },
  kid: { id: 'kid', hair: '#2b2840', shirt: '#5fb84a', pants: '#3a4a8a' },
  girl: { id: 'girl', hair: '#e0a030', shirt: '#7a6ad8', pants: '#3a4a8a', long: true },
  hiker: { id: 'hiker', hat: '#8a5a32', hair: '#5a3418', shirt: '#d0603a', pants: '#5a4a3a' },
  swimmer: { id: 'swimmer', hair: '#e86a3a', shirt: '#3ac4c8', pants: '#f2c84b' },
  skier: { id: 'skier', hat: '#e8506a', hair: '#5a3418', shirt: '#4a9ae8', pants: '#2b2840' },
  miner: { id: 'miner', hat: '#f2c84b', hair: '#3a2a1a', shirt: '#8a6a4a', pants: '#4a3a2a' },
  ranger: { id: 'ranger', hat: '#2f6b3a', hair: '#2b2840', shirt: '#3f8f4a', pants: '#4a3a2a' },
  captain: { id: 'captain', hat: '#2a3a6a', hair: '#3a2a1a', shirt: '#f4f4f8', pants: '#2a3a6a' },
  sheriff: { id: 'sheriff', hat: '#a0703a', hair: '#5a3418', shirt: '#d8b070', pants: '#5a4a3a' },
  coach: { id: 'coach', hair: '#e0a030', shirt: '#4a9ae8', pants: '#2b2840', long: true },
  keeper: { id: 'keeper', hat: '#5a3a94', hair: '#c8c8d4', shirt: '#7a4ab8', pants: '#3a2a5a' },
};

// Tiles:
//   meadow  . grass  , tall grass  f flowers  = path  T tree  ~ water  s sign  g gateway
//   shore   _ sand   ; beach grass  P palm  h shells
//   canyon  : red dirt  " dry brush  K cactus  M mesa rock
//   snow    * snow   ^ snow drift  A pine  i ice
//   cave    q cave floor  % glow moss  Q cave wall  X crystal  u glow mushrooms
//   houses  r/R/C roofs  w wall  W window  d door
//   inside  x wall  o floor  b shelf  t table  1/2/3 buddy beds  c counter  m exit mat
const SOLID = new Set('T~srRCwWxbt123c PKMAQX'.split(''));
// Legends hide in these.
const ENCOUNTER = new Set([',', ';', '"', '^', '%']);

// Rest Center doors take you to the shared Rest Center and bring you back.
const centerDoor = (x, y) => ({ x, y, to: 'center', tx: 4, ty: 5, dir: 'up', ret: [x, y + 1] });
const gate = (x, y, to, tx, ty, need) => ({ x, y, to, tx, ty, dir: 'up', need, block: 'gate' });
const back = (x, y, to, tx, ty) => ({ x, y, to, tx, ty, dir: 'down' });

const MAPS = {
  town: {
    name: 'Pinecrest Town',
    border: 'T',
    heal: [15, 10],
    tiles: [
      'TTTTTTTTT==TTTTTTTTT',
      'T.......f==f.......T',
      'T.rrrr...==..RRRRR.T',
      'T.wdWw...==..wWdWw.T',
      'T..=.....==....=...T',
      'T..=============...T',
      'T........==........T',
      'T.f..s...==...f....T',
      'T........==..CCCCC.T',
      'T........==..wWdWw.T',
      'T~~~.....==....=...T',
      'T~~~.....=========.T',
      'T~~~..f..==.....f..T',
      'T........==........T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
    npcs: [
      { x: 11, y: 2, dir: 'left', look: 'kid', script: 'kid' },
      { x: 6, y: 12, dir: 'down', look: 'girl', script: 'girl' },
    ],
    warps: [
      { x: 3, y: 3, to: 'house', tx: 3, ty: 5, dir: 'up' },
      { x: 15, y: 3, to: 'lab', tx: 4, ty: 6, dir: 'up' },
      centerDoor(15, 9),
      { x: 9, y: 0, to: 'route1', tx: 9, ty: 16, dir: 'up', need: 'starter', block: 'kidBlock' },
      { x: 10, y: 0, to: 'route1', tx: 10, ty: 16, dir: 'up', need: 'starter', block: 'kidBlock' },
    ],
    signs: { '5,7': ['PINECREST TOWN', 'Every legend starts with 1 + 1.'] },
  },

  route1: {
    name: 'Route 1',
    area: 'meadow',
    border: 'T',
    wild: true,
    tiles: [
      'TTTTTTTTTgGTTTTTTTTT',
      'T........==........T',
      'T.,,,,...==...,,,,.T',
      'T.,,,,...==...,,,,.T',
      'T.,,,,...==...,,,,.T',
      'T........==........T',
      'TTTTT....==....TTTTT',
      'T,,,,,...==........T',
      'T,,,,,...==..s.....T',
      'T,,,,,...=======...T',
      'T..............=...T',
      'T...TTTT.......=,,,T',
      'T...TTTT..,,,,.=,,,T',
      'T.........,,,,.=,,,T',
      'T.........,,,,.=...T',
      'T........=======...T',
      'T..ff....==..ff....T',
      'TTTTTTTTT==TTTTTTTTT',
    ],
    npcs: [
      { x: 8, y: 1, dir: 'down', look: 'ranger', script: 'boss', arg: 'meadow' },
      { x: 4, y: 10, dir: 'right', look: 'hiker', script: 'hiker' },
      { x: 12, y: 5, dir: 'left', look: 'kid', script: 'routeKid' },
    ],
    warps: [
      back(9, 17, 'town', 9, 1),
      back(10, 17, 'town', 10, 1),
      gate(9, 0, 'shore', 9, 16, 'badge1'),
      gate(10, 0, 'shore', 10, 16, 'badge1'),
    ],
    signs: { '13,8': ['ROUTE 1', 'Wild Legends hide in the tall grass!'] },
  },

  shore: {
    name: 'Sunny Shore',
    area: 'shore',
    border: '~',
    wild: true,
    heal: [16, 4],
    tiles: [
      'PPPPPPPPPgGPPPPPPPPP',
      'P~~~_____________h_P',
      'P~~~__;;;;____CCCCCP',
      'P~~~__;;;;____wWdWwP',
      'P~~~_______________P',
      'P~~_____P_____P____P',
      'P~~_;;;;_____;;;;__P',
      'P~~_;;;;__h__;;;;__P',
      'P~~_;;;;_____;;;;__P',
      'P~~__________s_____P',
      'P~~~_____P_____P___P',
      'P~~~_;;;;;;;;;;____P',
      'P~~~_;;;;;;;;;;____P',
      'P~~~___________h___P',
      'P~~~~____P__P______P',
      'P~~~~______________P',
      'P~~~~____h_________P',
      'PPPPPPPPP__PPPPPPPPP',
    ],
    npcs: [
      { x: 11, y: 1, dir: 'down', look: 'captain', script: 'boss', arg: 'shore' },
      { x: 6, y: 4, dir: 'down', look: 'swimmer', script: 'shoreKid' },
    ],
    warps: [
      back(9, 17, 'route1', 9, 1),
      back(10, 17, 'route1', 10, 1),
      gate(9, 0, 'canyon', 9, 16, 'badge2'),
      gate(10, 0, 'canyon', 10, 16, 'badge2'),
      centerDoor(16, 3),
    ],
    signs: { '13,9': ['SUNNY SHORE', 'The Rest Center is up north.'] },
  },

  canyon: {
    name: 'Dusty Canyon',
    area: 'canyon',
    border: 'M',
    wild: true,
    heal: [15, 4],
    tiles: [
      'MMMMMMMMMgGMMMMMMMMM',
      'M::::::::::::::::::M',
      'M::KK::""""::CCCCC:M',
      'M::::::""""::wWdWw:M',
      'M:::::::::::::::K::M',
      'M:MMM::::::::MMM:::M',
      'M:MMM:""""":::MMM::M',
      'M:::::""""":::::K::M',
      'M::K::"""""::::::::M',
      'M:::::::::s::::::::M',
      'MMMM::::::::::::MMMM',
      'M""""::K::::K::""""M',
      'M""""::::::::::""""M',
      'M""""::::::::::""""M',
      'M::::::MM::MM::::::M',
      'M:K::::::::::::::K:M',
      'M::::::::::::::::::M',
      'MMMMMMMMM::MMMMMMMMM',
    ],
    npcs: [
      { x: 11, y: 1, dir: 'down', look: 'sheriff', script: 'boss', arg: 'canyon' },
      { x: 5, y: 4, dir: 'down', look: 'hiker', script: 'canyonHiker' },
    ],
    warps: [
      back(9, 17, 'shore', 9, 1),
      back(10, 17, 'shore', 10, 1),
      gate(9, 0, 'snow', 9, 16, 'badge3'),
      gate(10, 0, 'snow', 10, 16, 'badge3'),
      centerDoor(15, 3),
    ],
    signs: { '10,9': ['DUSTY CANYON', 'Watch out for cactus!'] },
  },

  snow: {
    name: 'Frostpeak',
    area: 'snow',
    border: 'A',
    wild: true,
    heal: [4, 4],
    tiles: [
      'AAAAAAAAAgGAAAAAAAAA',
      'A******************A',
      'A*CCCCC***^^^^****iA',
      'A*wWdWw***^^^^****iA',
      'A******************A',
      'A**AA*****ii****AA*A',
      'A^^^^^**********^^^A',
      'A^^^^^***A**A***^^^A',
      'A^^^^^**********^^^A',
      'A*******s**********A',
      'AAA**iiii****iii*AAA',
      'A*****^^^^^^^^*****A',
      'A*A***^^^^^^^^***A*A',
      'A*****^^^^^^^^*****A',
      'A***A**********A***A',
      'A******************A',
      'A******************A',
      'AAAAAAAAA**AAAAAAAAA',
    ],
    npcs: [
      { x: 11, y: 1, dir: 'down', look: 'coach', script: 'boss', arg: 'snow' },
      { x: 15, y: 4, dir: 'left', look: 'skier', script: 'snowKid' },
    ],
    warps: [
      back(9, 17, 'canyon', 9, 1),
      back(10, 17, 'canyon', 10, 1),
      gate(9, 0, 'cave', 9, 16, 'badge4'),
      gate(10, 0, 'cave', 10, 16, 'badge4'),
      centerDoor(4, 3),
    ],
    signs: { '8,9': ['FROSTPEAK', 'Stay warm out there!'] },
  },

  cave: {
    name: 'Glowcap Cave',
    area: 'cave',
    border: 'Q',
    wild: true,
    heal: [14, 4],
    tiles: [
      'QQQQQQQQQQQQQQQQQQQQ',
      'QXqqqqqqqqqqqqqqqqXQ',
      'QqqqqqqXXqqqCCCCCqqQ',
      'Qq%%%%qqqqqqwWdWwqqQ',
      'Qq%%%%qqquqqqqqqqqqQ',
      'QqqqqqqQQQQqqqqqqXqQ',
      'Qq%%%%%qqqqqq%%%%%qQ',
      'QX%%%%%qquqqq%%%%%qQ',
      'Qq%%%%%qqqqqq%%%%%XQ',
      'QqqqqqqqqsqqqqqqqqqQ',
      'QQQqqqqXqqqqXqqqqQQQ',
      'Qq%%%%%%qqqq%%%%%%qQ',
      'Qq%%%%%%quuq%%%%%%qQ',
      'Qq%%%%%%qqqq%%%%%%qQ',
      'QqqqXqqqqqqqqqqXqqqQ',
      'QqqqqqqqqqqqqqqqqqqQ',
      'QqqqqqqqqqqqqqqqqqqQ',
      'QQQQQQQQQqqQQQQQQQQQ',
    ],
    npcs: [
      { x: 9, y: 1, dir: 'down', look: 'keeper', script: 'boss', arg: 'cave' },
      { x: 4, y: 15, dir: 'right', look: 'miner', script: 'caveKid' },
    ],
    warps: [
      back(9, 17, 'snow', 9, 1),
      back(10, 17, 'snow', 10, 1),
      centerDoor(14, 3),
    ],
    signs: { '9,9': ['GLOWCAP CAVE', 'The crystals glow brighter the deeper you go.'] },
  },

  house: {
    name: 'Your House',
    border: ' ',
    tiles: [
      'xxxxxxxx',
      'xbbooobx',
      'xoooooox',
      'xoottoox',
      'xoooooox',
      'xoooooox',
      'xxxmxxxx',
    ],
    npcs: [{ x: 5, y: 2, dir: 'down', look: 'mom', script: 'mom' }],
    warps: [{ x: 3, y: 6, to: 'town', tx: 3, ty: 4, dir: 'down' }],
    signs: {},
  },

  lab: {
    name: 'Pi Lab',
    border: ' ',
    tiles: [
      'xxxxxxxxxx',
      'xbbboobbbx',
      'xoooooooox',
      'xoo123ooox',
      'xoooooooox',
      'xoooooooox',
      'xoooooooox',
      'xxxxmxxxxx',
    ],
    npcs: [{ x: 7, y: 3, dir: 'left', look: 'prof', script: 'prof' }],
    warps: [{ x: 4, y: 7, to: 'town', tx: 15, ty: 4, dir: 'down' }],
    signs: {},
  },

  // Shared by every Rest Center. The mat returns you to the door you came in.
  center: {
    name: 'Rest Center',
    border: ' ',
    tiles: [
      'xxxxxxxxxx',
      'xboooooobx',
      'xccccccoox',
      'xoooooooox',
      'xoooooooox',
      'xoooooooox',
      'xxxxmxxxxx',
    ],
    npcs: [{ x: 3, y: 1, dir: 'down', look: 'nurse', script: 'nurse' }],
    warps: [{ x: 4, y: 6, to: '@return' }],
    signs: {},
  },
};

// Quick-travel stops on the world map, in order, with where each sits on the map picture.
const TRAVEL = [
  { map: 'town', label: 'Pinecrest Town', mx: 30, my: 104 },
  { map: 'shore', label: 'Sunny Shore', mx: 34, my: 72 },
  { map: 'canyon', label: 'Dusty Canyon', mx: 120, my: 70 },
  { map: 'snow', label: 'Frostpeak', mx: 84, my: 40 },
  { map: 'cave', label: 'Glowcap Cave', mx: 80, my: 12 },
];
