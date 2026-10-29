// Sri Lanka payroll maths, 2026/27 (APIT bands effective 1 April 2025).
export const RELIEF = 150000; // monthly personal relief (Rs. 1.8M / yr)
export const BANDS: { width: number; rate: number }[] = [
  { width: 83333, rate: 0.06 },
  { width: 41667, rate: 0.18 },
  { width: 41667, rate: 0.24 },
  { width: 41666, rate: 0.30 },
  { width: Infinity, rate: 0.36 },
];
export const EPF_EMPLOYEE = 0.08;
export const EPF_EMPLOYER = 0.12;
export const ETF_EMPLOYER = 0.03;
export const STAMP_DUTY = 25;
export const EPF_INTEREST_RATE = 0.1075; // 10.75% p.a. declared by Central Bank of Sri Lanka
export const ETF_INTEREST_RATE = 0.095;  // 9.5% p.a. dividend declared by ETF Board

export function apit(taxable: number) {
  let left = Math.max(0, taxable - RELIEF);
  let tax = 0;
  for (const { width, rate } of BANDS) {
    const part = Math.min(left, width);
    tax += part * rate;
    left -= part;
    if (left <= 0) break;
  }
  return Math.round(tax * 100) / 100;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export interface PayslipInput {
  basic: number;
  allowances?: number;
  otherDeductions?: number;
  stampDuty?: boolean;
}

/** EPF/ETF apply to basic only; APIT applies to total gross. */
export function payslip({ basic, allowances = 0, otherDeductions = 0, stampDuty = true }: PayslipInput) {
  const gross = basic + allowances;
  const tax = apit(gross);
  const epfEmployee = r2(basic * EPF_EMPLOYEE);
  const stamp = stampDuty ? STAMP_DUTY : 0;
  const totalDeductions = r2(tax + epfEmployee + stamp + otherDeductions);
  return {
    basic, allowances, gross, apit: tax, epfEmployee, stamp, otherDeductions,
    totalDeductions,
    net: r2(gross - totalDeductions),
    epfEmployer: r2(basic * EPF_EMPLOYER),
    etfEmployer: r2(basic * ETF_EMPLOYER),
  };
}

/** Find gross that yields the target net, keeping the allowance share fixed. */
export function netToGross(
  targetNet: number,
  { allowanceRatio = 0, basic, otherDeductions = 0, stampDuty = true }:
    { allowanceRatio?: number; basic?: number; otherDeductions?: number; stampDuty?: boolean } = {},
) {
  // With a fixed basic, gross can't fall below it and everything above is allowances.
  const net = (g: number) =>
    basic === undefined
      ? payslip({ basic: g * (1 - allowanceRatio), allowances: g * allowanceRatio, otherDeductions, stampDuty }).net
      : payslip({ basic, allowances: g - basic, otherDeductions, stampDuty }).net;
  let lo = basic ?? 0, hi = Math.max(targetNet * 3, (basic ?? 0) * 3, 1000);
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    net(mid) < targetNet ? (lo = mid) : (hi = mid);
  }
  return r2(hi);
}

export const fmt = (n: number) =>
  new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

/** Bonus is added to that month's pay; tax on the bonus is the extra APIT it causes. */
export function bonusTax(monthlyGross: number, bonus: number) {
  const tax = r2(apit(monthlyGross + bonus) - apit(monthlyGross));
  return { tax, net: r2(bonus - tax), effectiveRate: bonus ? tax / bonus : 0 };
}

/** Payment of Gratuity Act: half a month's salary per completed year, minimum 5 years' service. */
export const GRATUITY_MIN_YEARS = 5;
export function gratuity(lastMonthlySalary: number, years: number) {
  const completed = Math.floor(years);
  const eligible = completed >= GRATUITY_MIN_YEARS;
  return { completed, eligible, amount: eligible ? r2((lastMonthlySalary / 2) * completed) : 0 };
}

/**
 * Future value of equal end-of-year contributions compounded at a fixed annual rate.
 * FV = C × ((1 + r)^n − 1) / r
 */
export function futureValue(annualContribution: number, rate: number, years: number): number {
  if (years <= 0) return 0;
  if (rate === 0) return r2(annualContribution * years);
  return r2(annualContribution * ((Math.pow(1 + rate, years) - 1) / rate));
}

/** Rate charged on the next rupee of taxable income. */
export function marginalRate(taxable: number) {
  let left = taxable - RELIEF;
  if (left <= 0) return 0;
  for (const { width, rate } of BANDS) {
    if (left <= width) return rate;
    left -= width;
  }
  return BANDS[BANDS.length - 1].rate;
}
