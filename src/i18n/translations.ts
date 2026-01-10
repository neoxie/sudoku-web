/**
 * Translation type definitions for type safety
 */
export type Language = 'zh-CN' | 'en-US';

/**
 * Translations for all supported languages
 */
export const translations = {
  'zh-CN': {
    // App Header
    app: {
      title: '🎯 数独求解器',
      subtitle: '输入谜题或加载示例开始',
    },
    // Controls
    controls: {
      solve: '求解',
      solving: '求解中...',
      reset: '重置',
      clear: '清空',
      loadSample: '加载示例：',
    },
    // Messages
    messages: {
      emptyBoard: '请先输入一些数字！',
      solveSuccess: (ms: string) => `求解成功！耗时 ${ms} 毫秒`,
      noSolution: '此谜题无解，请检查输入。',
    },
    // Instructions
    instructions: {
      title: '使用说明',
      steps: [
        '点击单元格输入数字（1-9），或加载示例谜题',
        '填入数独谜题的已知数字',
        '点击「求解」按钮寻找答案',
        '使用「重置」恢复原始输入',
        '使用「清空」重新开始',
      ],
    },
    // Footer
    footer: '使用 React + TypeScript 构建 • 回溯算法',
    // Language Switcher
    language: {
      switchTo: 'English',
      current: '中文',
    },
  },
  'en-US': {
    // App Header
    app: {
      title: '🎯 Sudoku Solver',
      subtitle: 'Enter a puzzle or load a sample to get started',
    },
    // Controls
    controls: {
      solve: 'Solve Puzzle',
      solving: 'Solving...',
      reset: 'Reset to Original',
      clear: 'Clear Board',
      loadSample: 'Load Sample:',
    },
    // Messages
    messages: {
      emptyBoard: 'Please enter some numbers first!',
      solveSuccess: (ms: string) => `Solved in ${ms}ms!`,
      noSolution: 'No solution exists for this puzzle. Please check your input.',
    },
    // Instructions
    instructions: {
      title: 'How to Use',
      steps: [
        'Click on a cell and enter a number (1-9), or load a sample puzzle',
        'Fill in the known numbers of your Sudoku puzzle',
        'Click "Solve Puzzle" to find the solution',
        'Use "Reset" to restore your original input',
        'Use "Clear" to start over with an empty board',
      ],
    },
    // Footer
    footer: 'Built with React + TypeScript • Backtracking Algorithm',
    // Language Switcher
    language: {
      switchTo: '中文',
      current: 'English',
    },
  },
} as const;

/**
 * Get translation by key with support for nested paths and arrays
 */
export function getTranslation(
  lang: Language,
  key: string,
  ...args: unknown[]
): string | string[] {
  const keys = key.split('.');
  let value: unknown = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  // Handle function translations (with parameters)
  if (typeof value === 'function') {
    return (value as (...args: unknown[]) => string)(...args);
  }

  // Return as-is for strings and arrays
  if (typeof value === 'string' || Array.isArray(value)) {
    return value;
  }

  console.warn(`Translation value is not a string or array: ${key}`);
  return key;
}

/**
 * Detect browser language and return supported language code
 * Defaults to 'zh-CN' if detection fails
 */
export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language;

  // Check exact match first
  if (browserLang in translations) {
    return browserLang as Language;
  }

  // Check for language prefix (e.g., 'zh' from 'zh-CN')
  const prefix = browserLang.split('-')[0];
  const matchedLang = Object.keys(translations).find(lang =>
    lang.startsWith(prefix)
  );

  return (matchedLang as Language) || 'zh-CN';
}
