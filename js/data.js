// Game data: creature types, species, people and maps.

const GRADES = ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3'];

const TYPES = {
  plant: { name: 'Plant' },
  fire: { name: 'Fire' },
  water: { name: 'Water' },
  rock: { name: 'Rock' },
  bug: { name: 'Bug' },
  sky: { name: 'Sky' },
};

// Attacks of the key type are super effective against the listed types.
const STRONG = {
  plant: ['water', 'rock'],
  fire: ['plant', 'bug'],
  water: ['fire', 'rock'],
  rock: ['fire', 'sky'],
  bug: ['plant'],
  sky: ['bug', 'plant'],
};

const TOPICS = {
  add: 'Adding',
  sub: 'Taking away',
  count: 'Counting',
  compare: 'Comparing',
  missing: 'Missing numbers',
  skip: 'Skip counting',
  place: 'Tens and ones',
  double: 'Doubles',
  mult: 'Equal groups',
};

const SPECIES = {
  sproutle: {
    name: 'Sproutle', type: 'plant', hp: 22, atk: 11,
    moves: [{ name: 'Leaf Add', topic: 'add', power: 40 }, { name: 'Vine Count', topic: 'count', power: 35 }],
    dex: 'It grows a new leaf when it adds.',
  },
  emberkit: {
    name: 'Emberkit', type: 'fire', hp: 20, atk: 12,
    moves: [{ name: 'Ember Minus', topic: 'sub', power: 40 }, { name: 'Flame Compare', topic: 'compare', power: 35 }],
    dex: 'Its tail glows when it takes away.',
  },
  splashfin: {
    name: 'Splashfin', type: 'water', hp: 24, atk: 10,
    moves: [{ name: 'Bubble Add', topic: 'add', power: 35 }, { name: 'Tide Fill', topic: 'missing', power: 40 }],
    dex: 'It finds lost numbers in the waves.',
  },
  buzzlet: {
    name: 'Buzzlet', type: 'bug', hp: 16, atk: 10,
    moves: [{ name: 'Buzz Skip', topic: 'skip', power: 35 }, { name: 'Sting Minus', topic: 'sub', power: 30 }],
    dex: 'It counts by 2s, 5s, and 10s.',
  },
  pebblit: {
    name: 'Pebblit', type: 'rock', hp: 22, atk: 9,
    moves: [{ name: 'Rock Stack', topic: 'place', power: 40 }, { name: 'Pebble Toss', topic: 'add', power: 30 }],
    dex: 'It stacks rocks in piles of ten.',
  },
  hootsum: {
    name: 'Hootsum', type: 'sky', hp: 20, atk: 10,
    moves: [{ name: 'Twin Gust', topic: 'double', power: 35 }, { name: 'Wing Fill', topic: 'missing', power: 35 }],
    dex: 'It sees doubles everywhere.',
  },
  gridrex: {
    name: 'Gridrex', type: 'rock', hp: 30, atk: 12,
    moves: [{ name: 'Array Slam', topic: 'mult', power: 45 }, { name: 'Grid Stomp', topic: 'compare', power: 35 }],
    dex: 'Its belly is made of squares.',
  },
};

const DEX_ORDER = ['sproutle', 'emberkit', 'splashfin', 'buzzlet', 'pebblit', 'hootsum', 'gridrex'];
const STARTERS = ['sproutle', 'emberkit', 'splashfin'];

const LOOKS = {
  hero: { id: 'hero', hat: '#2a9d8f', hair: '#3a2a1a', shirt: '#f08a3c', pants: '#3a4a8a' },
  mom: { id: 'mom', hair: '#7a4a2a', shirt: '#e86a8a', pants: '#5a5a8a', long: true },
  prof: { id: 'prof', hair: '#c8c8d4', shirt: '#f4f4f8', pants: '#6a6a7a' },
  nurse: { id: 'nurse', hair: '#f08ab0', shirt: '#ffffff', pants: '#f08ab0', long: true },
  kid: { id: 'kid', hair: '#2b2840', shirt: '#5fb84a', pants: '#3a4a8a' },
  girl: { id: 'girl', hair: '#e0a030', shirt: '#7a6ad8', pants: '#3a4a8a', long: true },
  hiker: { id: 'hiker', hat: '#8a5a32', hair: '#5a3418', shirt: '#d0603a', pants: '#5a4a3a' },
  ranger: { id: 'ranger', hat: '#2f6b3a', hair: '#2b2840', shirt: '#3f8f4a', pants: '#4a3a2a' },
};

// Tiles: . grass  , tall grass  f flowers  = path  T tree  ~ water  s sign  g gate
// r/R/C roofs  w wall  W window  d door  x inside wall  o floor  b shelf  t table
// 1/2/3 starter orbs  c counter  m exit mat
const SOLID = new Set('T~sgrRCwWxbt123c '.split(''));

const MAPS = {
  town: {
    name: 'Pinecrest Town',
    border: 'T',
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
      { x: 15, y: 9, to: 'center', tx: 4, ty: 5, dir: 'up' },
      { x: 9, y: 0, to: 'route1', tx: 9, ty: 16, dir: 'up', need: 'starter', block: 'kidBlock' },
      { x: 10, y: 0, to: 'route1', tx: 10, ty: 16, dir: 'up', need: 'starter', block: 'kidBlock' },
    ],
    signs: {
      '5,7': ['PINECREST TOWN', 'Every legend starts with 1 + 1.'],
    },
  },

  route1: {
    name: 'Route 1',
    border: 'T',
    tiles: [
      'TTTTTTTTTggTTTTTTTTT',
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
      { x: 9, y: 1, dir: 'down', look: 'ranger', script: 'ranger' },
      { x: 4, y: 10, dir: 'right', look: 'hiker', script: 'hiker' },
      { x: 12, y: 5, dir: 'left', look: 'kid', script: 'routeKid' },
    ],
    warps: [
      { x: 9, y: 17, to: 'town', tx: 9, ty: 1, dir: 'down' },
      { x: 10, y: 17, to: 'town', tx: 10, ty: 1, dir: 'down' },
    ],
    signs: {
      '13,8': ['ROUTE 1', 'Wild Legends hide in tall grass!'],
      '9,0': ['Route 2 is not ready yet.', 'Come back soon!'],
      '10,0': ['Route 2 is not ready yet.', 'Come back soon!'],
    },
    wild: [
      { sp: 'buzzlet', p: 0.4, min: 2, max: 4 },
      { sp: 'pebblit', p: 0.35, min: 2, max: 4 },
      { sp: 'hootsum', p: 0.25, min: 3, max: 5 },
    ],
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
    warps: [{ x: 4, y: 6, to: 'town', tx: 15, ty: 10, dir: 'down' }],
    signs: {},
  },
};
