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
  Category and (when recognizable) Destination are auto-filled via client-side
  OCR, for review before submitting — Business Unit and Project are always
  chosen by the person

It's a single self-contained `index.html` — no build step, no bundled
dependencies. (Receipt scanning is the one exception: it loads the
[Tesseract.js](https://github.com/naptha/tesseract.js) OCR engine from a CDN,
but only the moment someone actually uploads a receipt — an internet
connection is needed for that one action, nothing else.)

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
