import { APP_LOCALE } from './locale';

const dateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
