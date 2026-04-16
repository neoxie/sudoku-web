import { useState, useCallback, useMemo } from 'react';
import { SudokuGrid } from './SudokuGrid';
import { Controls } from './Controls';
import { ModeSwitcher } from './components/ModeSwitcher';
import { GameStats } from './components/GameStats';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Toast } from './components/Toast';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { samplePuzzles } from './SamplePuzzles';
import {
  createEmptyBoard,
  copyBoard,
  solveSudoku,
} from './solver';
import {
  generatePuzzle,
  validateBoard,
  getPuzzleStats,
} from './game';
import type { Board, Puzzle, GameMode, Difficulty, GameStats as GameStatsType } from './types';
import './App.css';

/**
 * Main Application Content Component
 * Manages state and orchestrates the Sudoku solving and gaming experience
 */
function AppContent() {
  const { t, tArray } = useLanguage();

  // Mode state
  const [mode, setMode] = useState<GameMode>('solver');

  // Board state
  const [originalBoard, setOriginalBoard] = useState<Board>(createEmptyBoard());
  const [currentBoard, setCurrentBoard] = useState<Board>(createEmptyBoard());

  // Solver mode state
  const [isSolving, setIsSolving] = useState(false);
  const [hasSolution, setHasSolution] = useState(false);

  // Game mode state
  const [solution, setSolution] = useState<Board | null>(null);
  const [gameDifficulty, setGameDifficulty] = useState<Difficulty>('medium');
  const [incorrectCells, setIncorrectCells] = useState<[number, number][]>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Cell selection state (game mode)
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [hintedCells, setHintedCells] = useState<[number, number][]>([]);

  const isHintAvailable = useMemo(() => {
    if (!selectedCell || !solution || isGameComplete) return false;
    const [row, col] = selectedCell;
    if (originalBoard[row][col] !== 0) return false;
    return true;
  }, [selectedCell, solution, isGameComplete, originalBoard]);

  // Store message key and params for dynamic translation on language change
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    key: string;
    params?: string[];
  } | null>(null);

  const isBoardEmpty = useCallback(() => {
    return currentBoard.every(row => row.every(cell => cell === 0));
  }, [currentBoard]);

  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    if (hasSolution && mode === 'solver') return; // Don't allow editing after solving
    if (isGameComplete) return; // Don't allow editing after game completion

    const newValue = value === '' ? 0 : parseInt(value, 10);
    const newBoard = copyBoard(currentBoard);
    newBoard[row][col] = newValue;
    setCurrentBoard(newBoard);

    // Real-time validation for game mode - check all filled cells against solution
    if (mode === 'game' && solution) {
      const errors: [number, number][] = [];
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          // Check if this cell is filled but incorrect
          if (newBoard[i][j] !== 0 && newBoard[i][j] !== solution[i][j]) {
            errors.push([i, j]);
          }
        }
      }
      setIncorrectCells(errors);
    }

    setMessage(null);
  }, [currentBoard, hasSolution, isGameComplete, mode, solution]);

  // Solver mode handlers
  const handleSolve = useCallback(() => {
    if (isBoardEmpty()) {
      setMessage({ type: 'error', key: 'messages.emptyBoard' });
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
          key: 'messages.solveSuccess',
          params: [((endTime - startTime).toFixed(2))],
        });
      } else {
        setMessage({
          type: 'error',
          key: 'messages.noSolution',
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
    setSolution(null);
    setIsGameComplete(false);
    setIncorrectCells([]);
    setSelectedCell(null);
    setHintedCells([]);
    setMessage(null);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentBoard(copyBoard(originalBoard));
    setHasSolution(false);
    setIncorrectCells([]);
    setMessage(null);
  }, [originalBoard]);

  const handleLoadPuzzle = useCallback((puzzle: Puzzle) => {
    const boardCopy = puzzle.board.map(row => [...row]);
    setOriginalBoard(boardCopy);
    setCurrentBoard(boardCopy);
    setHasSolution(false);
    setSolution(null);
    setIsGameComplete(false);
    setIncorrectCells([]);
    setMessage(null);
  }, []);

  // Game mode handlers
  const handleNewGame = useCallback((difficulty: Difficulty) => {
    const { puzzle, solution: newSolution } = generatePuzzle(difficulty);
    setOriginalBoard(puzzle);
    setCurrentBoard(puzzle);
    setSolution(newSolution);
    setHasSolution(false);
    setIsGameComplete(false);
    setIncorrectCells([]);
    setSelectedCell(null);
    setHintedCells([]);
    setMessage({ type: 'success', key: 'messages.puzzleGenerated' });
  }, []);

  const handleCheck = useCallback(() => {
    if (!solution) {
      setMessage({ type: 'error', key: 'messages.emptyBoard' });
      return;
    }

    const validation = validateBoard(currentBoard, solution);

    if (validation.isComplete && validation.isCorrect) {
      setIsGameComplete(true);
      setMessage({ type: 'success', key: 'messages.gameSolved' });
    } else if (!validation.isComplete) {
      setMessage({ type: 'error', key: 'messages.puzzleIncomplete' });
    } else if (validation.incorrectCells.length > 0) {
      setIncorrectCells(validation.incorrectCells);
      setMessage({
        type: 'error',
        key: 'messages.puzzleIncorrect',
        params: [validation.incorrectCells.length.toString()],
      });
    } else {
      setMessage({ type: 'success', key: 'messages.puzzleCorrect' });
    }
  }, [currentBoard, solution]);

  const handleHint = useCallback(() => {
    if (!selectedCell || !solution) return;
    const [row, col] = selectedCell;
    if (originalBoard[row][col] !== 0) return;

    const newBoard = copyBoard(currentBoard);
    newBoard[row][col] = solution[row][col];
    setCurrentBoard(newBoard);
    setHintedCells(prev => {
      if (prev.some(([r, c]) => r === row && c === col)) return prev;
      return [...prev, [row, col]];
    });
    setMessage({ type: 'success', key: 'messages.hintUsed' });
  }, [selectedCell, solution, currentBoard, originalBoard]);

  const handleCellSelect = useCallback((row: number, col: number) => {
    setSelectedCell([row, col]);
  }, []);

  const handleCellBlur = useCallback(() => {
    // Use setTimeout to defer selection clearing until after click handlers fire.
    // When user clicks Hint button: blur fires first, then click. Without the
    // delay, selectedCell would be cleared before handleHint can read it.
    setTimeout(() => {
      setSelectedCell(prev => {
        const activeEl = document.activeElement;
        if (activeEl && activeEl.classList.contains('sudoku-cell')) {
          return prev; // Focus moved to another cell in the grid
        }
        return null;
      });
    }, 0);
  }, []);

  const handleGiveUp = useCallback(() => {
    if (solution) {
      setCurrentBoard(solution);
      setIsGameComplete(true);
      setIncorrectCells([]);
    }
  }, [solution]);

  const handleModeChange = useCallback((newMode: GameMode) => {
    setMode(newMode);
    // Clear any game-specific state when switching modes
    if (newMode === 'solver') {
      setSelectedCell(null);
      setHintedCells([]);
      setSolution(null);
      setIsGameComplete(false);
      setIncorrectCells([]);
    }
    handleClear();
  }, [handleClear]);

  // Calculate game stats for game mode
  const gameStats: GameStatsType = getPuzzleStats(currentBoard);

  return (
    <div className="app">
      <header className="app-header">
        <h2>{mode === 'game' ? t('app.titleGame') : t('app.title')}</h2>
        <LanguageSwitcher />
      </header>

      {message && (
        <Toast type={message.type} onClose={() => setMessage(null)}>
          {message.params ? t(message.key, ...message.params) : t(message.key)}
        </Toast>
      )}

      <main className="app-main">
        <div className="mode-switcher-container">
          <ModeSwitcher currentMode={mode} onModeChange={handleModeChange} />
        </div>

        <div className="game-area">
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
        </div>

        <aside className="sidebar">
          {mode === 'game' && <GameStats stats={gameStats} />}

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

          <div className="instructions">
            <h3>{mode === 'game' ? t('instructions.gameTitle') : t('instructions.title')}</h3>
            <ol>
              {(mode === 'game' ? tArray('instructions.gameSteps') : tArray('instructions.steps')).map((step: string, index: number) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </aside>
      </main>
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
