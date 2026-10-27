@AGENTS.md

# TakeHome

Sri Lanka salary calculator (APIT, EPF, ETF, stamp duty, payslip, bonus tax, gratuity, increment) built with Next.js App Router.

## Commands
- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm test` – run the calculation tests (`lib/calc.test.ts`)

## Layout
- `lib/calc.ts` – tax and deduction logic; keep it pure and covered by tests
- `lib/site.ts` – site name and shared constants
- `components/` – calculator UI and shared primitives
- `app/` – routes, layout and metadata

## Conventions
- Use "take home" (no hyphen) in user-facing copy.
- Update `lib/calc.test.ts` whenever calculation rules change.
