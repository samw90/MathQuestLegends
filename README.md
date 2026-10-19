# Math Quest Legends

A pixel-art creature-catching adventure for Kindergarten to Grade 3, in the style of classic handheld RPGs. Every battle move is a math problem: answer right to attack, answer fast for extra power. It's a sister game to Math Quest.

## How to play

- Pick a partner Legend at Professor Pi's lab: Sproutle, Emberkit or Splashfin.
- Walk through the tall grass on Route 1 to meet wild Legends.
- In battle, choose **ATTACK** and pick a move. Each move is a different kind of math (adding, taking away, counting, and so on).
  - Right answer: your Legend hits, and the foe's hit back is cut in half.
  - Fast right answer: extra power.
  - Wrong answer: the attack misses and the game shows the right answer.
- Make a wild Legend weak, then throw a **Quest Orb** and answer a problem to catch it.
- Beat Ranger Rowan at the end of Route 1 to earn the Sum Badge.
- The Rest Center (pink roof) heals your team and refills Quest Orbs. If your whole team gets tired, you wake up there. Nothing is lost.

**Controls:** on-screen D-pad, A, B and MENU buttons, or the keyboard: arrows/WASD to move, Z or Space for A, X for B, and Enter for the menu. During a question, 1–4 pick an answer.

## For grown-ups

- **Grade:** set at the start and changeable any time in MENU → Settings. Problems follow Common Core topics for that grade.
- **Read aloud:** the game reads dialog and questions out loud using the device's voice. It's on by default for Kindergarten and Grade 1. The 🔊 button on a question repeats it.
- **Progress:** MENU → Grown-ups shows how many problems were answered right in each topic.
- Progress is saved on the device (browser storage). Nothing is sent anywhere.

## Running it

It's a plain static site with no build step. Serve the folder and open it in a browser:

```bash
python3 -m http.server 8000
```

Then go to http://localhost:8000. It also works offline after the first visit, and it can be added to a phone's home screen.

To publish it, push to GitHub and turn on GitHub Pages for the `main` branch (Settings → Pages).

## Files

- `index.html`, `style.css`: the page and the handheld-console look
- `js/data.js`: creatures, moves, people and maps
- `js/art.js`: all pixel art, drawn in code
- `js/math.js`: math problem generators for each topic and grade
- `js/game.js`: movement, dialog, menus, battles and saving
- `sw.js`, `manifest.webmanifest`, `*.png`: offline support and app icons
