import type { Puzzle } from './types';
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
              Solving...
            </>
          ) : (
            'Solve Puzzle'
          )}
        </button>

        <button
          className="btn btn-secondary"
          onClick={onReset}
          disabled={!hasSolution && isBoardEmpty}
        >
          Reset to Original
        </button>

        <button
          className="btn btn-secondary"
          onClick={onClear}
          disabled={isBoardEmpty}
        >
          Clear Board
        </button>
      </div>

      <div className="control-row sample-section">
        <span className="sample-label">Load Sample:</span>
        {samplePuzzles.map((puzzle) => (
          <button
            key={puzzle.name}
            className={`btn btn-sample ${puzzle.difficulty}`}
            onClick={() => onLoadPuzzle(puzzle)}
          >
            {puzzle.name}
          </button>
        ))}
      </div>
    </div>
  );
};
