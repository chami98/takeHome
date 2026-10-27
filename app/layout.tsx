import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';
import { Newsreader, Instrument_Sans } from 'next/font/google';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

const serif = Newsreader({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });
const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: `${SITE_NAME} – Sri Lanka Salary & Take home Calculator 2026/27`,
  description: 'Convert gross salary to net take home in Sri Lanka: APIT, EPF, ETF, stamp duty, payslip, bonus tax, gratuity and increment calculators.',
};

// Runs before paint so the saved theme (dark by default) is applied without a flash.
const themeScript = `try{var t=localStorage.getItem('theme')||'dark';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="top">
          <strong className="logo">{SITE_NAME}</strong>
          <nav className="nav" aria-label="Main">
            <a href="#top">Calculator</a>
            <a href="#bands">Tax bands</a>
            <a href="#faq">Questions</a>
          </nav>
          <span className="privacy">Nothing you type leaves this device</span>
          <ThemeToggle />
        </header>
        {children}
        <footer>Estimates only – verify with the Inland Revenue Department and your payroll team. Built by Chamikara Mendis.</footer>
      </body>
    </html>
  );
}
