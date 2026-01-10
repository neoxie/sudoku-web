import type { Puzzle } from './types';
import { useLanguage } from './i18n/LanguageContext';
import './Controls.css';

interface ControlsProps {
  onSolve: () => void;
  onClear: () => void;
  onReset: () => void;
  onLoadPuzzle: (puzzle: Puzzle) => void;
  isSolving: boolean;
  hasSolution: boolean;
  isBoardEmpty: boolean;
  samplePuzzles: Puzzle[];
}

/**
 * Controls Component
 * Provides buttons for solving, clearing, resetting, and loading sample puzzles
 */
export const Controls: React.FC<ControlsProps> = ({
  onSolve,
  onClear,
  onReset,
  onLoadPuzzle,
  isSolving,
  hasSolution,
  isBoardEmpty,
  samplePuzzles,
}) => {
  const { t } = useLanguage();

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
