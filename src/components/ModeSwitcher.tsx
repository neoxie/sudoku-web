import { useLanguage } from '../i18n/LanguageContext';
import type { GameMode } from '../types';
import './ModeSwitcher.css';

interface ModeSwitcherProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

/**
 * Mode Switcher Component
 * Allows toggling between Solver Mode and Game Mode
 */
export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentMode,
  onModeChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="mode-switcher">
      <button
        className={`mode-btn ${currentMode === 'solver' ? 'active' : ''}`}
        onClick={() => onModeChange('solver')}
      >
        {t('mode.solver')}
      </button>
      <button
        className={`mode-btn ${currentMode === 'game' ? 'active' : ''}`}
        onClick={() => onModeChange('game')}
      >
        {t('mode.game')}
      </button>
    </div>
  );
};
