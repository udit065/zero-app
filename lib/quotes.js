export const QUOTES = [
  { text: 'KARM KRO DHARM KE SATH, PHAL KI CHINTA MT KRO', primary: true },
  { text: 'Repair, don’t repeat.' },
  { text: 'It is OKAY.' },
  { text: 'Fix, don’t fixate.', primary: true },
];

// Same quote all day, changes each day.
export const quoteOfTheDay = (dateKey) => {
  const n = dateKey.split('-').reduce((a, x) => a + Number(x), 0);
  return QUOTES[n % QUOTES.length];
};
