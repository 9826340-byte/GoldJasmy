# JASMY Gold

How many grams of gold is your JASMY worth — right now.

A tiny web app for iPhone and Android. Open it, enter how much JASMY you hold once, and it shows
the gold equivalent in grams, updated live. When your gold has grown since your last visit,
coins fall into the bar.

**Open:** https://9826340-byte.github.io/GoldJasmy/
Install: iPhone — Safari → Share → *Add to Home Screen*. Android — Chrome → menu → *Install app*.

## Privacy
- Your JASMY amount is stored **only on your device** (browser storage). No account, no server,
  no analytics, no cookies.
- The app only requests public prices directly from the sources below.

## How it is calculated
```
grams = JASMY amount × JASMY/USD × 31.1034768 / XAU/USD (per troy ounce)
```
Exact decimal arithmetic (no floating-point rounding); only the displayed value is rounded to 2 decimals.

| Price | Source |
|---|---|
| JASMY/USD | Coinbase Exchange `JASMY-USD` last trade (fallback: Kraken `JASMYUSD`) |
| Gold XAU/USD spot | gold-api.com |

- Refreshes every 45 s and immediately when you return to the app; tap the bottom line to refresh.
- A value is only computed from two quotes fetched together. If a source fails, the last value stays
  visible, dimmed and marked **stale** — an old price is never silently mixed in.
- If a quote's own timestamp is older than 15 minutes (e.g. gold on weekends), the value is dimmed
  and the quote time is shown.

Languages: English, 日本語 (follows the phone language).

## Disclaimer
Not affiliated with Jasmy Inc. The JASMY mark belongs to its owner and is used only to identify
the token. Not financial advice.

## Development
No build step — static files.
- `node test.js` — calculation tests (checked against independent .NET decimal results)
- `node dev-server.js` — local preview at http://localhost:8731
- `make-icons.html` (via the dev server) — re-renders the icons from the vector bar in `art.js`
