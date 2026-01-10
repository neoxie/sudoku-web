/**
 * Type definitions for the Sudoku Solver application
 */

export type Board = number[][];  // 9x9 grid, 0 = empty

export type CellState = 'given' | 'solved' | 'error';

export interface Puzzle {
  nameKey: string; // Translation key for i18n lookup
  difficulty: 'easy' | 'medium' | 'hard';
  board: Board;
}

export interface SolveResult {
  success: boolean;
  solution?: Board;
  error?: string;
  time?: number;
}
