import { APP_LOCALE } from './locale';

const formatters = new Map<string, Intl.NumberFormat>();

const getFormatter = (currency: string) => {
  const formatter = formatters.get(currency);
  if (formatter) {
    return formatter;
  }
  const newFormatter = new Intl.NumberFormat(APP_LOCALE, {
    style: 'currency',
    currency,
  });
  formatters.set(currency, newFormatter);

  return newFormatter;
};

export const formatMoney = (amountCents: number, currency: string) => {
  const formatter = getFormatter(currency);
  return formatter.format(amountCents / 100);
};
