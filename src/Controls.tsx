import type { Puzzle, GameMode, Difficulty } from './types';
import { useLanguage } from './i18n/LanguageContext';
import './Controls.css';

interface ControlsProps {
  mode: GameMode;
  // Solver mode props
  onSolve: () => void;
  onClear: () => void;
  onReset: () => void;
  onLoadPuzzle: (puzzle: Puzzle) => void;
  isSolving: boolean;
  hasSolution: boolean;
  isBoardEmpty: boolean;
  samplePuzzles: Puzzle[];
  // Game mode props
  onNewGame: (difficulty: Difficulty) => void;
  onCheck: () => void;
  onHint: () => void;
  onGiveUp: () => void;
  isGameComplete: boolean;
  isHintAvailable: boolean;
  gameDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

/**
 * Controls Component
 * Provides buttons for solving, clearing, resetting, loading sample puzzles,
 * and game mode controls (new game, check, hint, give up)
 */
export const Controls: React.FC<ControlsProps> = ({
  mode,
  onSolve,
  onClear,
  onReset,
  onLoadPuzzle,
  isSolving,
  hasSolution,
  isBoardEmpty,
  samplePuzzles,
  onNewGame,
  onCheck,
  onHint,
  onGiveUp,
  isGameComplete,
  isHintAvailable,
  gameDifficulty,
  onDifficultyChange,
}) => {
  const { t } = useLanguage();

  if (mode === 'game') {
    return (
      <div className="controls">
        <div className="control-row">
          <select
            className="difficulty-select"
            value={gameDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
          >
            <option value="easy">{t('controls.easy')}</option>
            <option value="medium">{t('controls.medium')}</option>
            <option value="hard">{t('controls.hard')}</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={() => onNewGame(gameDifficulty)}
          >
            {t('controls.newGame')}
          </button>
        </div>

        <div className="control-row">
          <button
            className="btn btn-secondary"
            onClick={onCheck}
            disabled={isBoardEmpty || isGameComplete}
          >
            {t('controls.check')}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onHint}
            disabled={!isHintAvailable}
          >
            {t('controls.hint')}
          </button>
          <button
            className="btn btn-danger"
            onClick={onGiveUp}
          >
            {t('controls.giveUp')}
          </button>
        </div>
      </div>
    );
  }

  // Solver mode
  return (
    <div className="controls">
      <div className="control-row">
        <button
          className="btn btn-primary"
          onClick={onSolve}
          disabled={isSolving || isBoardEmpty}
        >
          {isSolving ? (
            <>
              <span className="spinner" />
              {t('controls.solving')}
            </>
          ) : (
            t('controls.solve')
          )}
        </button>

        <button
          className="btn btn-secondary"
          onClick={onReset}
          disabled={!hasSolution && isBoardEmpty}
        >
          {t('controls.reset')}
        </button>

        <button
          className="btn btn-secondary"
          onClick={onClear}
          disabled={isBoardEmpty}
        >
          {t('controls.clear')}
        </button>
      </div>

      <div className="control-row sample-section">
        <span className="sample-label">{t('controls.loadSample')}</span>
        {samplePuzzles.map((puzzle) => (
          <button
            key={puzzle.nameKey}
            className={`btn btn-sample ${puzzle.difficulty}`}
            onClick={() => onLoadPuzzle(puzzle)}
          >
            {t(`controls.${puzzle.nameKey}` as any)}
          </button>
        ))}
      </div>
    </div>
  );
};
