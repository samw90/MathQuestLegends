# Math Quest Legends

A pixel-art adventure for Kindergarten to Grade 3 in the style of classic handheld RPGs. You explore with your buddy, solve wild Legends' math puzzles to calm them down, and make friends along the way. It's a sister game to Math Quest and uses the same math.

## How to play

- Pick a **buddy** at Professor Pi's lab: Sproutle, Emberkit or Splashfin. Your buddy follows you everywhere and helps with every kind of math. Turn around and press A to talk to it.
- Walk through the tall grass on Route 1. Each wild Legend asks one kind of math puzzle:

  | Legend | Puzzles |
  | --- | --- |
  | Hootsum | Adding |
  | Snipsnap | Taking away |
  | Pebblit | Which number is bigger |
  | Buzzlet | Equal groups and times tables |
  | Shareling | Division |

- In battle, choose **SOLVE**. A right answer powers your buddy's move, and a fast first try gives extra power.
- Solve enough puzzles and the wild Legend **calms down**. Legends you solved on the first try often want to be your friend and join your team.
- Beat Ranger Rowan at the end of Route 1 to earn the Sum Badge. Rowan's first Legend always asks the puzzles you need most.
- The Rest Center (pink roof) heals your team. If your whole team needs a rest, you wake up there. Nothing is lost.

**Controls:** on-screen D-pad, A, B and MENU buttons, or the keyboard: arrows/WASD to move, Z or Space for A, X for B, Enter for the menu. During a question, 1–4 pick an answer and B (or H) asks for a hint.

## Hints

The buddy helps the way Math Quest's tutor does:

1. **💡 Hint:** a short strategy tip ("Make a ten!", "Think addition: 7 + ? = 15") and the picture (ten-frame, base-ten blocks or array).
2. **A second try:** after a wrong answer, a hint about the likely mistake ("Careful! This one is taking away, not adding.", "Did you remember to borrow?").
3. **🦉 Teach me:** a step-by-step lesson (count on, make a ten, count back, column adding, borrowing, skip counting, friendly fives, think multiplication), then a similar problem to try yourself.

## The math

Skills, number ranges and difficulty follow Math Quest's grade scheme (Common Core K–3):

| Grade | Skills |
| --- | --- |
| Kindergarten | Add and take away within 10, with ten-frames |
| Grade 1 | Add and take away within 20 (with ten-frames and missing numbers), comparing numbers |
| Grade 2 | Two-digit adding and taking away (base-ten blocks), equal groups |
| Grade 3 | Times tables, division facts, adding and taking away within 1,000 |

Also from Math Quest: weak skills come up more often, mastered skills stretch to bigger numbers, 15% of problems review earlier grades, Grades 2–3 include short story problems, and missed problems come back after 1, 3 and 7 days.

On top of that, wild encounters follow the player's needs: while one skill is clearly weak, extra encounters bring the Legend that practices it. As the skill improves, that Legend shows up at higher levels with bigger numbers.

## For grown-ups

- **Grade:** set at the start and changeable any time in MENU → Settings.
- **Read aloud:** off by default. Turn it on in MENU → Settings to have the game read dialog, questions and hints out loud. The 🔊 button reads the current question at any time.
- **Progress:** MENU → Grown-ups shows first-try accuracy and mastery for each skill, which skill is being practiced most, and how many missed problems are waiting for review.
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
- `js/math.js`: the math engine: skills per grade, adapting, hints and Teach me lessons
- `js/game.js`: movement, the following buddy, dialog, menus, battles and saving
- `sw.js`, `manifest.webmanifest`, `*.png`: offline support and app icons

For testing, open the game with `?dev` in the address to get `MQL.ask(MQL.MathEngine.make('sub-100', 2))` in the browser console.
