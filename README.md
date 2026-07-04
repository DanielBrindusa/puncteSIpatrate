# Puncte și Pătrate / Dots and Boxes

A polished, bilingual version of the classic two-player **Dots and Boxes** game. It is built with plain HTML, CSS, and JavaScript and is ready for GitHub Pages — no build tools, backend, accounts, or external dependencies required.

## How to play

Players take turns selecting an unused line between two neighboring dots. Complete the fourth side of a box to claim it with your **X** or **O** and take another turn. A single line can complete two boxes. When the board is full, the player with the most boxes wins.

## Features

- Complete two-player Dots and Boxes rules, including extra turns and double-box moves
- Romanian and English interface with an instant language switcher
- Small (4 × 4), medium (7 × 7), and genuinely large (12 × 16) boards
- Responsive, scroll-safe play area for phones, tablets, and desktops
- Mouse, touch, and keyboard interaction with accessible labels and focus states
- Animated lines, claimed boxes, status updates, and final results
- Reset confirmation for active games
- Saved language and board-size preferences using `localStorage`
- Fully static and usable offline once the files are available

## Run locally

No installation or build step is needed. Download the four project files and open `index.html` in a modern browser.

For local development, you can also serve the folder with any simple static server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a GitHub repository and upload `index.html`, `style.css`, `script.js`, and `README.md` to its root.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your main branch and the `/ (root)` folder, then save.
5. GitHub will display the public site URL after deployment completes.

## Project structure

```text
.
├── index.html
├── style.css
├── script.js
└── README.md
```

## Browser support

Designed for current versions of Chrome, Edge, Firefox, and Safari.
