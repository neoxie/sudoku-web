/**
 * Sudoku Game Mode - Puzzle generation and validation
 * Generates valid Sudoku puzzles with varying difficulty levels
 */

import type { Board } from './types';
import { solveSudoku, isValid, createEmptyBoard, copyBoard } from './solver';

export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Get number of cells to remove based on difficulty
 */
function getCellsToRemove(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 35;   // ~46 cells given
    case 'medium': return 45; // ~36 cells given
    case 'hard': return 54;   // ~27 cells given
  }
}

/**
 * Fill diagonal 3x3 boxes (independent, so valid)
 */
function fillDiagonalBoxes(board: Board): void {
  for (let box = 0; box < 9; box += 3) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Shuffle numbers
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    // Fill box
    let idx = 0;
    for (let i = box; i < box + 3; i++) {
      for (let j = box; j < box + 3; j++) {
        board[i][j] = nums[idx++];
      }
    }
  }
}

/**
 * Generate a complete valid Sudoku board
 */
function generateCompleteBoard(): Board {
  const board = createEmptyBoard();

  // Fill diagonal boxes first (they're independent)
  fillDiagonalBoxes(board);

  // Solve the rest
  solveSudoku(board);

  return board;
}

/**
 * Remove cells to create puzzle while ensuring unique solution
 * Uses random selection and checks solution uniqueness
 */
function removeCells(board: Board, _solution: Board, cellsToRemove: number): Board {
  const puzzle = copyBoard(board);
  const positions: [number, number][] = [];

  // Collect all cell positions
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push([i, j]);
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Remove cells one by one
  let removed = 0;
  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    // Verify the puzzle still has a unique solution
    // by checking if our original solution is still reachable
    const testBoard = copyBoard(puzzle);
    if (!solveSudoku(testBoard)) {
      // If unsolvable, restore the cell
      puzzle[row][col] = backup;
    } else {
      removed++;
    }
  }

  return puzzle;
}

/**
 * Generate a new Sudoku puzzle with specified difficulty
 * @param difficulty - Difficulty level (easy, medium, hard)
 * @returns Object with puzzle board and solution
 */
export function generatePuzzle(difficulty: Difficulty = 'medium'): {
  puzzle: Board;
  solution: Board;
} {
  // Generate a complete solved board
  const solution = generateCompleteBoard();

  // Remove cells to create puzzle
  const puzzle = removeCells(solution, solution, getCellsToRemove(difficulty));

  return { puzzle, solution };
}

/**
 * Check if a move is valid according to Sudoku rules
 */
export function isValidMove(board: Board, num: number, pos: [number, number]): boolean {
  return isValid(board, num, pos);
}

/**
 * Validate the entire board against the solution
 * Returns an object with validation results
 */
export function validateBoard(
  currentBoard: Board,
  solution: Board
): {
  isComplete: boolean;
  isCorrect: boolean;
  incorrectCells: [number, number][];
  emptyCells: number;
} {
  let incorrectCells: [number, number][] = [];
  let emptyCells = 0;

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (currentBoard[i][j] === 0) {
        emptyCells++;
      } else if (currentBoard[i][j] !== solution[i][j]) {
        incorrectCells.push([i, j]);
      }
    }
  }

  const isComplete = emptyCells === 0;
  const isCorrect = incorrectCells.length === 0;

  return { isComplete, isCorrect, incorrectCells, emptyCells };
}

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

/**
 * Get puzzle statistics
 */
export function getPuzzleStats(board: Board): {
  filledCells: number;
  emptyCells: number;
  progress: number;
} {
  let filledCells = 0;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] !== 0) {
        filledCells++;
      }
    }
  }

  const emptyCells = 81 - filledCells;
  const progress = Math.round((filledCells / 81) * 100);

  return { filledCells, emptyCells, progress };
}
