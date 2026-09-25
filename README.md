# Expense360 Console

A working demo of **Expense360 — Intelligent Expense & Budget Optimization
Platform** (see `Expense360_Project_Proposal_Group_8.pdf`), covering the
MVP1/MVP2 scope from the proposal:

- AI-style per-diem recommendations by destination, with confidence scores
  and rationale, and a human-in-the-loop Approve / Reject / Override flow
- Budget utilization tracking and proactive alerts by Business Unit
- Expense transactions with client-side anomaly detection (z-score outliers)
- A simple linear-regression spend forecast vs. budget
- A full audit log of every decision and acknowledgement
- A role switcher (Finance/BU Leader vs. Employee) that changes what's visible
- A Project Master list for tracking each project's budget by Business Unit / Department
- A Login Settings screen for sign-in defaults and a directory of named users allowed to sign in per role
- Receipt scanning on both expense forms: upload a photo and Amount, Date,
  Category, Bill/Invoice No. and (when recognizable) Destination and Location
  are auto-filled via client-side OCR, for review before submitting —
  Business Unit and Project are always chosen by the person
- Multi-language bills: pick the bill's language and the OCR text is
  translated to English before fields are extracted
- Itemized bills: when a receipt has multiple line items, each detected item
  (description, amount, category) is listed for review, and can be bulk-added
  as separate expenses sharing the same Business Unit / Project / Destination
  / Date
- A left-hand navigation sidebar, and a Light / Dark / Auto theme toggle in
  the top bar (the choice is remembered per browser)
- A name-based sign-in screen: pick or type your name (auto-matched against
  the Login Directory for its role), sign in, and sign out from the top bar.
  No password — it's a demo — and enforcement of the Login Directory is
  optional (the "require known user" setting under Login Settings). "New
  here? Create an account" on the same screen self-registers a name/role/
  Business Unit into the Login Directory and signs straight in.
- A Policy Assistant chat, open to both roles: keyword-matched Q&A over a
  small T&E policy knowledge base, plus two live lookups — per-diem for a
  named destination, and budget/spend for a named Business Unit — read
  straight from current app state. Not a general AI chat; it says so. The
  Destination field on both expense forms also shows a live one-line policy
  hint (current per-diem, and the pending range if one's under review).
- Multi-currency expenses: pick a currency (USD, EUR, GBP, INR, JPY, SGD,
  AED) per expense; live FX rates load in the background (falling back to
  fixed approximate rates offline) and everything that aggregates spend —
  budgets, alerts, forecasts, the recommendation engine — converts to USD
  first so mixed-currency data stays comparable. Receipt scanning also
  detects the currency symbol on the bill.
- Mileage as a 6th expense category: enter a distance in miles and the
  amount is computed at a fixed per-mile rate, in whichever currency is
  selected.
- Receipt duplicate detection: submitting an expense that closely matches
  one already on file (same Business Unit, destination, category, amount
  within ~2%, date within 2 days) asks for confirmation before it's added.
- CSV export on Transactions and the Audit Log, and a Print/PDF button
  (via the browser's native print-to-PDF) that hides everything but the
  current report.
- Approval delegation: a Finance user assigned to a Business Unit in the
  Login Directory can only acknowledge that BU's alerts; a directory entry
  with no Business Unit (or an unrecognized name) is senior/global Finance
  and can act on anything. Expenses at or above a configurable USD
  threshold (Login Settings) need a senior Finance "Confirm" in
  Transactions before they're fully approved.
- An Action Digest tab: everything currently awaiting the signed-in
  Finance user's action — pending per-diem recommendations, alerts they're
  delegated to acknowledge, and expenses needing their second approval —
  in one place, with the same approve/reject/override/acknowledge/confirm
  actions available inline.

It's a single self-contained `index.html` — no build step, no bundled
dependencies. Three features load an external service only the moment
they're actually used: receipt scanning loads the
[Tesseract.js](https://github.com/naptha/tesseract.js) OCR engine from a CDN,
translating a non-English bill calls the free
[MyMemory](https://mymemory.translated.net/) translation API, and
multi-currency support fetches live FX rates from
[open.er-api.com](https://www.exchangerate-api.com/docs/free) (falling back
to fixed rates if that fails). None need an API key, all are demo-grade
free services rather than production-quality, and none of them are needed
for the rest of the app to work.

## Run it

Just open `index.html` in a browser. There's no server-side code; state
persists to `localStorage` in that browser.

(This same file is also published as a hosted, multi-user version — see the
project owner for the link — where it persists to a shared backend instead
of `localStorage`, so changes are visible to everyone who opens it.)

## Notes

- The recommendation engine is a transparent, rule-based heuristic for this
  demo, not a trained ML model.
- Sample data (Business Units, destinations, ~450 seeded transactions) loads
  automatically on first run.
- The per-diem recommendations and budget/anomaly alerts aren't static: every
  time a new expense is logged, the engine re-ingests that destination's
  actual lodging spend, re-blends it with the destination's hotel-rate trend,
  and recomputes the recommended range, confidence score and rationale for
  any per-diem still pending a Finance decision — plus re-scans all Business
  Units for projected budget overruns, per-diem deviations and spend
  anomalies. A per-diem already Approved/Rejected/Overridden is a recorded
  human decision and is left untouched by this refresh.
