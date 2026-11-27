const eurIntegerFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const eurDecimalFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('en-US');

export function formatEur(amount: number): string {
  return eurIntegerFormatter.format(Math.round(amount));
}

export function formatEurPerKm(costPerKm: number): string {
  return `${eurDecimalFormatter.format(costPerKm)}/km`;
}

export function formatNumber(value: number): string {
  return integerFormatter.format(Math.round(value));
}

export function formatStarScore(score: number): string {
  return score.toFixed(1);
}
