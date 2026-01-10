import { useState, useCallback } from 'react';
import { SudokuGrid } from './SudokuGrid';
import { Controls } from './Controls';
import { samplePuzzles } from './SamplePuzzles';
import {
  createEmptyBoard,
  copyBoard,
  solveSudoku,
} from './solver';
import type { Board, Puzzle } from './types';
import './App.css';

/**
 * Main Application Component
 * Manages state and orchestrates the Sudoku solving experience
 */
function App() {
  const [originalBoard, setOriginalBoard] = useState<Board>(createEmptyBoard());
  const [currentBoard, setCurrentBoard] = useState<Board>(createEmptyBoard());
  const [isSolving, setIsSolving] = useState(false);
  const [hasSolution, setHasSolution] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isBoardEmpty = useCallback(() => {
    return currentBoard.every(row => row.every(cell => cell === 0));
  }, [currentBoard]);

  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    if (hasSolution) return; // Don't allow editing after solving

    const newValue = value === '' ? 0 : parseInt(value, 10);
    const newBoard = copyBoard(currentBoard);
    newBoard[row][col] = newValue;
    setCurrentBoard(newBoard);
    setMessage(null);
  }, [currentBoard, hasSolution]);

  const handleSolve = useCallback(() => {
    if (isBoardEmpty()) {
      setMessage({ type: 'error', text: 'Please enter some numbers first!' });
      return;
    }

    setIsSolving(true);
    setMessage(null);

    // Use setTimeout to allow UI to update before solving
    setTimeout(() => {
      const boardToSolve = copyBoard(currentBoard);
      const startTime = performance.now();
      const solved = solveSudoku(boardToSolve);
      const endTime = performance.now();

      if (solved) {
        setOriginalBoard(currentBoard); // Store current as "original" for reset
        setCurrentBoard(boardToSolve);
        setHasSolution(true);
        setMessage({
          type: 'success',
          text: `Solved in ${(endTime - startTime).toFixed(2)}ms!`,
        });
      } else {
        setMessage({
          type: 'error',
          text: 'No solution exists for this puzzle. Please check your input.',
        });
      }
      setIsSolving(false);
    }, 100);
  }, [currentBoard, isBoardEmpty]);

  const handleClear = useCallback(() => {
    const emptyBoard = createEmptyBoard();
    setOriginalBoard(emptyBoard);
    setCurrentBoard(emptyBoard);
    setHasSolution(false);
    setMessage(null);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentBoard(copyBoard(originalBoard));
    setHasSolution(false);
    setMessage(null);
  }, [originalBoard]);

  const handleLoadPuzzle = useCallback((puzzle: Puzzle) => {
    const boardCopy = puzzle.board.map(row => [...row]);
    setOriginalBoard(boardCopy);
    setCurrentBoard(boardCopy);
    setHasSolution(false);
    setMessage(null);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 Sudoku Solver</h1>
        <p className="subtitle">Enter a puzzle or load a sample to get started</p>
      </header>

      <main className="app-main">
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <SudokuGrid
          board={currentBoard}
          originalBoard={originalBoard}
          onCellChange={handleCellChange}
          disabled={hasSolution}
        />

        <Controls
          onSolve={handleSolve}
          onClear={handleClear}
          onReset={handleReset}
          onLoadPuzzle={handleLoadPuzzle}
          isSolving={isSolving}
          hasSolution={hasSolution}
          isBoardEmpty={isBoardEmpty()}
          samplePuzzles={samplePuzzles}
        />

        <div className="instructions">
          <h3>How to Use</h3>
          <ol>
            <li>Click on a cell and enter a number (1-9), or load a sample puzzle</li>
            <li>Fill in the known numbers of your Sudoku puzzle</li>
            <li>Click <strong>"Solve Puzzle"</strong> to find the solution</li>
            <li>Use <strong>"Reset"</strong> to restore your original input</li>
            <li>Use <strong>"Clear"</strong> to start over with an empty board</li>
          </ol>
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with React + TypeScript • Backtracking Algorithm</p>
      </footer>
    </div>
  );
}

export default App;
