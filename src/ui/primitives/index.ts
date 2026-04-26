// UI Primitives Barrel
// Re-exports all base primitives and public types from a single module so
// screens/features can import consistently without deep relative paths.

// ── Actions ───────────────────────────────────────────────────────────────────
export { Button } from './Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './Button';

export { Card } from './Card';
export type { CardProps, CardVariant } from './Card';

export { Text } from './Text';
export type { TextProps } from './Text';

export { IconButton } from './IconButton';
export type { IconButtonProps, IconButtonVariant } from './IconButton';

// ── Feedback ──────────────────────────────────────────────────────────────────
export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

export { Toast } from './Toast';
export type { ToastProps, ToastType } from './Toast';

// ── Overlays ──────────────────────────────────────────────────────────────────
export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { BottomSheetModal } from './BottomSheetModal';
export type { BottomSheetModalProps } from './BottomSheetModal';
