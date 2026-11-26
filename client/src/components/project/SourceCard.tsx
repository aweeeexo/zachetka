import type { Requirement } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

/** Карточка «Источник требования»: цитата из задания и номер строки. */
export function SourceCard({ requirement }: { requirement: Requirement | null }) {
  return (
    <Card compact aria-labelledby="source-title">
      <p id="source-title" style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary-strong)' }}>
        Источник требования
      </p>
      {!requirement && <p style={{ marginTop: 10, color: 'var(--muted-fg)', fontSize: 14 }}>Нажмите «стр. N» у пункта, чтобы увидеть цитату из задания.</p>}
      {requirement && (
        <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
          <p style={{ fontWeight: 600 }}>{requirement.text}</p>
          {requirement.sourceQuote ? (
            <>
              <blockquote style={{ margin: 0, padding: '2px 0 2px 12px', borderLeft: '3px solid var(--primary)', color: 'var(--muted-fg)', fontSize: 14, lineHeight: 1.55 }}>
                <mark style={{ background: '#ffedd5', color: 'inherit', padding: '0 2px' }}>{requirement.sourceQuote}</mark>
              </blockquote>
              <p style={{ fontSize: 13, fontWeight: 600, color: requirement.quoteFound ? 'var(--primary-strong)' : 'var(--danger)', display: 'flex', gap: 6, alignItems: 'center' }}>
                <Icon name={requirement.quoteFound ? 'checkCircle' : 'alert'} size={15} />
                {requirement.quoteFound ? `Строка ${requirement.sourceLine} в исходном задании` : 'Цитата не найдена в тексте — проверьте пункт вручную'}
              </p>
            </>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--muted-fg)' }}>Пункт добавлен вручную — у него нет цитаты.</p>
          )}
        </div>
      )}
    </Card>
  );
}
