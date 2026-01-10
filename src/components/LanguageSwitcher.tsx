import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';
import './LanguageSwitcher.css';

/**
 * Supported languages configuration
 */
const LANGUAGES: Record<Language, { label: string; flag: string }> = {
  'zh-CN': { label: '中文', flag: '🇨🇳' },
  'en-US': { label: 'English', flag: '🇺🇸' },
};

/**
 * Language Switcher Component
 * Displays current language and allows switching between supported languages
 */
export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
  };

  return (
    <div className="language-switcher">
      <button
        className="lang-btn"
        onClick={() => handleLanguageChange(language === 'zh-CN' ? 'en-US' : 'zh-CN')}
        aria-label={t('language.switchTo')}
        title={t('language.switchTo')}
      >
        <span className="lang-flag">{LANGUAGES[language].flag}</span>
        <span className="lang-label">{LANGUAGES[language].label}</span>
        <span className="lang-arrow">▼</span>
      </button>
    </div>
  );
}
