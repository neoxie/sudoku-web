# Game Mode Hint Button — Selected Cell Targeted Hint

**Date:** 2026-04-15
**Status:** Approved
**Scope:** Game mode only

## Problem

The current game mode hint button fills the first empty cell in linear scan order (top-left to bottom-right), regardless of which cell the user is looking at. This is not intuitive — users expect to select a specific cell and get a hint for that exact cell.

## Requirements

1. The hint button must be **disabled** when no cell is selected on the board
2. The hint button must be **disabled** when a given (original, immutable) cell is selected
3. Clicking the hint button fills the **selected cell** with the correct answer from the stored solution
4. Hinted cells receive a distinct visual style (`.hinted` CSS class) to differentiate them from user-filled cells
5. After clicking hint, the cell remains selected (does not lose focus)
6. Existing hint functionality for game mode is replaced entirely — `getHint()` from `game.ts` is no longer used

## Design

### State Management (App.tsx)

**New state:**

```typescript
const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
const [hintedCells, setHintedCells] = useState<[number, number][]>([]);
```

**Computed property:**

```typescript
const isHintAvailable = useMemo(() => {
  if (!selectedCell || !solution || isGameComplete) return false;
  const [row, col] = selectedCell;
  if (originalBoard[row][col] !== 0) return false;
  return true;
}, [selectedCell, solution, isGameComplete, originalBoard]);
```

**Reset points** — both `selectedCell` and `hintedCells` are cleared in:
- `handleClear`
- `handleNewGame`
- `handleModeChange`

### SudokuGrid Component Changes

**New props:**

```typescript
interface SudokuGridProps {
  // ...existing props
  selectedCell?: [number, number] | null;
  onSelectCell?: (row: number, col: number) => void;
  hintedCells?: [number, number][];
}
```

**Event handlers** on each `<input>`:

- `onFocus={() => onSelectCell?.(rowIndex, colIndex)}` — reports cell selection to App
- `onBlur` with `relatedTarget` check — clears selection only when focus leaves the grid entirely (not when jumping between cells within the grid)

**CSS class** — `getCellClassName` adds `hinted` class when the cell is in the `hintedCells` array.

### Controls Component Changes

**New prop:** `isHintAvailable: boolean`

**Hint button** disabled condition changes from `disabled={isGameComplete}` to `disabled={!isHintAvailable}`.

The `isHintAvailable` memo already encapsulates all conditions:
- No cell selected → disabled
- Selected cell is a given cell → disabled
- Game complete → disabled
- No solution available → disabled

### handleHint Behavior Change

**Before:** Calls `getHint(currentBoard, solution)` which returns the first empty cell.

**After:** Reads `selectedCell` directly and fills the answer from `solution`.

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

### CSS Styling (SudokuGrid.css)

```css
.sudoku-cell.hinted {
  background-color: var(--color-info-bg, #E0F2FE);
  color: var(--color-info, #0284C7);
}
```

Blue color family for hinted cells, visually distinct from:
- Green (solved/user-filled)
- Red (error)
- Gray (given)

### Data Flow

```
User focuses cell → SudokuGrid.onFocus → onSelectCell(row, col)
                                              ↓
                                    App.setSelectedCell([row, col])
                                              ↓
                    ┌─────────────────────────┼─────────────────────┐
                    ↓                         ↓                     ↓
            isHintAvailable          Controls.disabled       handleHint
            (memo computed)          (!isHintAvailable)      (reads selectedCell)
                                                              ↓
                                                    setCurrentBoard (fill answer)
                                                    setHintedCells (track hint)
                                                              ↓
                                                    SudokuGrid re-renders
                                                    (.hinted class applied)
```

### i18n

No new translation keys needed. Existing keys reused:
- `controls.hint` — button label
- `messages.hintUsed` — success toast after hint

### Cleanup

`getHint()` in `game.ts` is no longer called by any code. It can be removed or retained as a utility function. The recommendation is to remove it to avoid dead code (YAGNI).

## Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Add `selectedCell`, `hintedCells` state; modify `handleHint`; pass new props to SudokuGrid and Controls |
| `src/SudokuGrid.tsx` | Add `onSelectCell`, `hintedCells` props; add `onFocus`/`onBlur` handlers; update `getCellClassName` |
| `src/SudokuGrid.css` | Add `.hinted` style |
| `src/Controls.tsx` | Add `isHintAvailable` prop; update hint button `disabled` condition |
| `src/game.ts` | Remove or retain `getHint()` (recommend removal) |
