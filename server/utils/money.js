export const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const toPaise = (rupees) => Math.round(round2(rupees) * 100);

export const fromPaise = (paise) => round2(Number(paise) / 100);

export function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default { round2, toPaise, fromPaise, formatINR };
