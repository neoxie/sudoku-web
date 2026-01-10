/**
 * Sudoku Solver - Ported from sudoku_solver.py
 * Uses backtracking algorithm to solve Sudoku puzzles
 */

import type { Board } from './types';

/**
 * Find an empty cell (represented by 0) in the board
 * @param board - 9x9 Sudoku board
 * @returns [row, col] of empty cell or null if board is full
 */
export function findEmpty(board: Board): [number, number] | null {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        return [i, j];
      }
    }
  }
  return null;
}

/**
 * Check if placing a number at a position is valid according to Sudoku rules
 * @param board - 9x9 Sudoku board
 * @param num - Number to place (1-9)
 * @param pos - Position [row, col]
 * @returns true if placement is valid, false otherwise
 */
export function isValid(board: Board, num: number, pos: [number, number]): boolean {
  const [row, col] = pos;

  // Check row
  for (let j = 0; j < 9; j++) {
    if (board[row][j] === num && col !== j) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num && row !== i) {
      return false;
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (board[i][j] === num && (i !== row || j !== col)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Solve Sudoku puzzle using backtracking algorithm
 * @param board - 9x9 Sudoku board (modified in-place)
 * @returns true if solved, false if no solution exists
 */
export function solveSudoku(board: Board): boolean {
  const empty = findEmpty(board);

  if (!empty) {
    return true; // Puzzle solved
  }

  const [row, col] = empty;

  for (let num = 1; num <= 9; num++) {
    if (isValid(board, num, [row, col])) {
      board[row][col] = num;

      if (solveSudoku(board)) {
        return true;
      }

      board[row][col] = 0; // Backtrack
    }
  }

  return false;
}

/**
 * Create a deep copy of a board
 * @param board - Board to copy
 * @returns New board with copied values
 */
export function copyBoard(board: Board): Board {
  return board.map(row => [...row]);
}

/**
 * Create an empty 9x9 Sudoku board
 * @returns Empty board filled with zeros
 */
export function createEmptyBoard(): Board {
  return Array(9).fill(0).map(() => Array(9).fill(0));
}
