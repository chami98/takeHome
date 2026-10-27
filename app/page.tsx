import Calculator from '@/components/Calculator';
import { BANDS, RELIEF } from '@/lib/calc';

const f = (n: number) => n.toLocaleString('en-US');

function rows() {
  let lo = RELIEF;
  return BANDS.map(({ width, rate }) => {
    const label = width === Infinity ? `Above ${f(lo)}` : `${f(lo + 1)} to ${f((lo += width))}`;
    return { label, rate };
  });
}

const FAQ = [
  ['How much salary is tax-free?', 'Up to Rs. 150,000 a month. Income tax starts on the amount above that.'],
  ['How much EPF is taken from my pay?', 'You pay 8% of your basic salary and your employer adds 12%. Your employer also pays 3% into ETF. You pay nothing towards ETF.'],
  ['What is the difference between basic, gross and take-home?', 'Gross is basic salary plus allowances. Take-home is gross minus income tax, your EPF, stamp duty and any other deductions.'],
  ['Is my data sent anywhere?', 'No. Every calculation runs in your browser, and nothing you type leaves your device.'],
];

export default function Home() {
  return (
    <>
      <section className="hero" id="top">
        <div className="wrap">
          <h1>See what you really take home</h1>
          <p>Enter your salary and get your payslip for 2026/27: income tax, EPF, ETF and stamp duty worked out for you.</p>
        </div>
      </section>

      <main className="wrap">
        <Calculator />

        <section className="bands" id="bands">
          <div>
            <h2>How income tax is worked out</h2>
            <p>Each rate applies only to the part of your pay inside that band. The first Rs. 150,000 a month is covered by your personal relief.</p>
          </div>
          <table>
            <thead><tr><th>Monthly taxable income (Rs.)</th><th>Rate</th></tr></thead>
            <tbody>
              <tr><td>Up to {f(RELIEF)}</td><td>0%</td></tr>
              {rows().map((r) => <tr key={r.label}><td>{r.label}</td><td>{Math.round(r.rate * 100)}%</td></tr>)}
            </tbody>
          </table>
        </section>

        <section className="faq" id="faq">
          <h2>Common questions</h2>
          {FAQ.map(([q, a]) => (
            <details key={q} className="acc"><summary>{q}</summary><p>{a}</p></details>
          ))}
        </section>
      </main>
    </>
  );
}
