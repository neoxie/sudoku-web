# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-based Sudoku application with two modes: **Solver Mode** (enter and solve puzzles) and **Game Mode** (generate and play puzzles). Built with React 19 + TypeScript + Vite. The backtracking algorithm is ported from the Python solver in the parent repository.

## Commands

```bash
npm run dev       # Start dev server (Vite with HMR)
npm run build     # Type-check (tsc -b) then build (vite build)
npm run lint      # ESLint via `eslint .`
npm run preview   # Preview production build
```

No test framework is configured. Running `npm test` will fail.

## Architecture

### State Management

All application state lives in `App.tsx` (`AppContent` component). There is no external state library. The component manages:
- Dual-mode state (`solver` vs `game`) with mode-specific state that resets on switch
- Message system stores **translation keys** (not resolved text) so messages update on language change
- Board state is always cloned (`copyBoard()`) before mutation — `solver.ts` modifies boards in-place

### Core Logic Layer (no React dependencies)

- **`solver.ts`** — Pure backtracking algorithm. `solveSudoku()` mutates board in-place and returns `boolean`. Also exports `createEmptyBoard()`, `copyBoard()`, `findEmpty()`, `isValid()`.
- **`game.ts`** — Puzzle generation and validation. Generation strategy: fill diagonal 3×3 boxes → solve rest → remove cells randomly. Exports `generatePuzzle()`, `validateBoard()`, `getHint()`, `getPuzzleStats()`.
- **`types.ts`** — Shared types: `Board` (9×9 `number[][]`, 0 = empty), `GameMode`, `Difficulty`, `Puzzle`, `GameStats`, `GameValidation`.

### UI Layer

- **`SudokuGrid.tsx`** — Renders 9×9 input grid. Cell CSS classes encode state: `given` (original), `solved` (filled), `error` (incorrect in game mode). Original cells are read-only.
- **`Controls.tsx`** — Renders mode-specific button panels. Props interface splits solver/game controls.
- **`components/ModeSwitcher.tsx`** — Toggle between solver/game modes.
- **`components/GameStats.tsx`** — Progress bar with filled/remaining counts.
- **`components/LanguageSwitcher.tsx`** — Toggle zh-CN / en-US.

### i18n System

Custom implementation (no i18next or similar):
- **`i18n/translations.ts`** — Nested translation objects with dot-notation access (`'messages.solveSuccess'`). Supports function values for interpolation (`(ms: string) => '...'`). Languages: `zh-CN` (default), `en-US`.
- **`i18n/LanguageContext.tsx`** — React Context provider. `t(key, ...args)` for strings, `tArray(key)` for string arrays. Persists language to `localStorage('sudoku-language')`.

### Styling

Pure CSS files (one per component). No CSS modules, Tailwind, or CSS-in-JS.

## Key Conventions

- **Board immutability**: Always `copyBoard()` before passing to mutating functions like `solveSudoku()`.
- **Translation keys over text**: Store `message.key` strings, resolve via `t()` at render time.
- **Puzzle names**: `SamplePuzzles.ts` uses `nameKey` (e.g., `'easy'`) mapped to `controls.easy` in translations.
- **Code comments**: English throughout the codebase.
