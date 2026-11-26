import { useEffect, useRef, useState } from 'react';
import { Button, type ButtonProps } from './Button';

interface ConfirmButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** Текст вопроса во втором шаге, например «Удалить проект?». */
  question: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

/**
 * Кнопка с подтверждением в два шага — без модального окна.
 * Первый клик показывает вопрос и кнопки «Да» / «Отмена», Esc отменяет.
 */
export function ConfirmButton({ question, confirmLabel = 'Да, удалить', onConfirm, children, size, loading, ...rest }: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (asking) confirmRef.current?.focus();
  }, [asking]);

  if (!asking) {
    return (
      <Button {...rest} size={size} loading={loading} onClick={() => setAsking(true)}>
        {children}
      </Button>
    );
  }

  return (
    <span
      role="group"
      aria-label={question}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
      onKeyDown={(e) => e.key === 'Escape' && setAsking(false)}
    >
      <span style={{ fontWeight: 600, fontSize: 14 }}>{question}</span>
      <Button
        ref={confirmRef}
        variant="danger"
        size={size}
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="ghost" size={size} onClick={() => setAsking(false)}>
        Отмена
      </Button>
    </span>
  );
}
