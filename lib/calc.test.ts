import test from 'node:test';
import assert from 'node:assert/strict';
import { marginalRate, apit, payslip, netToGross, bonusTax, gratuity, futureValue, EPF_INTEREST_RATE, ETF_INTEREST_RATE } from './calc.ts';

test('no tax at or below relief', () => assert.equal(apit(150000), 0));
test('Rs 200k worked example from the reference calculator', () => {
  const p = payslip({ basic: 200000 });
  assert.equal(p.apit, 3000);
  assert.equal(p.epfEmployee, 16000);
  assert.equal(p.net, 180975);
});
test('top band is 36%', () => {
  const base = apit(400000);
  assert.equal(apit(410000) - base, 3600);
});
test('band boundary 233,333 -> ~5,000', () => assert.ok(Math.abs(apit(233333) - 4999.98) < 0.01));
test('netToGross round-trips', () => {
  const g = netToGross(180975);
  assert.ok(Math.abs(g - 200000) < 0.5);
});

test('bonus taxed at marginal rates', () => {
  // 250k taxable: 83333*6% + 16667*18% = 8000.04, minus 3000 on salary alone
  const b = bonusTax(200000, 50000);
  assert.ok(Math.abs(b.tax - 5000.04) < 0.01);
});
test('gratuity needs 5 completed years', () => {
  assert.equal(gratuity(90000, 4.9).amount, 0);
  assert.equal(gratuity(90000, 10).amount, 450000);
});

test('netToGross honours allowance share, other deductions and stamp', () => {
  const g = netToGross(200000, { allowanceRatio: 0.3, otherDeductions: 5000 });
  const p = payslip({ basic: g * 0.7, allowances: g * 0.3, otherDeductions: 5000 });
  assert.ok(Math.abs(p.net - 200000) < 0.05);
});

test('marginal rate by band', () => {
  assert.equal(marginalRate(100000), 0);
  assert.equal(marginalRate(200000), 0.06);
  assert.equal(marginalRate(250000), 0.18);
  assert.equal(marginalRate(500000), 0.36);
});

test('fixed basic: EPF/ETF on basic, tax on gross', () => {
  const p = payslip({ basic: 100000, allowances: 100000 });
  assert.equal(p.epfEmployee, 8000);
  assert.equal(p.etfEmployer, 3000);
  assert.equal(p.apit, 3000); // tax on 200k gross, not 100k basic
});
test('netToGross with fixed basic round-trips', () => {
  const g = netToGross(185000, { basic: 100000 });
  const p = payslip({ basic: 100000, allowances: g - 100000 });
  assert.ok(Math.abs(p.net - 185000) < 0.05);
});

test('futureValue: zero years returns 0', () => assert.equal(futureValue(12000, EPF_INTEREST_RATE, 0), 0));
test('futureValue: one year equals the contribution', () => assert.equal(futureValue(12000, EPF_INTEREST_RATE, 1), 12000));
test('futureValue: two years with EPF rate', () => {
  // year-1 contribution grows by EPF rate, year-2 contribution added at year end
  const expected = Math.round((12000 * 1.1075 + 12000) * 100) / 100;
  assert.equal(futureValue(12000, EPF_INTEREST_RATE, 2), expected);
});
test('futureValue: zero rate falls back to simple sum', () => assert.equal(futureValue(5000, 0, 4), 20000));
test('EPF and ETF interest rates are positive and under 20%', () => {
  assert.ok(EPF_INTEREST_RATE > 0 && EPF_INTEREST_RATE < 0.2);
  assert.ok(ETF_INTEREST_RATE > 0 && ETF_INTEREST_RATE < 0.2);
});
