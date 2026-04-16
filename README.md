# Sudoku Web

A web-based Sudoku application with **Solver Mode** and **Game Mode**, built with React 19 + TypeScript + Vite.

## Features

### Solver Mode
- Enter any Sudoku puzzle and solve it instantly with the backtracking algorithm
- Load sample puzzles (Easy / Medium / Hard)
- Reset to original input or clear the board

### Game Mode
- Generate random puzzles with adjustable difficulty (Easy / Medium / Hard)
- Real-time error highlighting as you fill cells
- **Targeted hint**: select a cell, then click Hint to reveal its answer
- Progress tracking (filled / remaining / percentage)
- Give Up option to reveal the full solution

### General
- Bilingual interface: 中文 / English (with live language switching)
- Toast notifications for actions and feedback
- Responsive design for desktop and mobile

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Architecture

```
src/
├── App.tsx              # Root component, all state management
├── SudokuGrid.tsx       # 9x9 interactive grid
├── Controls.tsx         # Mode-specific button panels
├── solver.ts            # Pure backtracking algorithm (no React deps)
├── game.ts              # Puzzle generation and validation
├── types.ts             # Shared type definitions
├── SamplePuzzles.ts     # Built-in sample puzzles
├── components/
│   ├── ModeSwitcher.tsx  # Solver / Game toggle
│   ├── GameStats.tsx     # Progress bar
│   ├── LanguageSwitcher.tsx
│   └── Toast.tsx         # Floating notification
└── i18n/
    ├── translations.ts   # zh-CN / en-US strings
    └── LanguageContext.tsx
```

**Key conventions:**
- All state lives in `App.tsx` (no external state library)
- Board is a 9x9 `number[][]` where `0` = empty
- `solveSudoku()` mutates boards in-place; always `copyBoard()` before calling
- i18n uses dot-notation keys (e.g., `'messages.solveSuccess'`) resolved at render time

## Algorithm

The solver uses **recursive backtracking** with constraint checking:

1. Find the next empty cell
2. Try numbers 1-9
3. Validate against row, column, and 3x3 box constraints
4. Recurse or backtrack on failure

**Time complexity:** O(9^m) worst case, where m = empty cells.
**Space complexity:** O(m) for the recursion stack.

## License

Educational project. See parent repository for details.
