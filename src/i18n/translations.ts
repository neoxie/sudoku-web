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
      titleGame: '🧩 数独游戏',
      subtitle: '输入谜题或加载示例开始',
      subtitleGame: '挑战 yourself - 生成新谜题开始游戏',
    },
    // Mode Switcher
    mode: {
      solver: '求解器模式',
      game: '游戏模式',
    },
    // Controls
    controls: {
      solve: '求解',
      solving: '求解中...',
      reset: '重置',
      clear: '清空',
      loadSample: '加载示例：',
      easy: '简单',
      medium: '中等',
      hard: '困难',
      // Game mode controls
      newGame: '新游戏',
      check: '检查答案',
      hint: '提示',
      giveUp: '放弃',
    },
    // Messages
    messages: {
      emptyBoard: '请先输入一些数字！',
      solveSuccess: (ms: string) => `求解成功！耗时 ${ms} 毫秒`,
      noSolution: '此谜题无解，请检查输入。',
      // Game mode messages
      puzzleGenerated: '新谜题已生成！',
      puzzleCorrect: '🎉 恭喜！答案完全正确！',
      puzzleIncorrect: (n: string) => `发现 ${n} 个错误，请检查红色标记的单元格`,
      puzzleIncomplete: '还有空单元格未填写',
      hintUsed: '已填入一个提示数字',
      noMoreHints: '没有更多提示了',
      gameSolved: '🏆 太棒了！你完成了数独！',
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
      gameTitle: '游戏说明',
      gameSteps: [
        '点击「新游戏」生成一个随机数独谜题',
        '点击空单元格并输入数字（1-9）',
        '使用「检查答案」验证你的解答',
        '遇到困难可使用「提示」获取帮助',
        '完成所有单元格即可获胜！',
      ],
    },
    // Game Stats
    stats: {
      title: '游戏进度',
      filled: '已填：',
      empty: '剩余：',
      progress: '进度：',
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
      titleGame: '🧩 Sudoku Game',
      subtitle: 'Enter a puzzle or load a sample to get started',
      subtitleGame: 'Challenge yourself - Generate a new puzzle to play',
    },
    // Mode Switcher
    mode: {
      solver: 'Solver Mode',
      game: 'Game Mode',
    },
    // Controls
    controls: {
      solve: 'Solve Puzzle',
      solving: 'Solving...',
      reset: 'Reset to Original',
      clear: 'Clear Board',
      loadSample: 'Load Sample:',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      // Game mode controls
      newGame: 'New Game',
      check: 'Check Answer',
      hint: 'Hint',
      giveUp: 'Give Up',
    },
    // Messages
    messages: {
      emptyBoard: 'Please enter some numbers first!',
      solveSuccess: (ms: string) => `Solved in ${ms}ms!`,
      noSolution: 'No solution exists for this puzzle. Please check your input.',
      // Game mode messages
      puzzleGenerated: 'New puzzle generated!',
      puzzleCorrect: '🎉 Congratulations! Your answer is completely correct!',
      puzzleIncorrect: (n: string) => `Found ${n} errors. Check the cells marked in red`,
      puzzleIncomplete: 'There are still empty cells to fill',
      hintUsed: 'A hint number has been filled in',
      noMoreHints: 'No more hints available',
      gameSolved: '🏆 Excellent! You completed the Sudoku!',
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
      gameTitle: 'How to Play',
      gameSteps: [
        'Click "New Game" to generate a random Sudoku puzzle',
        'Click on empty cells and enter numbers (1-9)',
        'Use "Check Answer" to verify your solution',
        'Use "Hint" when you need help',
        'Complete all cells to win!',
      ],
    },
    // Game Stats
    stats: {
      title: 'Game Progress',
      filled: 'Filled: ',
      empty: 'Remaining: ',
      progress: 'Progress: ',
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
