# Game Hint — Selected Cell Targeted Hint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the game mode hint button's linear-scan behavior with targeted cell hint — user selects a cell, then clicks hint to reveal its answer.

**Architecture:** Add `selectedCell` and `hintedCells` state to App.tsx (consistent with existing all-state-in-App pattern). SudokuGrid gets `onSelectCell` callback for focus events and `hintedCells` array for visual marking. Controls receives `isHintAvailable` computed prop for button enable/disable.

**Tech Stack:** React 19, TypeScript, Vite, pure CSS. No test framework configured — verification via `npm run build`.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/App.tsx` | Modify | Add `selectedCell`, `hintedCells` state; modify `handleHint`; compute `isHintAvailable`; pass new props |
| `src/SudokuGrid.tsx` | Modify | Add `onSelectCell`, `hintedCells` props; add `onFocus`/`onBlur`; update `getCellClassName` |
| `src/SudokuGrid.css` | Modify | Add `.hinted` style |
| `src/Controls.tsx` | Modify | Add `isHintAvailable` prop; update hint button disabled logic |
| `src/game.ts` | Modify | Remove `getHint()` export (dead code cleanup) |

---

### Task 1: Add selectedCell and hintedCells state to App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add imports — add `useMemo` to the React import**

Change line 1 from:
```typescript
import { useState, useCallback } from 'react';
```
to:
```typescript
import { useState, useCallback, useMemo } from 'react';
```

- [ ] **Step 2: Add new state variables after line 46 (after `isGameComplete`)**

```typescript
// Cell selection state (game mode)
const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
const [hintedCells, setHintedCells] = useState<[number, number][]>([]);
```

- [ ] **Step 3: Add isHintAvailable memo after the state declarations (after the new state from Step 2)**

```typescript
const isHintAvailable = useMemo(() => {
  if (!selectedCell || !solution || isGameComplete) return false;
  const [row, col] = selectedCell;
  if (originalBoard[row][col] !== 0) return false;
  return true;
}, [selectedCell, solution, isGameComplete, originalBoard]);
```

- [ ] **Step 4: Add reset logic to handleClear**

In `handleClear` (currently lines 121–130), add these two lines before `setMessage(null)`:

```typescript
setSelectedCell(null);
setHintedCells([]);
```

- [ ] **Step 5: Add reset logic to handleNewGame**

In `handleNewGame` (currently lines 151–160), add these two lines before `setMessage`:

```typescript
setSelectedCell(null);
setHintedCells([]);
```

- [ ] **Step 6: Add reset logic to handleModeChange**

In `handleModeChange` (currently lines 210–219), add these lines inside the `if (newMode === 'solver')` block, before the existing `setSolution(null)`:

```typescript
setSelectedCell(null);
setHintedCells([]);
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors.

---

### Task 2: Replace handleHint with selected-cell-targeted behavior

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace handleHint callback**

Replace the existing `handleHint` (currently lines 187–200):

```typescript
const handleHint = useCallback(() => {
  if (!solution) return;

  const hint = getHint(currentBoard, solution);
  if (hint) {
    const [row, col, value] = hint;
    const newBoard = copyBoard(currentBoard);
    newBoard[row][col] = value;
    setCurrentBoard(newBoard);
    setMessage({ type: 'success', key: 'messages.hintUsed' });
  } else {
    setMessage({ type: 'success', key: 'messages.noMoreHints' });
  }
}, [currentBoard, solution]);
```

with:

```typescript
const handleHint = useCallback(() => {
  if (!selectedCell || !solution) return;
  const [row, col] = selectedCell;
  if (originalBoard[row][col] !== 0) return;

  const newBoard = copyBoard(currentBoard);
  newBoard[row][col] = solution[row][col];
  setCurrentBoard(newBoard);
  setHintedCells(prev => [...prev, [row, col]]);
  setMessage({ type: 'success', key: 'messages.hintUsed' });
}, [selectedCell, solution, currentBoard, originalBoard]);
```

- [ ] **Step 2: Add handleCellSelect callback**

Add this new callback after `handleHint`:

```typescript
const handleCellSelect = useCallback((row: number, col: number) => {
  setSelectedCell([row, col]);
}, []);
```

- [ ] **Step 3: Add handleCellBlur callback**

Add this new callback after `handleCellSelect`:

```typescript
const handleCellBlur = useCallback(() => {
  // Use setTimeout to allow relatedTarget to be set after blur event
  setTimeout(() => {
    setSelectedCell(prev => {
      // Only clear if no element in the grid is focused
      const activeEl = document.activeElement;
      if (activeEl && activeEl.classList.contains('sudoku-cell')) {
        return prev;
      }
      return null;
    });
  }, 0);
}, []);
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds. (New callbacks and state are not yet wired to components — that comes in later tasks.)

---

### Task 3: Pass new props to SudokuGrid and Controls in JSX

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update SudokuGrid JSX**

Replace the existing `<SudokuGrid>` tag (currently around lines 243–249):

```tsx
<SudokuGrid
  board={currentBoard}
  originalBoard={originalBoard}
  onCellChange={handleCellChange}
  disabled={hasSolution || isGameComplete}
  incorrectCells={incorrectCells}
/>
```

with:

```tsx
<SudokuGrid
  board={currentBoard}
  originalBoard={originalBoard}
  onCellChange={handleCellChange}
  disabled={hasSolution || isGameComplete}
  incorrectCells={incorrectCells}
  hintedCells={hintedCells}
  onSelectCell={handleCellSelect}
  onCellBlur={handleCellBlur}
/>
```

- [ ] **Step 2: Update Controls JSX — add isHintAvailable prop**

Replace the existing `<Controls>` tag (currently around lines 255–274):

```tsx
<Controls
  mode={mode}
  // Solver mode props
  onSolve={handleSolve}
  onClear={handleClear}
  onReset={handleReset}
  onLoadPuzzle={handleLoadPuzzle}
  isSolving={isSolving}
  hasSolution={hasSolution}
  isBoardEmpty={isBoardEmpty()}
  samplePuzzles={samplePuzzles}
  // Game mode props
  onNewGame={handleNewGame}
  onCheck={handleCheck}
  onHint={handleHint}
  onGiveUp={handleGiveUp}
  isGameComplete={isGameComplete}
  gameDifficulty={gameDifficulty}
  onDifficultyChange={setGameDifficulty}
/>
```

with:

```tsx
<Controls
  mode={mode}
  // Solver mode props
  onSolve={handleSolve}
  onClear={handleClear}
  onReset={handleReset}
  onLoadPuzzle={handleLoadPuzzle}
  isSolving={isSolving}
  hasSolution={hasSolution}
  isBoardEmpty={isBoardEmpty()}
  samplePuzzles={samplePuzzles}
  // Game mode props
  onNewGame={handleNewGame}
  onCheck={handleCheck}
  onHint={handleHint}
  onGiveUp={handleGiveUp}
  isGameComplete={isGameComplete}
  isHintAvailable={isHintAvailable}
  gameDifficulty={gameDifficulty}
  onDifficultyChange={setGameDifficulty}
/>
```

- [ ] **Step 3: Remove getHint import**

Change the import from `game.ts` (line 15–20):

```typescript
import {
  generatePuzzle,
  validateBoard,
  getHint,
  getPuzzleStats,
} from './game';
```

to:

```typescript
import {
  generatePuzzle,
  validateBoard,
  getPuzzleStats,
} from './game';
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build fails with type errors in SudokuGrid.tsx and Controls.tsx (new props not yet accepted). This is expected — fixed in Tasks 4 and 5.

---

### Task 4: Update SudokuGrid component with new props and event handlers

**Files:**
- Modify: `src/SudokuGrid.tsx`

- [ ] **Step 1: Update the interface**

Replace the existing `SudokuGridProps` interface (lines 4–10):

```typescript
interface SudokuGridProps {
  board: Board;
  originalBoard: Board;
  onCellChange: (row: number, col: number, value: string) => void;
  disabled?: boolean;
  incorrectCells?: [number, number][];
}
```

with:

```typescript
interface SudokuGridProps {
  board: Board;
  originalBoard: Board;
  onCellChange: (row: number, col: number, value: string) => void;
  disabled?: boolean;
  incorrectCells?: [number, number][];
  hintedCells?: [number, number][];
  onSelectCell?: (row: number, col: number) => void;
  onCellBlur?: () => void;
}
```

- [ ] **Step 2: Destructure new props**

Update the component destructuring from:

```typescript
export const SudokuGrid: React.FC<SudokuGridProps> = ({
  board,
  originalBoard,
  onCellChange,
  disabled = false,
  incorrectCells = [],
}) => {
```

to:

```typescript
export const SudokuGrid: React.FC<SudokuGridProps> = ({
  board,
  originalBoard,
  onCellChange,
  disabled = false,
  incorrectCells = [],
  hintedCells = [],
  onSelectCell,
  onCellBlur,
}) => {
```

- [ ] **Step 3: Add hinted check to getCellClassName**

In the `getCellClassName` function, after the `isIncorrect` check block (around line 56), add:

```typescript
// Check if this cell was filled by hint
const isHinted = hintedCells.some(([r, c]) => r === row && c === col);
if (isHinted) {
  classes.push('hinted');
}
```

- [ ] **Step 4: Add onFocus and onBlur to each input element**

Replace the existing `<input>` element (around lines 70–82):

```tsx
<input
  key={`${rowIndex}-${colIndex}`}
  type="text"
  inputMode="numeric"
  maxLength={1}
  className={getCellClassName(rowIndex, colIndex)}
  value={cell === 0 ? '' : cell.toString()}
  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
  readOnly={isReadOnly(rowIndex, colIndex)}
  aria-label={`Cell row ${rowIndex + 1}, column ${colIndex + 1}`}
/>
```

with:

```tsx
<input
  key={`${rowIndex}-${colIndex}`}
  type="text"
  inputMode="numeric"
  maxLength={1}
  className={getCellClassName(rowIndex, colIndex)}
  value={cell === 0 ? '' : cell.toString()}
  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
  onFocus={() => onSelectCell?.(rowIndex, colIndex)}
  onBlur={() => onCellBlur?.()}
  readOnly={isReadOnly(rowIndex, colIndex)}
  aria-label={`Cell row ${rowIndex + 1}, column ${colIndex + 1}`}
/>
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Build fails with type error in Controls.tsx only (isHintAvailable prop not yet accepted). SudokuGrid errors should be resolved.

---

### Task 5: Update Controls component with isHintAvailable prop

**Files:**
- Modify: `src/Controls.tsx`

- [ ] **Step 1: Add isHintAvailable to the interface**

In `ControlsProps` interface, add after `isGameComplete: boolean;` (line 21):

```typescript
isHintAvailable: boolean;
```

- [ ] **Step 2: Destructure the new prop**

In the component destructuring, add `isHintAvailable` after `isGameComplete,` (line 46):

```typescript
isGameComplete,
isHintAvailable,
```

- [ ] **Step 3: Update hint button disabled condition**

In the game mode JSX, change the hint button from:

```tsx
<button
  className="btn btn-secondary"
  onClick={onHint}
  disabled={isGameComplete}
>
  {t('controls.hint')}
</button>
```

to:

```tsx
<button
  className="btn btn-secondary"
  onClick={onHint}
  disabled={!isHintAvailable}
>
  {t('controls.hint')}
</button>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

---

### Task 6: Add hinted CSS style

**Files:**
- Modify: `src/SudokuGrid.css`

- [ ] **Step 1: Add .hinted style after the .error keyframe block (after line 110)**

```css
/* Hinted cells - filled by hint button in game mode */
.sudoku-cell.hinted {
  background-color: var(--color-info-bg, #E0F2FE);
  color: var(--color-info, #0284C7);
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

---

### Task 7: Remove dead code — getHint from game.ts

**Files:**
- Modify: `src/game.ts`

- [ ] **Step 1: Remove getHint function**

Delete lines 159–170 (the entire `getHint` function and its JSDoc comment):

```typescript
/**
 * Get a hint for the next empty cell
 */
export function getHint(board: Board, solution: Board): [number, number, number] | null {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        return [i, j, solution[i][j]];
      }
    }
  }
  return null;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

---

### Task 8: Manual verification and commit

**Files:** None (verification only)

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify game mode behavior**

Test checklist:
1. Switch to game mode, start a new game
2. Hint button should be **disabled** (no cell selected)
3. Click an empty cell — hint button becomes **enabled**
4. Click hint — cell fills with correct answer, shows blue hinted style
5. Click a given cell — hint button becomes **disabled**
6. Click another empty cell, hint, repeat — all hinted cells show blue style
7. Click outside the grid — hint button becomes **disabled** (selection cleared)
8. Click "New Game" — all hinted styles cleared, selection cleared

- [ ] **Step 3: Verify solver mode is unaffected**

Switch to solver mode. Load a sample puzzle. Click Solve. Verify behavior is unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/SudokuGrid.tsx src/SudokuGrid.css src/Controls.tsx src/game.ts docs/superpowers/specs/2026-04-15-game-hint-selected-cell-design.md docs/superpowers/plans/2026-04-15-game-hint-selected-cell.md
git commit -m "feat(game): replace linear-scan hint with selected-cell targeted hint"
```
