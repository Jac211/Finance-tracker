# FinanceTrack

A fully-featured personal finance tracker that runs in the browser with no backend required. Built with React, TypeScript, and Tailwind CSS — all data is stored locally in your browser via `localStorage`.

## Features

- **Dashboard** — At-a-glance summary of total balance, monthly income & expenses, savings rate, spending donut chart, income vs expenses bar chart, and recent transactions
- **Transactions** — Full transaction history with real-time search, filters (type, category, account, date range), add/edit/delete modals, and CSV import
- **Budgets** — Set monthly budgets per category with animated progress bars, over-budget alerts, and remaining balance tracking
- **Accounts** — Manage multiple accounts (checking, savings, credit card, cash, investment) with net worth, total assets, and liabilities summary
- **Reports** — 6-month trend charts, top spending category breakdown, category trend line selector, and budget performance analytics
- **Dark / Light mode** — Toggle between themes, persisted across sessions
- **Mobile responsive** — Works on all screen sizes with a slide-out navigation drawer

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Icons | Lucide React |
| Date handling | date-fns |
| Persistence | Browser `localStorage` |

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

The app runs at `http://localhost:5173` by default and seeds itself with 6 months of realistic sample data on first load so you can explore all features immediately.

## Project Structure

```
src/
├── components/
│   ├── Charts/       # Recharts wrappers (donut, bar, line)
│   ├── Layout/       # Sidebar and Header
│   └── UI/           # Button, Card, Modal, Badge, Toast
├── hooks/
│   ├── useLocalStorage.ts
│   └── useFinanceData.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Budgets.tsx
│   ├── Accounts.tsx
│   └── Reports.tsx
├── types/            # Shared TypeScript types & constants
└── utils/            # Formatters, calculations, sample data
```

## Data & Privacy

All data is stored exclusively in your browser's `localStorage` — nothing is ever sent to a server. Clearing your browser data will reset the app to its sample data state.
