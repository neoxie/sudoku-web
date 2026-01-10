import { useState, useCallback } from 'react';
import { SudokuGrid } from './SudokuGrid';
import { Controls } from './Controls';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { samplePuzzles } from './SamplePuzzles';
import {
  createEmptyBoard,
  copyBoard,
  solveSudoku,
} from './solver';
import type { Board, Puzzle } from './types';
import './App.css';

/**
 * Main Application Content Component
 * Manages state and orchestrates the Sudoku solving experience
 */
function AppContent() {
  const { t, tArray } = useLanguage();

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
      setMessage({ type: 'error', text: t('messages.emptyBoard') });
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
          text: t('messages.solveSuccess', ((endTime - startTime).toFixed(2))),
        });
      } else {
        setMessage({
          type: 'error',
          text: t('messages.noSolution'),
        });
      }
      setIsSolving(false);
    }, 100);
  }, [currentBoard, isBoardEmpty, t]);

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
      <LanguageSwitcher />

      <header className="app-header">
        <h1>{t('app.title')}</h1>
        <p className="subtitle">{t('app.subtitle')}</p>
      </header>

      <main className="app-main">
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="game-area">
          <div className="game-content">
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
          </div>
        </div>

        <aside className="instructions">
          <h3>{t('instructions.title')}</h3>
          <ol>
            {tArray('instructions.steps').map((step: string, index: number) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </aside>
      </main>

      <footer className="app-footer">
        <p>{t('footer')}</p>
      </footer>
    </div>
  );
}

/**
 * Main Application Component
 * Wraps content with LanguageProvider for i18n support
 */
function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
