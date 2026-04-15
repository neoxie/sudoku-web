# Floating Toast Message Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace inline message banners with a floating Toast component that appears at screen top-center and auto-dismisses after 5 seconds.

**Architecture:** Create a standalone `Toast` component with fixed positioning, auto-dismiss timer, hover-pause, and CSS enter/exit animations. The component receives message content via props and calls `onClose` to clear the parent state. App.tsx replaces its inline message div with the new Toast component.

**Tech Stack:** React 19, TypeScript, pure CSS (matching existing codebase conventions).

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/components/Toast.tsx` | Toast component with timer and animation logic |
| Create | `src/components/Toast.css` | Fixed positioning, colors, enter/exit animations |
| Modify | `src/App.tsx:1,231-235` | Replace inline message div with Toast component |
| Modify | `src/App.css:62-83` | Remove old `.message` / `.message-success` / `.message-error` styles |

---

### Task 1: Create Toast CSS

**Files:**
- Create: `src/components/Toast.css`

- [ ] **Step 1: Write the Toast stylesheet**

```css
/* Toast.css - Floating notification styles */

.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 280px;
  max-width: 500px;
  pointer-events: auto;
}

.toast {
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.9rem;
  text-align: center;
  animation: toastEnter 0.3s ease-out forwards;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-exit {
  animation: toastExit 0.3s ease-in forwards;
}

.toast-success {
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.toast-error {
  background: var(--color-error-bg);
  color: var(--color-error-text);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

@keyframes toastEnter {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toastExit {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-16px);
  }
}
```

- [ ] **Step 2: Verify file is created**

Run: `ls -la src/components/Toast.css`

---

### Task 2: Create Toast Component

**Files:**
- Create: `src/components/Toast.tsx`

- [ ] **Step 1: Write the Toast component**

```tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import './Toast.css';

interface ToastProps {
  type: 'success' | 'error';
  children: React.ReactNode;
  onClose: () => void;
  duration?: number;
}

/**
 * Floating toast notification with auto-dismiss and hover-pause.
 * Appears at screen top-center and fades out after `duration` ms.
 */
export function Toast({ type, children, onClose, duration = 5000 }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(duration);
  const startTimeRef = useRef<number>(Date.now());

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCloseSequence = useCallback(() => {
    setIsClosing(true);
    // Wait for exit animation to finish, then notify parent
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const startTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      startCloseSequence();
    }, remainingRef.current);
  }, [clearTimer, startCloseSequence]);

  // Start timer on mount; reset when children change (new message replaces old)
  useEffect(() => {
    remainingRef.current = duration;
    setIsClosing(false);
    startTimer();
    return clearTimer;
  }, [children, duration, startTimer, clearTimer]);

  const handleMouseEnter = () => {
    // Pause: save remaining time
    if (timerRef.current) {
      remainingRef.current -= (Date.now() - startTimeRef.current);
      clearTimer();
    }
  };

  const handleMouseLeave = () => {
    // Resume: restart with remaining time
    if (!isClosing && remainingRef.current > 0) {
      startTimer();
    }
  };

  return (
    <div
      className={`toast ${isClosing ? 'toast-exit' : ''} toast-${type}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/components/Toast.tsx`
Expected: No errors

---

### Task 3: Integrate Toast into App.tsx

**Files:**
- Modify: `src/App.tsx:1,231-235`

- [ ] **Step 1: Add Toast import**

At `src/App.tsx:6`, after the existing component imports, add:

```tsx
import { Toast } from './components/Toast';
```

The import section becomes (lines 1-21):

```tsx
import { useState, useCallback } from 'react';
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
  getHint,
  getPuzzleStats,
} from './game';
import type { Board, Puzzle, GameMode, Difficulty, GameStats as GameStatsType } from './types';
import './App.css';
```

- [ ] **Step 2: Replace inline message with Toast**

Replace lines 231-235 in `src/App.tsx`:

Before:
```tsx
        {message && (
          <div className={`message message-${message.type}`}>
            {message.params ? t(message.key, ...message.params) : t(message.key)}
          </div>
        )}
```

After:
```tsx
        {message && (
          <Toast type={message.type} onClose={() => setMessage(null)}>
            {message.params ? t(message.key, ...message.params) : t(message.key)}
          </Toast>
        )}
```

- [ ] **Step 3: Verify the app compiles and runs**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors.

---

### Task 4: Remove Old Message Styles from App.css

**Files:**
- Modify: `src/App.css:62-83`

- [ ] **Step 1: Remove message banner styles**

Delete the following block from `src/App.css` (lines 62-83):

```css
/* Message banners */
.message {
  grid-column: 1 / -1;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.9rem;
  text-align: center;
  animation: slideIn 0.3s ease-out;
}

.message-success {
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.message-error {
  background: var(--color-error-bg);
  color: var(--color-error-text);
  border: 1px solid rgba(239, 68, 68, 0.2);
}
```

Also remove the responsive override at line 196-198:

```css
  .message {
    grid-column: 1;
  }
```

- [ ] **Step 2: Verify the app still runs**

Run: `npm run dev`
Expected: Dev server starts. Navigate to the app and trigger a message (e.g., click "Solve" on an empty board). The message should appear as a floating toast at screen top-center and disappear after 5 seconds.

---

### Task 5: Manual Verification

- [ ] **Step 1: Test all message-triggering actions**

Verify each of these triggers a floating toast:
1. **Solver mode**: Click "Solve" with empty board → error toast
2. **Solver mode**: Enter numbers, click "Solve" → success toast with time
3. **Game mode**: Click "New Game" → success toast
4. **Game mode**: Click "Check" with incomplete puzzle → error toast
5. **Game mode**: Click "Hint" → success toast

- [ ] **Step 2: Test hover-pause**

Hover over a toast before it disappears. Verify the timer pauses. Move mouse away and verify it resumes.

- [ ] **Step 3: Test new message replaces old**

Trigger a toast, then immediately trigger another one. Verify only the latest message is shown and the timer resets.
