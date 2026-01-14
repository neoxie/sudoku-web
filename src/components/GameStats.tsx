import { useLanguage } from '../i18n/LanguageContext';
import type { GameStats as GameStatsType } from '../types';
import './GameStats.css';

interface GameStatsProps {
  stats: GameStatsType;
}

/**
 * Game Stats Component
 * Displays puzzle progress statistics
 */
export const GameStats: React.FC<GameStatsProps> = ({ stats }) => {
  const { t } = useLanguage();

  return (
    <div className="game-stats">
      <h4>{t('stats.title')}</h4>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">{t('stats.filled')}</span>
          <span className="stat-value">{stats.filledCells}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t('stats.empty')}</span>
          <span className="stat-value">{stats.emptyCells}</span>
        </div>
        <div className="stat-item stat-progress">
          <span className="stat-label">{t('stats.progress')}</span>
          <span className="stat-value">{stats.progress}%</span>
        </div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${stats.progress}%` }}
        />
      </div>
    </div>
  );
};
