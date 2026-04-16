import type { Board } from './types';
import './SudokuGrid.css';

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

/**
 * 9x9 Sudoku Grid Component
 * Features individual cell inputs with validation and visual states
 * Supports game mode with error highlighting
 */
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
  const handleCellChange = (row: number, col: number, value: string) => {
    // Allow only 1-9 or empty
    if (value === '' || (/^[1-9]$/.test(value))) {
      onCellChange(row, col, value);
    }
  };

  const getCellClassName = (row: number, col: number): string => {
    const classes = ['sudoku-cell'];

    // Add borders for 3x3 boxes
    if (col % 3 === 0 && col !== 0) {
      classes.push('border-left');
    }
    if (row % 3 === 0 && row !== 0) {
      classes.push('border-top');
    }

    // Add state classes
    const cellValue = board[row][col];
    const originalValue = originalBoard[row][col];

    if (cellValue !== 0) {
      if (originalValue !== 0) {
        classes.push('given'); // User provided or original puzzle
      } else {
        classes.push('solved'); // Solver filled or user entered in game mode
      }
    }

    // Check if this cell is marked as incorrect (game mode)
    const isIncorrect = incorrectCells.some(([r, c]) => r === row && c === col);
    if (isIncorrect) {
      classes.push('error');
    }

    // Check if this cell was filled by hint
    const isHinted = hintedCells.some(([r, c]) => r === row && c === col);
    if (isHinted) {
      classes.push('hinted');
    }

    return classes.join(' ');
  };

  const isReadOnly = (row: number, col: number): boolean => {
    return disabled || originalBoard[row][col] !== 0;
  };

  return (
    <div className="sudoku-grid">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
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
        ))
      )}
    </div>
  );
};
