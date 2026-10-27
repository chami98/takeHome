'use client';

import type { ReactNode } from 'react';

export function Segmented<T extends string>({ label, value, onChange, options }: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value}
          className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Formatted money input with a slider underneath and optional preset chips. */
export function AmountField({ label, value, onChange, max, step = 5000, presets, suffix = 'LKR' }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
  step?: number;
  presets?: number[];
  suffix?: string;
}) {
  return (
    <div className="field">
      <label>
        <span className="lbl">{label}</span>
        <span className="money">
          <input type="text" inputMode="numeric" placeholder="0"
            value={value ? value.toLocaleString('en-US') : ''}
            onChange={(e) => onChange(parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)} />
          <em>{suffix}</em>
        </span>
      </label>
      <input className="range" type="range" min={0} max={max} step={step} aria-label={`${label} slider`}
        value={Math.min(value, max)} onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--p' as string]: `${(Math.min(value, max) / max) * 100}%` }} />
      {presets && (
        <div className="chips">
          {presets.map((v) => (
            <button key={v} type="button" className={v === value ? 'on' : ''} onClick={() => onChange(v)}>
              {v >= 1000 ? `${v / 1000}k` : v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function RangeField({ label, value, onChange, min = 0, max, step = 1, suffix }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max: number; step?: number; suffix: string;
}) {
  return (
    <div className="field">
      <label>
        <span className="lbl">{label}</span>
        <span className="money small">
          <input type="number" min={min} max={max} step={step} value={value}
            onChange={(e) => onChange(Math.min(max, Math.max(min, parseFloat(e.target.value) || 0)))} />
          <em>{suffix}</em>
        </span>
      </label>
      <input className="range" type="range" min={min} max={max} step={step} aria-label={`${label} slider`}
        value={value} onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--p' as string]: `${((value - min) / (max - min)) * 100}%` }} />
    </div>
  );
}

export function Switch({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="switch">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i aria-hidden />
      <span>{children}</span>
    </label>
  );
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: 'teal' | 'coral' | 'gold' | 'blue' }) {
  return (
    <div className={`stat ${tone ?? ''}`}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export interface Slice { label: string; value: number; color: string; }

export function Donut({ slices, total, center, caption }: { slices: Slice[]; total: number; center: string; caption: string }) {
  let offset = 0;
  const label = slices.map((s) => `${s.label} ${total ? Math.round((s.value / total) * 100) : 0}%`).join(', ');
  return (
    <div className="donut">
      <svg viewBox="0 0 120 120" role="img" aria-label={label}>
        <circle cx="60" cy="60" r="48" pathLength={100} fill="none" stroke="var(--track)" strokeWidth="16" />
        {total > 0 && slices.map((s) => {
          const v = (s.value / total) * 100;
          const el = (
            <circle key={s.label} cx="60" cy="60" r="48" pathLength={100} fill="none" stroke={s.color} strokeWidth="16"
              strokeDasharray={`${Math.max(v - 0.6, 0)} ${100 - Math.max(v - 0.6, 0)}`} strokeDashoffset={-offset}
              transform="rotate(-90 60 60)" />
          );
          offset += v;
          return el;
        })}
      </svg>
      <div className="donut-c"><b>{center}</b><span>{caption}</span></div>
    </div>
  );
}

export function Legend({ slices, fmt }: { slices: Slice[]; fmt: (n: number) => string }) {
  return (
    <ul className="legend">
      {slices.map((s) => (
        <li key={s.label}><i style={{ background: s.color }} /><span>{s.label}</span><b>{fmt(s.value)}</b></li>
      ))}
    </ul>
  );
}
