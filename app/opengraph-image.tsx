import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const alt = `${SITE_NAME}: Sri Lanka salary and take home calculator`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CHIPS = ['APIT', 'EPF', 'ETF', 'Stamp duty', 'Bonus tax', 'Gratuity', 'Offer compare'];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #060B24 0%, #0B1647 55%, #2340B5 140%)',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: '#F5B73B', marginRight: 18 }} />
          {SITE_NAME}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, display: 'flex' }}>
            What will you actually
          </div>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: '#F5B73B', display: 'flex' }}>
            take home?
          </div>
          <div style={{ fontSize: 32, color: '#C9D3FF', marginTop: 28, display: 'flex' }}>
            Sri Lanka salary calculator for 2026/27. Private, runs in your browser.
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          {CHIPS.map((chip) => (
            <div
              key={chip}
              style={{
                display: 'flex',
                fontSize: 24,
                padding: '10px 22px',
                marginRight: 14,
                borderRadius: 999,
                border: '2px solid rgba(201,211,255,.35)',
                color: '#E8ECFA',
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
