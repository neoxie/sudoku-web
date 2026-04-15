# Floating Toast Message Design

## Problem

Messages currently render as inline grid items (`grid-column: 1 / -1`) inside `.app-main`, occupying layout space and pushing other elements down. They should float above the page content and auto-dismiss after 5 seconds.

## Solution

Create a standalone `Toast` component with `position: fixed` at screen top-center, auto-dismiss timer, hover pause, and enter/exit animations.

## Component: `components/Toast.tsx`

### Interface

```typescript
interface ToastProps {
  type: 'success' | 'error';
  children: React.ReactNode;
  onClose: () => void;
  duration?: number; // default 5000ms
}
```

### Behavior

1. On mount: start countdown timer (default 5s)
2. Timer expires: set `isClosing` state to trigger exit animation, then call `onClose` after animation completes
3. Mouse hover: pause timer (user may need to read message)
4. Mouse leave: resume timer
5. New message (props change): reset timer via `useEffect` dependency on `children`

### Animation

- **Enter**: slide down + fade in (0.3s ease-out)
- **Exit**: slide up + fade out (0.3s ease-out), controlled by `isClosing` state class

## Changes to `App.tsx`

Replace inline message div with Toast component:

```tsx
{message && (
  <Toast type={message.type} onClose={() => setMessage(null)}>
    {message.params ? t(message.key, ...message.params) : t(message.key)}
  </Toast>
)}
```

Remove `.message`, `.message-success`, `.message-error` styles from `App.css`.

## CSS: `components/Toast.css`

- `.toast-container`: `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1000;`
- `.toast-success` / `.toast-error`: reuse existing color tokens (`--color-success-bg`, etc.)
- `.toast-enter` / `.toast-exit`: keyframe animations

## Scope

- Single toast at a time (new replaces old)
- No stacking support (YAGNI — add later if needed)
- Responsive: toast width adapts with `max-width` and `min-width`
