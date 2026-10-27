import { fmt, type payslip } from '@/lib/calc';
import { SITE_NAME } from '@/lib/site';

type Slip = ReturnType<typeof payslip>;

const month = new Intl.DateTimeFormat('en-LK', { month: 'long', year: 'numeric' }).format(new Date());

function Line({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <li className={muted ? 'muted' : undefined}>
      <span>{label}</span>
      <b>{fmt(value)}</b>
    </li>
  );
}

export function Payslip({ p }: { p: Slip }) {
  const kept = p.gross ? Math.round((p.net / p.gross) * 100) : 0;
  return (
    <section className="slip printable" aria-label="Payslip">
      <header className="slip-head">
        <div>
          <span className="slip-brand">{SITE_NAME}</span>
          <h3>Payslip</h3>
        </div>
        <div className="slip-period"><span>Pay period</span><b>{month}</b></div>
      </header>

      <div className="slip-net">
        <div>
          <span>Take home pay</span>
          <b>Rs. {fmt(p.net)}</b>
        </div>
        <div className="slip-kept">{kept}% of gross</div>
      </div>

      <div className="slip-cols">
        <div className="slip-card">
          <h4><i style={{ background: 'var(--teal)' }} />Earnings</h4>
          <ul>
            <Line label="Basic salary" value={p.basic} />
            <Line label="Allowances" value={p.allowances} />
          </ul>
          <div className="slip-sum"><span>Gross earnings</span><b>{fmt(p.gross)}</b></div>
        </div>
        <div className="slip-card">
          <h4><i style={{ background: 'var(--coral)' }} />Deductions</h4>
          <ul>
            <Line label="Income tax (APIT)" value={p.apit} />
            <Line label="Employee EPF (8%)" value={p.epfEmployee} />
            <Line label="Stamp duty" value={p.stamp} />
            <Line label="Other deductions" value={p.otherDeductions} />
          </ul>
          <div className="slip-sum"><span>Total deductions</span><b>{fmt(p.totalDeductions)}</b></div>
        </div>
      </div>

      <div className="slip-card slip-emp">
        <h4><i style={{ background: 'var(--blue)' }} />Employer contributions <small>paid on top, not deducted from you</small></h4>
        <ul>
          <Line label="Employer EPF (12%)" value={p.epfEmployer} />
          <Line label="Employer ETF (3%)" value={p.etfEmployer} />
        </ul>
        <div className="slip-sum"><span>Total employer contributions</span><b>{fmt(p.epfEmployer + p.etfEmployer)}</b></div>
      </div>
    </section>
  );
}
