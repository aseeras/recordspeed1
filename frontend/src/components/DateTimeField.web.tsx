import { createElement } from 'react';

import { colors, radius } from '../lib/theme.ts';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a Date as the local "YYYY-MM-DDTHH:mm" value a datetime-local input expects. */
function toInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Browser date + time picker; the native picker library has no web implementation. */
export function DateTimeField({ value, onChange }: Props) {
  return createElement('input', {
    type: 'datetime-local',
    'aria-label': 'Event date and time',
    value: toInputValue(value),
    onChange: (event: { target: { value: string } }) => {
      // The input value has no timezone, so `new Date(...)` reads it as local time.
      const date = new Date(event.target.value);
      if (!Number.isNaN(date.getTime())) onChange(date);
    },
    style: {
      flex: 1,
      fontSize: 16,
      padding: '8px 10px',
      borderRadius: radius,
      border: `1px solid ${colors.border}`,
      color: colors.text,
      backgroundColor: colors.surface,
      fontFamily: 'inherit',
    },
  });
}
