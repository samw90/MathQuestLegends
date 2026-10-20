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

  // ---------- World 2: Whisperwood (15 wild Legends shared across 5 areas, plus 5 boss partners)
  plusquirrel: { name: 'Plusquirrel', hp: 22, atk: 11, family: 'add', moves: ['Tail Flick', 'Acorn Toss'], dex: 'It stores acorns and always knows how many it has.' },
  otteradd: { name: 'Otteradd', hp: 24, atk: 10, family: 'add', moves: ['Shell Spin', 'River Roll'], dex: 'It floats on its back and adds up shiny shells.' },
  toadtotal: { name: 'Toadtotal', hp: 26, atk: 10, family: 'add', moves: ['Tongue Snap', 'Big Hop'], dex: 'Every croak adds one more. Croak, croak, three!' },
  mothaway: { name: 'Mothaway', hp: 20, atk: 11, family: 'sub', moves: ['Dust Puff', 'Flutter'], dex: 'Its wings fade a little each time it flies away.' },
  beaverbite: { name: 'Beaverbite', hp: 24, atk: 11, family: 'sub', moves: ['Gnaw', 'Tail Slap'], dex: 'It chews logs smaller and smaller. Take away!' },
  snailess: { name: 'Snailess', hp: 26, atk: 9, family: 'sub', moves: ['Shell Tuck', 'Slime Slide'], dex: 'It leaves a little less behind with every slow step.' },
  mossbig: { name: 'Mossbig', hp: 28, atk: 9, family: 'compare', moves: ['Rock Nap', 'Moss Toss'], dex: 'It never moves, so it has lots of time to compare numbers.' },
  heronmore: { name: 'Heronmore', hp: 22, atk: 11, family: 'compare', moves: ['Beak Jab', 'Wade'], dex: 'It stands on one leg and picks the bigger fish every time.' },
  toucount: { name: 'Toucount', hp: 22, atk: 10, family: 'compare', moves: ['Beak Tap', 'Swoop'], dex: 'It keeps tally marks on its giant beak.' },
  mushgroup: { name: 'Mushgroup', hp: 24, atk: 10, family: 'mult', moves: ['Spore Ring', 'Cap Bump'], dex: 'Mushrooms grow in rings of equal groups. So does this one.' },
  dragonfleet: { name: 'Dragonfleet', hp: 20, atk: 12, family: 'mult', moves: ['Wing Buzz', 'Zip'], dex: 'It has two pairs of wings. Two groups of two!' },
  chimpairs: { name: 'Chimpairs', hp: 24, atk: 11, family: 'mult', moves: ['Vine Swing', 'Banana Bonk'], dex: 'It always picks bananas in pairs. Doubles are its favorite.' },
  hedgeshare: { name: 'Hedgeshare', hp: 24, atk: 10, family: 'div', moves: ['Spike Roll', 'Berry Toss'], dex: 'It carries berries on its spikes and shares them fairly.' },
  lilysplit: { name: 'Lilysplit', hp: 24, atk: 10, family: 'div', moves: ['Pad Hop', 'Petal Spin'], dex: 'Its lily pad splits into equal parts, like a pizza.' },
  mistsplit: { name: 'Mistsplit', hp: 20, atk: 12, family: 'div', moves: ['Mist Puff', 'Drizzle'], dex: 'It splits into tiny raindrops, all the same size.' },
  oakulus: { name: 'Oakulus', hp: 38, atk: 12, family: 'mixed', moves: ['Root Stomp', 'Branch Sweep'], dex: 'Warden Fern\'s partner. It has counted its rings for 300 years.' },
  hippomath: { name: 'Hippomath', hp: 40, atk: 12, family: 'mixed', moves: ['Big Splash', 'Yawn'], dex: 'Fisher Finn\'s partner. Its huge yawn solves any puzzle.' },
  crocalc: { name: 'Crocalc', hp: 38, atk: 13, family: 'mixed', moves: ['Chomp', 'Tail Whip'], dex: 'Marsh Mae\'s partner. The bumps on its back are like buttons.' },
  owlgebra: { name: 'Owlgebra', hp: 36, atk: 13, family: 'mixed', moves: ['Hoot Storm', 'Glasses Glint'], dex: 'Scout Wren\'s partner. Its glasses help it spot every pattern.' },
  cascoi: { name: 'Cascoi', hp: 42, atk: 13, family: 'mixed', moves: ['Waterfall', 'Koi Dance'], dex: 'Elder Brook\'s partner. It swam up the falls and became a dragon.' },

  // ---------- Grade ultra rares: 3 per grade. Each waits in one spot and wakes up
  // when you're getting strong at its skill (see SPECIALS below).
  glimmerdot: { name: 'Glimmerdot', hp: 30, atk: 11, family: 'compare', rarity: 'ultra', moves: ['Dot Dazzle', 'Glow Flutter'], dex: 'A rare ladybug with exactly ten dots. It glows when you count them all.' },
  plushbloom: { name: 'Plushbloom', hp: 32, atk: 10, family: 'add', rarity: 'ultra', moves: ['Petal Pop', 'Sunbeam'], dex: 'A rare flower. It grows one more petal for every sum you solve.' },
  hopscotchy: { name: 'Hopscotchy', hp: 30, atk: 12, family: 'mult', rarity: 'ultra', moves: ['Ten Hop', 'Pouch Bop'], dex: 'A rare kangaroo that hops by tens: 10, 20, 30!' },
  tentails: { name: 'Tentails', hp: 32, atk: 12, family: 'add', rarity: 'ultra', moves: ['Tail Fan', 'Make Ten'], dex: 'A rare fox with ten tails. It always makes a ten first.' },
  mirrowl: { name: 'Mirrowl', hp: 32, atk: 11, family: 'mult', rarity: 'ultra', moves: ['Mirror Wing', 'Double Hoot'], dex: 'A rare owl whose two sides match perfectly. Doubles!' },
  riddlynx: { name: 'Riddlynx', hp: 30, atk: 12, family: 'div', rarity: 'ultra', moves: ['Riddle Pounce', 'Mystery Swipe'], dex: 'A rare lynx with a tail shaped like a question mark.' },
  hundrake: { name: 'Hundrake', hp: 34, atk: 12, family: 'compare', rarity: 'ultra', moves: ['Place Blast', 'Scale Shine'], dex: 'A rare dragon with rows of hundreds, tens and ones scales.' },
  arraycorn: { name: 'Arraycorn', hp: 32, atk: 12, family: 'mult', rarity: 'ultra', moves: ['Grid Gallop', 'Horn Spark'], dex: 'A rare unicorn. Its mane grows in neat rows and columns.' },
  halfmoon: { name: 'Halfmoon', hp: 30, atk: 12, family: 'div', rarity: 'ultra', moves: ['Moon Split', 'Star Hop'], dex: 'A rare moon rabbit. Half of it glows, half of it rests.' },
  timesphinx: { name: 'Timesphinx', hp: 36, atk: 12, family: 'mult', rarity: 'ultra', moves: ['Times Roar', 'Sand Riddle'], dex: 'A rare sphinx that asks one times table riddle a day.' },
  dividolphin: { name: 'Dividolphin', hp: 34, atk: 12, family: 'div', rarity: 'ultra', moves: ['Split Splash', 'Leap'], dex: 'A rare dolphin that shares every fish it catches.' },
  rolypolar: { name: 'Rolypolar', hp: 36, atk: 11, family: 'compare', rarity: 'ultra', moves: ['Round Roll', 'Snow Hug'], dex: 'A rare polar bear that rolls numbers to the nearest ten.' },
  blazemult: { name: 'Blazemult', hp: 34, atk: 13, family: 'mult', rarity: 'ultra', moves: ['Flame Burst', 'Rising Wing'], dex: 'A rare fire bird. Its flames multiply as it flies.' },
  pizzapup: { name: 'Pizzapup', hp: 34, atk: 12, family: 'div', rarity: 'ultra', moves: ['Slice Toss', 'Happy Bark'], dex: 'A rare puppy who cuts pizza into perfectly equal slices.' },
  roundolith: { name: 'Roundolith', hp: 40, atk: 11, family: 'compare', rarity: 'ultra', moves: ['Rune Glow', 'Boulder Roll'], dex: 'A rare round stone giant. Its rune rounds big numbers.' },
  decimeow: { name: 'Decimeow', hp: 34, atk: 13, family: 'add', rarity: 'ultra', moves: ['Point Pounce', 'Tenth Swipe'], dex: 'A rare cat with a decimal point on its forehead.' },
  griffinity: { name: 'Griffinity', hp: 38, atk: 13, family: 'mult', rarity: 'ultra', moves: ['Sky Dive', 'Talon Grid'], dex: 'A rare griffin. It solves big times problems in midair.' },
  piewyvern: { name: 'Piewyvern', hp: 36, atk: 13, family: 'div', rarity: 'ultra', moves: ['Pie Toss', 'Wing Gust'], dex: 'A rare wyvern that carries a pie cut into equal parts.' },

  // ---------- World Legends: one waits in each world after its last boss is beaten.
  equalion: { name: 'Equalion', hp: 46, atk: 14, family: 'mixed', rarity: 'world', moves: ['Balance Roar', 'Golden Mane'], dex: 'The Legend of Pinecrest Valley. Its mane makes an equals sign.' },
  whisperstag: { name: 'Whisperstag', hp: 48, atk: 14, family: 'mixed', rarity: 'world', moves: ['Leaf Storm', 'Antler Glow'], dex: 'The Legend of Whisperwood. Its antlers grow a new leaf every spring.' },

  // ---------- The mythical: only for players who clear a world at every grade.
  infinix: { name: 'Infinix', hp: 60, atk: 15, family: 'mixed', rarity: 'mythical', moves: ['Forever Loop', 'Star Swirl'], dex: 'A mythical Legend shaped like infinity. Numbers never end, and neither does it.' },
};

const STARTERS = ['sproutle', 'emberkit', 'splashfin'];

// Each area has a starting level for its wild Legends and one Legend per kind of math.
const AREAS = {
  meadow: { name: 'Route 1', base: 2, boss: 'gridrex', species: { add: 'hootsum', sub: 'snipsnap', compare: 'pebblit', mult: 'buzzlet', div: 'shareling' } },
  shore: { name: 'Sunny Shore', base: 7, boss: 'whalemax', species: { add: 'tallytoise', sub: 'gulpgull', compare: 'starbig', mult: 'octogroup', div: 'jellishare' } },
  canyon: { name: 'Dusty Canyon', base: 12, boss: 'boulderox', species: { add: 'cactotal', sub: 'minusnake', compare: 'lizardo', mult: 'arraydillo', div: 'coyshare' } },
  snow: { name: 'Frostpeak', base: 17, boss: 'tuskmore', species: { add: 'pengplus', sub: 'meltling', compare: 'yetiny', mult: 'flurrfox', div: 'harefrost' } },
  cave: { name: 'Glowcap Cave', base: 22, boss: 'numdrake', species: { add: 'batsum', sub: 'molemin', compare: 'crystling', mult: 'webbit', div: 'glowsplit' } },
  // World 2: Whisperwood. Some Legends live in more than one area.
  forest: { name: 'Whisper Forest', world: 2, base: 26, boss: 'oakulus', species: { add: 'plusquirrel', sub: 'mothaway', compare: 'mossbig', mult: 'mushgroup', div: 'hedgeshare' } },
  river: { name: 'Mirror River', world: 2, base: 30, boss: 'hippomath', species: { add: 'otteradd', sub: 'beaverbite', compare: 'heronmore', mult: 'dragonfleet', div: 'lilysplit' } },
  swamp: { name: 'Bogwater Swamp', world: 2, base: 34, boss: 'crocalc', species: { add: 'toadtotal', sub: 'snailess', compare: 'heronmore', mult: 'dragonfleet', div: 'lilysplit' } },
  treetops: { name: 'Treetop Trail', world: 2, base: 38, boss: 'owlgebra', species: { add: 'plusquirrel', sub: 'mothaway', compare: 'toucount', mult: 'chimpairs', div: 'hedgeshare' } },
  waterfall: { name: 'Thunder Falls', world: 2, base: 42, boss: 'cascoi', species: { add: 'otteradd', sub: 'snailess', compare: 'mossbig', mult: 'chimpairs', div: 'mistsplit' } },
};
const WORLD1_AREAS = ['meadow', 'shore', 'canyon', 'snow', 'cave'];
const WORLD2_AREAS = ['forest', 'river', 'swamp', 'treetops', 'waterfall'];
const AREA_ORDER = [...WORLD1_AREAS, ...WORLD2_AREAS];

// Every Legend once, in the order you meet them.
// Every Legend once, in the order you meet them, with the rare ones at the end.
const RARE = (id) => !!SPECIES[id].rarity;
const DEX_ORDER = [...new Set([...STARTERS, ...AREA_ORDER.flatMap((a) => [...Object.values(AREAS[a].species), AREAS[a].boss]),
  ...Object.keys(SPECIES).filter(RARE)])];

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
  forest: {
    name: 'Warden Fern', badge: 'Fern Badge', flag: 'badge6',
    intro: ['Shh! The forest is listening.', 'I\'m Warden Fern.', 'Let\'s see if you can solve puzzles as calm as a tree.'],
    win: ['Wonderful! The Fern Badge is yours.', 'The bridge to Mirror River is open now.'],
    after: ['The trees say hi, {name}!', 'Mirror River is just north.'],
  },
  river: {
    name: 'Fisher Finn', badge: 'Ripple Badge', flag: 'badge7',
    intro: ['Hey there! I\'m Fisher Finn.', 'I catch fish and I catch mistakes.', 'Cast your best answers!'],
    win: ['What a catch! You earned the Ripple Badge.', 'The boardwalk into Bogwater Swamp is open.'],
    after: ['Nice catch, {name}!', 'Bogwater Swamp is north. Watch your step!'],
  },
  swamp: {
    name: 'Marsh Mae', badge: 'Bog Badge', flag: 'badge8',
    intro: ['Well, hello! I\'m Marsh Mae.', 'Things are slow in the swamp.', 'So take your time and think it through!'],
    win: ['Well done! Here\'s the Bog Badge.', 'The ladder up to Treetop Trail is open.'],
    after: ['Keep it steady, {name}!', 'Treetop Trail is up north.'],
  },
  treetops: {
    name: 'Scout Wren', badge: 'Canopy Badge', flag: 'badge9',
    intro: ['Up here! I\'m Scout Wren.', 'From the treetops, you can spot every pattern.', 'Ready?'],
    win: ['Sharp eyes! The Canopy Badge is yours.', 'The trail down to Thunder Falls is open.'],
    after: ['Look high and low, {name}!', 'Thunder Falls is just ahead.'],
  },
  waterfall: {
    name: 'Elder Brook', badge: 'Cascade Badge', flag: 'badge10',
    intro: ['The falls never stop, and neither do I.', 'I\'m Elder Brook.', 'Show me everything you\'ve learned!'],
    win: ['Splendid! The Cascade Badge is yours.', 'You\'ve mastered all of Whisperwood!'],
    after: ['Whisperwood is proud of you, {name}!', 'The portal behind me leads onward.'],
  },
};
const BADGE_FLAGS = AREA_ORDER.map((a) => BOSSES[a].flag);

// Badges change color with the grade they were won at, so replaying a world at a
// higher grade upgrades them.
const BADGE_TIERS = [
  { name: 'Bronze', color: '#c8834a' }, { name: 'Silver', color: '#c8ccd8' }, { name: 'Gold', color: '#f2c84b' },
  { name: 'Emerald', color: '#3fbf7a' }, { name: 'Sapphire', color: '#4a7ae8' }, { name: 'Crystal', color: '#e0b8ff' },
];

// Worlds: 5 areas each. Beating a world's last boss wakes the next world's portal.
// The Portal Shrine in Pinecrest Town has a portal to every world.
// Worlds 2-5 are planned; their names are working titles until they're built.
const WORLDS = [
  { id: 1, name: 'Pinecrest Valley', color: '#5fb84a', areas: WORLD1_AREAS, start: { map: 'route1', x: 9, y: 16, dir: 'up' }, done: 'badge5' },
  { id: 2, name: 'Whisperwood', color: '#2f8f5a', areas: WORLD2_AREAS, start: { map: 'forest', x: 9, y: 16, dir: 'up' }, done: 'badge10' },
  { id: 3, name: 'Brightport City', color: '#e0a030', areas: [], start: null, done: null },
  { id: 4, name: 'Coral Deep', color: '#3ac4c8', areas: [], start: null, done: null },
  { id: 5, name: 'Sky Isles', color: '#a07ae8', areas: [], start: null, done: null },
];

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
  sage: { id: 'sage', hair: '#f4f4f8', shirt: '#3ac4c8', pants: '#2a5a7a', long: true },
  warden: { id: 'warden', hat: '#2f6b3a', hair: '#7a4a2a', shirt: '#5a8a3a', pants: '#4a3a2a', long: true },
  fisher: { id: 'fisher', hat: '#f2c84b', hair: '#3a2a1a', shirt: '#3a78c4', pants: '#5a4a3a' },
  marsh: { id: 'marsh', hair: '#4a6a3a', shirt: '#8a6aa8', pants: '#3a4a3a', long: true },
  scout: { id: 'scout', hat: '#e8702a', hair: '#5a3418', shirt: '#6a8a3a', pants: '#5a4a3a' },
  elder: { id: 'elder', hair: '#e8e8f0', shirt: '#3a6ab8', pants: '#2a3a5a', long: true },
};

// Tiles:
//   meadow  . grass  , tall grass  f flowers  = path  T tree  ~ water  s sign  g gateway
//   shore   _ sand   ; beach grass  P palm  h shells
//   canyon  : red dirt  " dry brush  K cactus  M mesa rock
//   snow    * snow   ^ snow drift  A pine  i ice
//   cave    q cave floor  % glow moss  Q cave wall  X crystal  u glow mushrooms
//   houses  r/R/C/V roofs (V = Portal Shrine)  w wall  W window  d door
//           4 Rest Center heart  5 lab π badge  6/7 your roof and chimney  8 flower-box window  9 your door
//   forest  F big tree  n forest floor  e ferns  k mushrooms
//   river   - river  B bridge  L reeds  (sand _ from the shore)
//   swamp   z bog water  v bog grass  p boardwalk  J dead tree
//   trees   Z leafy canopy  H deck  l leaf piles  I rope bridge
//   falls   U waterfall  O wet stone  & wet moss  | cliff
//   shrine  j stone floor  Y standing stone  (portals are drawn on top from each map's `portals` list)
//   bosses  four house styles, each roof / roof with emblem / wall / door:
//           cabin D E N S   tent < > ? /   tower # ! [ ]   dome a y $ +
//   inside  x wall  o floor  b shelf  t table  1/2/3 buddy beds  c counter  m exit mat
const SOLID = new Set('T~srRCVwWxbt123c PKMAQXF-zJZU|45678Y#![]DENS<>?/ay$+'.split(''));
// Legends hide in these.
const ENCOUNTER = new Set([',', ';', '"', '^', '%', 'e', 'L', 'v', 'l', '&']);

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
      'T.6676...==..RR5RR.T',
      'T.w98w...==..wWdWw.T',
      'T.f=f....==....=...T',
      'T..=============...T',
      'T........==........T',
      'T.f..s...==...f....T',
      'T........==..CC4CC.T',
      'T........==..wWdWw.T',
      'T~~~.....==....=...T',
      'T~~~.....=========.T',
      '===.s.f..==.....f..T',
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
      { x: 0, y: 12, to: 'shrine', tx: 11, ty: 5, dir: 'left' },
      { x: 9, y: 0, to: 'route1', tx: 9, ty: 16, dir: 'up', need: 'starter', block: 'kidBlock' },
      { x: 10, y: 0, to: 'route1', tx: 10, ty: 16, dir: 'up', need: 'starter', block: 'kidBlock' },
    ],
    signs: { '5,7': ['PINECREST TOWN', 'Every legend starts with 1 + 1.'], '4,12': ['PORTAL SHRINE', 'Follow the path west to the stone circle.'] },
  },

  route1: {
    name: 'Route 1',
    area: 'meadow',
    border: 'T',
    wild: true,
    tiles: [
      'TTTTTTTTTgGTTTTTTTTT',
      'T.....DED==........T',
      'T.,,,,NSN==...,,,,.T',
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
      { x: 7, y: 3, dir: 'down', look: 'ranger', script: 'boss', arg: 'meadow' },
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
      'P~~~_______<><___h_P',
      'P~~~__;;;;_?/?CC4CCP',
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
      { x: 12, y: 3, dir: 'down', look: 'captain', script: 'boss', arg: 'shore' },
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
      'M::::#!#:::::::::::M',
      'M::KK[]["""::CC4CC:M',
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
      { x: 6, y: 3, dir: 'down', look: 'sheriff', script: 'boss', arg: 'canyon' },
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
      'A*CC4CCaya^^^^****iA',
      'A*wWdWw$+$^^^^****iA',
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
      { x: 8, y: 4, dir: 'down', look: 'coach', script: 'boss', arg: 'snow' },
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
      'QXqq#!#qqqqqqqqqqqXQ',
      'Qqqq[][XXqqqCC4CCqqQ',
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
      { x: 5, y: 3, dir: 'down', look: 'keeper', script: 'boss', arg: 'cave' },
      { x: 4, y: 15, dir: 'right', look: 'miner', script: 'caveKid' },
    ],
    portals: [{ x: 11, y: 1, world: 2, show: 'badge5' }],
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

  // ---------- World 2: Whisperwood
  forest: {
    name: 'Whisper Forest',
    area: 'forest',
    border: 'F',
    wild: true,
    heal: [14, 4],
    tiles: [
      'FFFFFFFFFgGFFFFFFFFF',
      'FnnnnnDED==nnnnnnnnF',
      'FneeeeNSN==nCC4CCnnF',
      'Fneeeenkn==nwWdWwnnF',
      'Fnnnnnnnn==nnn=nnnnF',
      'FFFnnFnnn======nnFFF',
      'Fneeeennnn==nnneeeeF',
      'Fneeeennkn==nnneeeeF',
      'Fneeeennnn==nnneeeeF',
      'Fnnnnnnsnn==nnnnnnnF',
      'FnnFFnnnnn==nnFnnnnF',
      'FnnFFneeee==eeeeFnnF',
      'Fnnnnneeee==eeeennnF',
      'Fknnnneeee==eeeennkF',
      'Fnnnnnnnnn==nnnnnnnF',
      'FnFnnnnnnn==nnnnnFnF',
      'Fnnnnnnnnn==nnnnnnnF',
      'FFFFFFFFFFFFFFFFFFFF',
    ],
    npcs: [
      { x: 7, y: 3, dir: 'down', look: 'warden', script: 'boss', arg: 'forest' },
      { x: 15, y: 9, dir: 'left', look: 'hiker', script: 'forestKid' },
    ],
    warps: [
      gate(9, 0, 'river', 9, 16, 'badge6'),
      gate(10, 0, 'river', 10, 16, 'badge6'),
      centerDoor(14, 3),
    ],
    portals: [{ x: 12, y: 16, world: 1, home: true }],
    signs: { '7,9': ['WHISPER FOREST', 'Ferns hide shy Legends. Walk softly!'] },
  },

  river: {
    name: 'Mirror River',
    area: 'river',
    border: 'F',
    wild: true,
    heal: [14, 4],
    tiles: [
      'FFFFFFFFFgGFFFFFFFFF',
      'Fnnnnn<><==nnnnnnnnF',
      'FnLLLL?/?==nCC4CCnnF',
      'FnLLLLnnn==nwWdWwnnF',
      'Fnnnnnnnn==nnn=nnnnF',
      '---------BB---------',
      '---------BB---------',
      'F__LLLL__==___LLLL_F',
      'F__LLLL__==___LLLL_F',
      'F_____s__==________F',
      'Fnnnnnnnn==nnnnnnnnF',
      'FnLLLLnnn==nnnnLLLLF',
      'FnLLLLnnn==nnnnLLLLF',
      'Fnnnnn---BB---nnnnnF',
      'FLLLnn---BB---nnLLLF',
      'FLLLnnnnn==nnnnnLLLF',
      'Fnnnnnnnn==nnnnnnnnF',
      'FFFFFFFFF==FFFFFFFFF',
    ],
    npcs: [
      { x: 7, y: 3, dir: 'down', look: 'fisher', script: 'boss', arg: 'river' },
      { x: 3, y: 9, dir: 'right', look: 'swimmer', script: 'riverKid' },
    ],
    warps: [
      back(9, 17, 'forest', 9, 1),
      back(10, 17, 'forest', 10, 1),
      gate(9, 0, 'swamp', 9, 16, 'badge7'),
      gate(10, 0, 'swamp', 10, 16, 'badge7'),
      centerDoor(14, 3),
    ],
    signs: { '6,9': ['MIRROR RIVER', 'Stay on the bridges. The water is fast!'] },
  },

  swamp: {
    name: 'Bogwater Swamp',
    area: 'swamp',
    border: 'J',
    wild: true,
    heal: [14, 4],
    tiles: [
      'JJJJJJJJJgGJJJJJJJJJ',
      'JvvvvvayappvvvvvvvvJ',
      'Jvzzzv$+$ppvCC4CCvvJ',
      'JvzzzvvvvppvwWdWwvvJ',
      'JvvvvvvvvppvvvpvvvvJ',
      'JzzzzzzzzppzzzzzzzzJ',
      'JvvvvvzzzppzzzvvvvvJ',
      'JvvvvvzzzppzzzvvvvvJ',
      'JvvsvvvvvppvvvvvvvvJ',
      'JzzzvvvvvppvvvvvzzzJ',
      'JzzzvvJvvppvvJvvzzzJ',
      'JvvvvvvvvppvvvvvvvvJ',
      'JvvzzzzvvppvvzzzzvvJ',
      'JvvzzzzvvppvvzzzzvvJ',
      'JvvvvvvvvppvvvvvvvvJ',
      'JJvvvvvvvppvvvvvvvJJ',
      'JvvvvvvvvppvvvvvvvvJ',
      'JJJJJJJJJppJJJJJJJJJ',
    ],
    npcs: [
      { x: 7, y: 3, dir: 'down', look: 'marsh', script: 'boss', arg: 'swamp' },
      { x: 12, y: 8, dir: 'left', look: 'kid', script: 'swampKid' },
    ],
    warps: [
      back(9, 17, 'river', 9, 1),
      back(10, 17, 'river', 10, 1),
      gate(9, 0, 'treetops', 9, 16, 'badge8'),
      gate(10, 0, 'treetops', 10, 16, 'badge8'),
      centerDoor(14, 3),
    ],
    signs: { '3,8': ['BOGWATER SWAMP', 'Stick to the boardwalk if you can!'] },
  },

  treetops: {
    name: 'Treetop Trail',
    area: 'treetops',
    border: 'Z',
    wild: true,
    heal: [13, 4],
    tiles: [
      'ZZZZZZZZZgGZZZZZZZZZ',
      'ZHHHHHDEDHHHHHHHHHHZ',
      'ZHllllNSNHHCC4CCHHHZ',
      'ZHllllHHHHHwWdWwHHHZ',
      'ZHHHHHHHHHHHHHHHHHHZ',
      'ZZZZIZZZZIIZZZZZIZZZ',
      'ZHHHHHHZZIIZZHHHHHHZ',
      'ZHllllHZZIIZZHllllHZ',
      'ZHllllHHHHHHHHllllHZ',
      'ZHHHsHHHHHHHHHHHHHHZ',
      'ZZZZZZZZZIIZZZZZZZZZ',
      'ZHHHHHHHHHHHHHHHHHHZ',
      'ZHlllHHHlllllHHHlllZ',
      'ZHlllHHHlllllHHHlllZ',
      'ZHHHHHHHHHHHHHHHHHHZ',
      'ZHHlllHHHHHHHHlllHHZ',
      'ZHHHHHHHHHHHHHHHHHHZ',
      'ZZZZZZZZZIIZZZZZZZZZ',
    ],
    npcs: [
      { x: 7, y: 3, dir: 'down', look: 'scout', script: 'boss', arg: 'treetops' },
      { x: 16, y: 9, dir: 'left', look: 'girl', script: 'treetopsKid' },
    ],
    warps: [
      back(9, 17, 'swamp', 9, 1),
      back(10, 17, 'swamp', 10, 1),
      gate(9, 0, 'waterfall', 9, 16, 'badge9'),
      gate(10, 0, 'waterfall', 10, 16, 'badge9'),
      centerDoor(13, 3),
    ],
    signs: { '4,9': ['TREETOP TRAIL', 'Hold the ropes on the bridges!'] },
  },

  waterfall: {
    name: 'Thunder Falls',
    area: 'waterfall',
    border: '|',
    wild: true,
    heal: [8, 8],
    tiles: [
      '||||||||||||||||||||',
      '|UUUUUO#!#OOOOUUUUU|',
      '|UUUUUO[][OOOOUUUUU|',
      '|-----OOOOOOOO-----|',
      '|-----OO&&&&OO-----|',
      '|O&&&OOOOOOOOOO&&&O|',
      '|O&&&OCC4CCOOO&&&OO|',
      '|O&&&OwWdWwOOO&&&OO|',
      '|OOOOOOOOOOOOOOOOOO|',
      '|||OO&&&&OO&&&&OO|||',
      '|OOOO&&&&OO&&&&OOOO|',
      '|OsOOOOOOOOOOOOOOOO|',
      '|---OO&&&OO&&&OO---|',
      '|---OO&&&OO&&&OO---|',
      '|OOOOOOOOOOOOOOOOOO|',
      '|OO&&OOOOOOOOOO&&OO|',
      '|OOOOOOOOOOOOOOOOOO|',
      '|||||||||OO|||||||||',
    ],
    npcs: [
      { x: 8, y: 3, dir: 'down', look: 'elder', script: 'boss', arg: 'waterfall' },
      { x: 16, y: 8, dir: 'left', look: 'hiker', script: 'waterfallKid' },
    ],
    warps: [
      back(9, 17, 'treetops', 9, 1),
      back(10, 17, 'treetops', 10, 1),
      centerDoor(8, 7),
    ],
    portals: [{ x: 11, y: 1, world: 3, show: 'badge10' }],
    signs: { '2,11': ['THUNDER FALLS', 'Listen to the roar of the water!'] },
  },

  // An open clearing west of town: standing stones in a ring around five portals.
  shrine: {
    name: 'Portal Shrine',
    border: 'T',
    tiles: [
      'TTTTTTTTTTTTT',
      'Tf...Y.Y...fT',
      'T..Y.jjj.Y..T',
      'T...jjjjj...T',
      'TY.jjjjjjj.YT',
      'T..jjjjjjj..=',
      'TY.jjjjjjj.YT',
      'T...jjjjj...T',
      'T..Y.jjj.Y..T',
      'Tf...Y.Y...fT',
      'TTTTTTTTTTTTT',
    ],
    npcs: [{ x: 6, y: 5, dir: 'down', look: 'sage', script: 'sage' }],
    warps: [{ x: 12, y: 5, to: 'town', tx: 1, ty: 12, dir: 'right' }],
    portals: [
      { x: 6, y: 2, world: 1 }, { x: 9, y: 4, world: 2 }, { x: 8, y: 7, world: 3 },
      { x: 4, y: 7, world: 4 }, { x: 3, y: 4, world: 5 },
    ],
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

// Rare Legends waiting at fixed spots. Ultra rares appear only at their grade, once
// the player is getting strong at their skill. World Legends appear after a world's
// last boss. The mythical appears after a world is cleared at every grade.
const SPECIALS = [
  { id: 'glimmerdot', kind: 'ultra', grade: 0, skill: 'count-10', map: 'route1', x: 1, y: 2 },
  { id: 'plushbloom', kind: 'ultra', grade: 0, skill: 'add-10', map: 'forest', x: 1, y: 2 },
  { id: 'hopscotchy', kind: 'ultra', grade: 0, skill: 'skip-10', map: 'shore', x: 18, y: 15 },
  { id: 'tentails', kind: 'ultra', grade: 1, skill: 'add-20', map: 'canyon', x: 1, y: 2 },
  { id: 'mirrowl', kind: 'ultra', grade: 1, skill: 'doubles', map: 'treetops', x: 1, y: 2 },
  { id: 'riddlynx', kind: 'ultra', grade: 1, skill: 'missing-20', map: 'river', x: 1, y: 2 },
  { id: 'hundrake', kind: 'ultra', grade: 2, skill: 'place-100', map: 'cave', x: 1, y: 3 },
  { id: 'arraycorn', kind: 'ultra', grade: 2, skill: 'equal-groups', map: 'snow', x: 18, y: 2 },
  { id: 'halfmoon', kind: 'ultra', grade: 2, skill: 'halves', map: 'swamp', x: 1, y: 11 },
  { id: 'timesphinx', kind: 'ultra', grade: 3, skill: 'mult-facts', map: 'canyon', x: 18, y: 4 },
  { id: 'dividolphin', kind: 'ultra', grade: 3, skill: 'div-facts', map: 'waterfall', x: 1, y: 15 },
  { id: 'rolypolar', kind: 'ultra', grade: 3, skill: 'round', map: 'snow', x: 1, y: 15 },
  { id: 'blazemult', kind: 'ultra', grade: 4, skill: 'mult-1digit', map: 'canyon', x: 1, y: 14 },
  { id: 'pizzapup', kind: 'ultra', grade: 4, skill: 'equiv-frac', map: 'river', x: 18, y: 2 },
  { id: 'roundolith', kind: 'ultra', grade: 4, skill: 'round-big', map: 'forest', x: 18, y: 2 },
  { id: 'decimeow', kind: 'ultra', grade: 5, skill: 'dec-add', map: 'shore', x: 18, y: 5 },
  { id: 'griffinity', kind: 'ultra', grade: 5, skill: 'mult-2digit', map: 'treetops', x: 18, y: 2 },
  { id: 'piewyvern', kind: 'ultra', grade: 5, skill: 'frac-add', map: 'swamp', x: 18, y: 11 },
  { id: 'equalion', kind: 'world', world: 1, need: 'badge5', map: 'cave', x: 18, y: 3 },
  { id: 'whisperstag', kind: 'world', world: 2, need: 'badge10', map: 'waterfall', x: 18, y: 15 },
  { id: 'infinix', kind: 'mythical', map: 'shrine', x: 6, y: 3 },
];

// Quick-travel stops on the world map, in order, with where each sits on the map picture.
const TRAVEL = [
  { world: 1, map: 'town', label: 'Pinecrest Town', mx: 30, my: 104 },
  { world: 1, map: 'shore', label: 'Sunny Shore', mx: 34, my: 72 },
  { world: 1, map: 'canyon', label: 'Dusty Canyon', mx: 120, my: 70 },
  { world: 1, map: 'snow', label: 'Frostpeak', mx: 84, my: 40 },
  { world: 1, map: 'cave', label: 'Glowcap Cave', mx: 80, my: 12 },
  { world: 2, map: 'forest', label: 'Whisper Forest', mx: 80, my: 116 },
  { world: 2, map: 'river', label: 'Mirror River', mx: 40, my: 96 },
  { world: 2, map: 'swamp', label: 'Bogwater Swamp', mx: 116, my: 72 },
  { world: 2, map: 'treetops', label: 'Treetop Trail', mx: 52, my: 42 },
  { world: 2, map: 'waterfall', label: 'Thunder Falls', mx: 96, my: 14 },
];
