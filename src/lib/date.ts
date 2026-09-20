const DATE_FORMAT_LOCALE = 'en-GB';

const dateFormatter = new Intl.DateTimeFormat(DATE_FORMAT_LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
