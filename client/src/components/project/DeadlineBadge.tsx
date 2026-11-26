import { deadlineLabel, deadlineTone, formatShortDate, type DeadlineTone } from '../../lib/dates';
import { Badge, type BadgeTone } from '../ui/Card';
import { Icon } from '../ui/Icon';

const TONES: Record<DeadlineTone, BadgeTone> = {
  overdue: 'danger',
  today: 'accent',
  soon: 'warning',
  later: 'primary',
  none: 'neutral',
};

interface DeadlineBadgeProps {
  deadline: string | null;
  /** Этап полностью закрыт — показываем «сдано» вместо обратного отсчёта. */
  done?: boolean;
  now?: Date;
}

/** Бейдж дедлайна: цвет зависит от того, сколько осталось (прошёл / сегодня / скоро / позже). */
export function DeadlineBadge({ deadline, done = false, now }: DeadlineBadgeProps) {
  if (done) {
    return (
      <Badge tone="primary">
        <Icon name="check" size={13} />
        {deadline ? `${formatShortDate(deadline)} · сдано` : 'сдано'}
      </Badge>
    );
  }
  return (
    <Badge tone={TONES[deadlineTone(deadline, now)]}>
      <Icon name="clock" size={13} />
      {deadlineLabel(deadline, now)}
    </Badge>
  );
}
