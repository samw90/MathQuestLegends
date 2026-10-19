// Game data: Legends, people and maps.

const GRADES = ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3'];

// Every wild Legend asks one kind of math puzzle (its `family`), so kids learn
// "Snipsnap means taking away". The game sends the Legends that match the
// skills a player most needs to practise. Sidekicks have no family: they
// help with every kind of math.
const SPECIES = {
  sproutle: {
    name: 'Sproutle', hp: 22, atk: 11, sidekick: true,
    moves: ['Leaf Swipe', 'Vine Whip'],
    dex: 'A cheerful sprout. It loves to help you think.',
  },
  emberkit: {
    name: 'Emberkit', hp: 20, atk: 12, sidekick: true,
    moves: ['Ember Pounce', 'Warm Glow'],
    dex: 'A brave little cat. Its tail glows when it has an idea.',
  },
  splashfin: {
    name: 'Splashfin', hp: 24, atk: 10, sidekick: true,
    moves: ['Bubble Burst', 'Tail Splash'],
    dex: 'A calm fish. It blows a bubble when it finds the answer.',
  },
  hootsum: {
    name: 'Hootsum', hp: 20, atk: 10, family: 'add',
    moves: ['Plus Gust', 'Wing Flap'],
    dex: 'Its puzzles are about adding. See the plus on its chest?',
  },
  snipsnap: {
    name: 'Snipsnap', hp: 20, atk: 10, family: 'sub',
    moves: ['Snip Away', 'Claw Pinch'],
    dex: 'Its puzzles are about taking away. Snip, snip!',
  },
  pebblit: {
    name: 'Pebblit', hp: 22, atk: 9, family: 'compare',
    moves: ['Rock Roll', 'Pebble Toss'],
    dex: 'Its puzzles ask which number is bigger.',
  },
  buzzlet: {
    name: 'Buzzlet', hp: 18, atk: 10, family: 'mult',
    moves: ['Buzz Loop', 'Group Sting'],
    dex: 'Its puzzles are about equal groups. It counts by 2s, 5s, and 10s.',
  },
  shareling: {
    name: 'Shareling', hp: 22, atk: 10, family: 'div',
    moves: ['Spore Share', 'Cap Bonk'],
    dex: 'Its puzzles are about sharing equally. It splits its cap with friends.',
  },
  gridrex: {
    name: 'Gridrex', hp: 30, atk: 12, family: 'mixed',
    moves: ['Grid Stomp', 'Array Slam'],
    dex: 'Ranger Rowan\'s partner. Its puzzles mix every kind of math.',
  },
};

// Which wild Legend asks each kind of math.
const FAMILY_SPECIES = { add: 'hootsum', sub: 'snipsnap', compare: 'pebblit', mult: 'buzzlet', div: 'shareling' };

const DEX_ORDER = ['sproutle', 'emberkit', 'splashfin', 'hootsum', 'snipsnap', 'pebblit', 'buzzlet', 'shareling', 'gridrex'];
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
// 1/2/3 sidekick beds  c counter  m exit mat
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
    wild: true,
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
