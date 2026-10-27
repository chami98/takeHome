'use client';

import { useState } from 'react';
import { Payslip } from './Payslip';
import { AmountField, Donut, Legend, RangeField, Segmented, Stat, Switch, type Slice } from './ui';
import { BANDS, RELIEF, bonusTax, fmt, gratuity, GRATUITY_MIN_YEARS, marginalRate, netToGross, payslip } from '@/lib/calc';

type Tab = 'salary' | 'increment' | 'bonus' | 'gratuity' | 'compare';
const TABS: { id: Tab; label: string }[] = [
  { id: 'salary', label: 'Take home pay' },
  { id: 'increment', label: 'Pay rise' },
  { id: 'bonus', label: 'Bonus tax' },
  { id: 'gratuity', label: 'Gratuity' },
  { id: 'compare', label: 'Compare' },
];
const rs = (n: number) => `Rs. ${fmt(n)}`;
const SCALE_MAX = 450000;

/** The monthly pay bands drawn to scale, with a marker at the user's taxable income. */
function BandScale({ taxable }: { taxable: number }) {
  const edges = [0, RELIEF];
  BANDS.forEach((b) => edges.push(Math.min(edges[edges.length - 1] + b.width, SCALE_MAX)));
  const rates = [0, ...BANDS.map((b) => b.rate)];
  const pos = Math.min(taxable / SCALE_MAX, 1) * 100;
  return (
    <div className="scale" aria-label={`Taxable income Rs. ${fmt(taxable)} against the tax bands`}>
      <div className="scale-bar">
        {rates.map((r, i) => (
          <span key={i} className={`b${i}`} style={{ width: `${((edges[i + 1] - edges[i]) / SCALE_MAX) * 100}%` }}>
            {Math.round(r * 100)}%
          </span>
        ))}
        <i style={{ left: `${pos}%` }} />
      </div>
      <p>Rs. {fmt(taxable)} a month puts you in the {Math.round(marginalRate(taxable) * 100)}% band.</p>
    </div>
  );
}

export default function Calculator() {
  const [tab, setTab] = useState<Tab>('salary');
  const [mode, setMode] = useState<'gross' | 'net'>('gross');
  const [salary, setSalary] = useState(200000);
  const [basic, setBasic] = useState(0); // 0 means basic equals gross
  const [other, setOther] = useState(0);
  const [stamp, setStamp] = useState(true);
  const [incPct, setIncPct] = useState(10);
  const [bSalary, setBSalary] = useState(200000);
  const [bonus, setBonus] = useState(100000);
  const [gSalary, setGSalary] = useState(100000);
  const [years, setYears] = useState(10);
  const [aGross, setAGross] = useState(200000);
  const [aBasic, setABasic] = useState(0);
  const [cGross, setCGross] = useState(250000);
  const [cBasic, setCBasic] = useState(0);

  // EPF and ETF come from basic; tax comes from gross. Allowances are whatever gross has above basic.
  const build = (gross: number, basicPay: number) =>
    payslip({ basic: basicPay, allowances: gross - basicPay, otherDeductions: other, stampDuty: stamp });
  const gross = mode === 'gross'
    ? salary
    : netToGross(salary, { basic: basic || undefined, otherDeductions: other, stampDuty: stamp });
  const basicPay = basic ? Math.min(basic, gross) : gross;
  const p = build(gross, basicPay);
  const raised = build(gross * (1 + incPct / 100), basicPay * (1 + incPct / 100));
  const extraGross = raised.gross - p.gross;
  const extraNet = raised.net - p.net;
  const b = bonusTax(bSalary, bonus);
  const offerA = build(aGross, aBasic ? Math.min(aBasic, aGross) : aGross);
  const offerB = build(cGross, cBasic ? Math.min(cBasic, cGross) : cGross);
  const netGap = offerB.net - offerA.net;
  const g = gratuity(gSalary, years);

  const slices: Slice[] = [
    { label: 'Take home', value: p.net, color: 'var(--teal)' },
    { label: 'Income tax', value: p.apit, color: 'var(--coral)' },
    { label: 'Employee EPF', value: p.epfEmployee, color: 'var(--blue)' },
    { label: 'Stamp duty and other', value: p.stamp + p.otherDeductions, color: 'var(--gold)' },
  ];

  return (
    <div className="panel">
      <div className="tabs" role="tablist" aria-label="Calculators">
        {TABS.map((t) => (
          <button key={t.id} id={`tab-${t.id}`} role="tab" aria-selected={tab === t.id} aria-controls="tabpanel"
            className={tab === t.id ? 'on' : ''}
            onClick={(e) => { setTab(t.id); e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="body" id="tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {(tab === 'salary' || tab === 'increment') && (
          <div className="inputs">
            {tab === 'salary' ? (
              <>
                <Segmented label="Which amount do you know?" value={mode} onChange={setMode}
                  options={[{ value: 'gross', label: 'I know my gross' }, { value: 'net', label: 'I know my take home' }]} />
                <AmountField label={mode === 'gross' ? 'Monthly gross salary' : 'Monthly take home'} value={salary}
                  onChange={setSalary} max={1000000} presets={[100000, 150000, 200000, 300000, 500000]} />
                <details className="adv">
                  <summary>Allowances and deductions</summary>
                  <AmountField label="Basic salary" value={basic} onChange={setBasic} max={1000000} />
                  <p className="hint">
                    {basic
                      ? `Allowances are ${rs(p.allowances)}, which is your gross minus basic.`
                      : 'Leave empty to treat your whole gross as basic salary.'}
                  </p>
                  <AmountField label="Other deductions" value={other} onChange={setOther} max={100000} step={1000} />
                  <Switch checked={stamp} onChange={setStamp}>Stamp duty of Rs. 25</Switch>
                  <p className="hint">EPF and ETF are worked out on your basic salary. Income tax is worked out on your gross salary.</p>
                </details>
              </>
            ) : (
              <>
                <p className="hint">Using your gross of {rs(gross)} from the Take home pay tab.</p>
                <RangeField label="Pay rise" value={incPct} onChange={setIncPct} max={50} step={0.5} suffix="%" />
              </>
            )}
          </div>
        )}

        {tab === 'salary' && (
          <div className="results">
            <div className="hero-res">
              <Donut slices={slices} total={p.gross} center={`${p.gross ? Math.round((p.net / p.gross) * 100) : 0}%`} caption="kept" />
              <div>
                <span className="kicker">Your take home each month</span>
                <div className="big" aria-live="polite">{rs(p.net)}</div>
                <Legend slices={slices} fmt={fmt} />
              </div>
            </div>
            <div className="stats">
              <Stat label="Take home each year" value={rs(p.net * 12)} tone="teal" />
              <Stat label="Tax each year" value={rs(p.apit * 12)} tone="coral" />
              <Stat label="Employer pays on top" value={rs(p.epfEmployer + p.etfEmployer)} tone="blue" />
              <Stat label="Employer ETF each month (3%)" value={rs(p.etfEmployer)} tone="gold" />
            </div>
            <BandScale taxable={p.gross} />
            <Payslip p={p} />
            <button className="btn-line" onClick={() => window.print()}>Print payslip</button>
          </div>
        )}

        {tab === 'increment' && (
          <div className="results">
            <span className="kicker">Extra take home each month</span>
            <div className="big">{rs(extraNet)}</div>
            <div className="bars" role="img" aria-label={`You keep ${extraGross ? Math.round((extraNet / extraGross) * 100) : 0}% of the raise`}>
              <i className="keep" style={{ width: `${extraGross ? (extraNet / extraGross) * 100 : 0}%` }} />
              <i className="lost" style={{ width: `${extraGross ? 100 - (extraNet / extraGross) * 100 : 0}%` }} />
            </div>
            <p className="hint">You keep {extraGross ? Math.round((extraNet / extraGross) * 100) : 0}% of a {rs(extraGross)} raise. The rest goes to tax and EPF.</p>
            <div className="stats">
              <Stat label="New gross" value={rs(raised.gross)} tone="blue" />
              <Stat label="Extra each year" value={rs(extraNet * 12)} tone="teal" />
              <Stat label="New take home" value={rs(raised.net)} tone="gold" />
            </div>
          </div>
        )}

        {tab === 'bonus' && (
          <>
            <div className="inputs">
              <AmountField label="Monthly gross salary" value={bSalary} onChange={setBSalary} max={1000000} />
              <AmountField label="Bonus" value={bonus} onChange={setBonus} max={2000000} step={10000} />
              <p className="hint">The bonus is added to that month&apos;s pay. Tax is the extra income tax it causes, and EPF is not taken from bonuses.</p>
            </div>
            <div className="results">
              <span className="kicker">Bonus after tax</span>
              <div className="big">{rs(b.net)}</div>
              <div className="bars" role="img" aria-label={`${(b.effectiveRate * 100).toFixed(1)}% of the bonus goes to tax`}>
                <i className="keep" style={{ width: `${100 - b.effectiveRate * 100}%` }} />
                <i className="lost" style={{ width: `${b.effectiveRate * 100}%` }} />
              </div>
              <div className="stats">
                <Stat label="Tax on bonus" value={rs(b.tax)} tone="coral" />
                <Stat label="Effective rate" value={`${(b.effectiveRate * 100).toFixed(1)}%`} tone="gold" />
                <Stat label="Monthly pay that month" value={rs(bSalary + bonus)} tone="blue" />
              </div>
            </div>
          </>
        )}

        {tab === 'gratuity' && (
          <>
            <div className="inputs">
              <AmountField label="Last monthly salary (basic plus cost of living allowance)" value={gSalary} onChange={setGSalary} max={1000000} />
              <RangeField label="Years of service" value={years} onChange={setYears} max={40} step={0.5} suffix="years" />
              <p className="hint">Under the Payment of Gratuity Act you earn half a month's salary for each completed year, once you have worked {GRATUITY_MIN_YEARS} years.</p>
            </div>
            <div className="results">
              <span className="kicker">{g.eligible ? 'Your gratuity' : 'Not eligible yet'}</span>
              <div className="big">{g.eligible ? rs(g.amount) : rs(0)}</div>
              <div className="meter" role="img" aria-label={`${g.completed} of ${GRATUITY_MIN_YEARS} years needed`}>
                <i style={{ width: `${Math.min(years / GRATUITY_MIN_YEARS, 1) * 100}%` }} />
              </div>
              <p className="hint">
                {g.eligible
                  ? `Based on ${g.completed} completed years.`
                  : `You need ${GRATUITY_MIN_YEARS} completed years. You have ${g.completed}.`}
              </p>
              <div className="stats">
                <Stat label="Completed years" value={String(g.completed)} tone="blue" />
                <Stat label="Pay per year of service" value={rs(gSalary / 2)} tone="teal" />
              </div>
            </div>
          </>
        )}

        {tab === 'compare' && (
          <>
            <div className="inputs">
              <h3 className="offer-h"><i className="dot-a" />Offer A</h3>
              <AmountField label="Monthly gross salary" value={aGross} onChange={setAGross} max={1000000} />
              <AmountField label="Basic salary (optional)" value={aBasic} onChange={setABasic} max={1000000} slider={false} />
              <h3 className="offer-h"><i className="dot-b" />Offer B</h3>
              <AmountField label="Monthly gross salary" value={cGross} onChange={setCGross} max={1000000} />
              <AmountField label="Basic salary (optional)" value={cBasic} onChange={setCBasic} max={1000000} slider={false} />
              <p className="hint">Leave basic empty to treat the whole gross as basic. Stamp duty of Rs. 25 is included for both offers.</p>
            </div>
            <div className="results">
              <span className="kicker">
                {netGap === 0 ? 'Both offers take home the same each month' : `Offer ${netGap > 0 ? 'B' : 'A'} takes home more each month`}
              </span>
              <div className="big" aria-live="polite">{netGap === 0 ? rs(0) : `+ ${rs(Math.abs(netGap))}`}</div>
              <p className="hint">
                {netGap === 0 ? 'No difference in take home pay.' : `That is ${rs(Math.abs(netGap) * 12)} more every year.`}
              </p>
              <div className="cmp" role="table" aria-label="Offer A compared with offer B">
                <div className="cmp-row cmp-head" role="row">
                  <span role="columnheader" />
                  <b role="columnheader"><i className="dot-a" />A</b>
                  <b role="columnheader"><i className="dot-b" />B</b>
                </div>
                {([
                  ['Gross salary', offerA.gross, offerB.gross, true],
                  ['Income tax (APIT)', offerA.apit, offerB.apit, false],
                  ['Employee EPF (8%)', offerA.epfEmployee, offerB.epfEmployee, null],
                  ['Take home each month', offerA.net, offerB.net, true],
                  ['Take home each year', offerA.net * 12, offerB.net * 12, true],
                  ['Employer EPF and ETF', offerA.epfEmployer + offerA.etfEmployer, offerB.epfEmployer + offerB.etfEmployer, true],
                ] as [string, number, number, boolean | null][]).map(([label, a, c, higherIsBetter], i) => (
                  <div key={label} className={`cmp-row${i === 3 ? ' cmp-key' : ''}`} role="row">
                    <span role="rowheader">{label}</span>
                    <b role="cell" className={higherIsBetter !== null && a !== c && (a > c) === higherIsBetter ? 'win' : ''}>{fmt(a)}</b>
                    <b role="cell" className={higherIsBetter !== null && a !== c && (c > a) === higherIsBetter ? 'win' : ''}>{fmt(c)}</b>
                  </div>
                ))}
              </div>
              <p className="hint">Green marks the better figure for you. Employee EPF is not marked because it is savings you keep, not a cost.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
