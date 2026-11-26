import { ICONS, type IconName } from './icons';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  /** Подпись для экранных читалок. Без неё иконка считается декоративной. */
  label?: string;
}

/** SVG-иконки (набор Feather). Разметка иконок — статические строки из icons.ts. */
export function Icon({ name, size = 18, className, label }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
