/**
 * Type definitions for the Sudoku Solver application
 */

export type Board = number[][];  // 9x9 grid, 0 = empty

export type CellState = 'given' | 'solved' | 'error';
export type GameMode = 'solver' | 'game';

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

// Game mode specific types
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameValidation {
  isComplete: boolean;
  isCorrect: boolean;
  incorrectCells: [number, number][];
  emptyCells: number;
}

export interface GameStats {
  filledCells: number;
  emptyCells: number;
  progress: number;
}
