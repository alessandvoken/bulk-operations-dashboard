const formatters = new Map<string, Intl.NumberFormat>();

const NUMBER_FORMAT_LOCALE = 'it-IT';

const getFormatter = (currency: string) => {
  const formatter = formatters.get(currency);
  if (formatter) {
    return formatter;
  }
  const newFormatter = new Intl.NumberFormat(NUMBER_FORMAT_LOCALE, {
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
