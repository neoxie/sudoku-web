import { useState, useEffect, useRef, useCallback } from 'react';
import './Toast.css';

interface ToastProps {
  type: 'success' | 'error';
  children: React.ReactNode;
  onClose: () => void;
  duration?: number;
}

const EXIT_ANIMATION_MS = 300;

/**
 * Floating toast notification with auto-dismiss and hover-pause.
 * Appears at screen top-center and fades out after `duration` ms.
 */
export function Toast({ type, children, onClose, duration = 5000 }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(duration);
  const startTimeRef = useRef<number>(0);

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
    }, EXIT_ANIMATION_MS);
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
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startTimeRef.current));
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
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
    </div>
  );
}
