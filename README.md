# JASMY Gold

How many grams of gold is your JASMY worth — right now.

Enter how much JASMY you hold once. Every time you open the app it calculates the current gold
equivalent from live prices and shows it inside a dark vault. When your gold has grown since your
previous opening, a few coins fall into the vault.

**Open:** https://goldjasmy.netlify.app
Install: iPhone — Safari → Share → *Add to Home Screen*. Android — Chrome → menu → *Install app*.

## Privacy
- Your JASMY amount is stored **only on your device** (browser storage). No account, no wallet
  connection, no server, no analytics, no cookies.
- The app only requests public prices directly from the sources below; the requests carry no user data.
- Nothing derived from your amount (gold grams, USD value) is stored.

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
- Coins fall (3–7) only when the gold amount shown has increased since your previous opening with the
  same holding. No animation when it is unchanged or lower, and none after you edit your holding.

Languages: English; Japanese on devices set to Japanese.

## Disclaimer
Not affiliated with Jasmy Inc. The JASMY mark belongs to its owner and is used only to identify
the token. Not financial advice.

## Repository
- `site/` — the app (the only folder that is published; `netlify.toml` sets it as the publish directory)
- `site/_headers` — Netlify headers: Content-Security-Policy limits network access to the three price
  sources, no referrer, no framing
- `test.js` — `node test.js`: calculation tests (checked against independent .NET decimal results),
  rounding and coin-count rules
- `tools/dev-server.js` — `node tools/dev-server.js`: local preview at http://localhost:8731 with the
  production headers
- `tools/make-icons.html` — re-renders `site/icons/` and `site/splash/` from the app icon `tools/app-icon-source.png` (cropped to its rounded square)
- `tools/ui-check.html` — runs the app with controlled prices and reports first use, persistence,
  unchanged / decreased / increased behaviour, stale handling, editing, languages and all network requests
- `tools/shot.html` — renders the app at exact phone sizes for screenshots
