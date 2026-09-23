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

It's a single self-contained `index.html` — no build step, no dependencies.

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
