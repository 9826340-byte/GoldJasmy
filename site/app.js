// JASMY Gold: one saved JASMY amount -> live JASMY/USD and XAU/USD -> grams of gold, inside a dark vault.
(function () {
  'use strict';
  var REFRESH_MS = 45 * 1000;
  var TIMEOUT_MS = 8000;
  var MAX_QUOTE_AGE_MS = 15 * 60 * 1000;   // older quote time => result flagged stale
  var AWAY_MS = 60 * 1000;                  // back after this long = a new opening
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id) { return document.getElementById(id); }

  // ---------- language: Japanese device locale -> Japanese, everything else -> English ----------
  var L = {
    en: {
      gold: 'GOLD', loading: 'loading', noData: 'no live data',
      updated: function (t) { return 'updated ' + t; },
      stale: function (t) { return 'stale · updated ' + t; },
      oldJasmy: function (t) { return 'JASMY quote ' + t; },
      oldGold: function (t) { return 'gold quote ' + t; },
      title: 'How much JASMY do you hold?', hint: 'Stored only on this device.',
      error: 'Enter a positive number', cancel: 'Cancel', save: 'Save',
      edit: 'Change JASMY amount', refresh: 'Refresh'
    },
    ja: {
      gold: '純金換算', loading: '読み込み中', noData: '価格を取得できません',
      updated: function (t) { return '最終更新 ' + t; },
      stale: function (t) { return '未更新 · 最終更新 ' + t; },
      oldJasmy: function (t) { return 'JASMY価格 ' + t + '時点'; },
      oldGold: function (t) { return '金価格 ' + t + '時点'; },
      title: '保有しているJASMYの数量', hint: 'この端末にのみ保存されます。',
      error: '正の数を入力してください', cancel: 'キャンセル', save: '保存',
      edit: 'JASMYの数量を変更', refresh: '更新'
    }
  };
  var lang = (navigator.languages || [navigator.language || 'en']).some(function (l) { return /^ja/i.test(l); }) ? 'ja' : 'en';
  var T = L[lang];
  document.documentElement.lang = lang;
  $('label').textContent = T.gold;
  $('sheetTitle').textContent = T.title;
  $('hint').textContent = T.hint;
  $('cancel').textContent = T.cancel;
  $('save').textContent = T.save;
  $('holding').setAttribute('aria-label', T.edit);
  $('status').setAttribute('aria-label', T.refresh);

  // ---------- storage: the holding exists once, on this device only ----------
  // HOLDING_KEY: { amount, seen: { grams18, at } }   QUOTES_KEY: last public prices (no holding data).
  // Nothing derived from the holding (grams, USD value) is persisted.
  var HOLDING_KEY = 'jasmyGold.holding.v3';
  var QUOTES_KEY = 'jasmyGold.quotes.v3';
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }
  function save(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
  }

  // ---------- in-memory state (scoped to this closure; nothing is exposed on window) ----------
  var amount = null;                 // the user's JASMY holding; null until entered
  var seen = null;                   // { grams18, at }: last fresh value shown (previous opening)
  var quotes = load(QUOTES_KEY);     // { jasmy, gold, computedAt }: public prices only
  var last = null;                   // derived in memory: { grams2, grams18, jasmy, gold, computedAt }
  var h = load(HOLDING_KEY);
  if (h && h.amount && GoldCalc.normalizeAmount(h.amount)) { amount = h.amount; seen = h.seen || null; }

  function deriveLast() {
    if (!amount || !quotes || !quotes.jasmy || !quotes.gold) { last = null; return; }
    var r = GoldCalc.goldGrams(quotes.jasmy.price, quotes.gold.price, amount);
    last = { grams2: r.grams2, grams18: r.grams18, jasmy: quotes.jasmy, gold: quotes.gold, computedAt: quotes.computedAt };
  }
  function persistHolding() { if (amount) save(HOLDING_KEY, { amount: amount, seen: seen }); }
  deriveLast();

  var gramsEl = $('grams'), statusEl = $('statusText');

  // ---------- vault scene, laid out in real screen pixels (bigger phones get space, not bigger objects) ----------
  var W = 0, H = 0, floorY = 0, ct = 0, cw = 0, barRect = null;
  $('bar').innerHTML = VaultArt.barSVG({ id: 'app' });
  function layout() {
    if (!(innerWidth > 0 && innerHeight > 0)) return false;   // not laid out yet (hidden/zero-size window)
    W = innerWidth; H = innerHeight;
    floorY = Math.round(Math.max(H * 0.655, 420));
    ct = floorY - 4; cw = Math.min(W * 0.86, 360);
    $('vault').innerHTML = VaultArt.vaultSVG(W, H, floorY);
    $('front').innerHTML = VaultArt.cushionFrontSVG(W, H, floorY);
    var bw = 204, top = floorY + 16 - bw * 238 / 200;
    $('bar').style.top = Math.round(top) + 'px';
    barRect = { left: W / 2 - bw / 2 + bw * 8 / 200, right: W / 2 + bw / 2 - bw * 8 / 200, top: top };
    $('result').style.top = 'calc(env(safe-area-inset-top, 0px) + ' + Math.round(Math.min(Math.max(H * 0.085, 48), 84)) + 'px)';
    $('holdingRow').style.bottom = 'calc(env(safe-area-inset-bottom, 0px) + ' + Math.round(Math.max(H * 0.06, 40)) + 'px)';
    $('statusRow').style.bottom = 'calc(env(safe-area-inset-bottom, 0px) + 6px)';
    return true;
  }
  layout();
  addEventListener('resize', function () {
    // an on-screen keyboard only changes the height: keep the vault still while editing
    if ($('sheet').classList.contains('open') && W && innerWidth === W) return;
    layout();
  });

  // ---------- prices ----------
  function getJson(url) {
    var ctl = new AbortController();
    var t = setTimeout(function () { ctl.abort(); }, TIMEOUT_MS);
    return fetch(url, { cache: 'no-store', signal: ctl.signal })
      .then(function (r) { if (!r.ok) throw new Error(url + ' HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }
  function checkPrice(p) {
    p = String(p);
    if (!/^\d+(\.\d+)?$/.test(p) || !(parseFloat(p) > 0)) throw new Error('bad price ' + p);
    return p;
  }
  // JASMY/USD: Coinbase Exchange (direct USD order book, last trade); Kraken JASMY/USD as fallback.
  function fetchJasmy() {
    return getJson('https://api.exchange.coinbase.com/products/JASMY-USD/ticker').then(function (d) {
      return { price: checkPrice(d.price), time: Date.parse(d.time), source: 'coinbase', fetched: Date.now() };
    }).catch(function (err) {
      return getJson('https://api.kraken.com/0/public/Ticker?pair=JASMYUSD').then(function (d) {
        if (d.error && d.error.length) throw new Error(d.error.join(','));
        var k = Object.keys(d.result)[0];
        // Kraken ticker has no trade time; the fetch time is recorded instead.
        return { price: checkPrice(d.result[k].c[0]), time: Date.now(), source: 'kraken', fetched: Date.now(), fallbackFrom: String(err) };
      });
    });
  }
  // XAU/USD spot per troy ounce: gold-api.com (free, keyless).
  function fetchGold() {
    return getJson('https://api.gold-api.com/price/XAU').then(function (d) {
      if (d.symbol !== 'XAU' || d.currency !== 'USD') throw new Error('unexpected gold payload');
      return { price: checkPrice(d.price), time: Date.parse(d.updatedAt), source: 'gold-api.com', fetched: Date.now() };
    });
  }

  // ---------- display ----------
  function hhmm(ms) {
    var d = new Date(ms);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function showHolding() {
    if (!amount) { $('holdingText').textContent = ''; return; }
    // display only: rounded to 2 dp; calculations use the full stored amount
    var a = GoldCalc.parseDec(amount);
    var cents = a.s >= 2 ? (a.i * 2n + 10n ** BigInt(a.s - 2)) / (2n * 10n ** BigInt(a.s - 2)) : a.i * 10n ** BigInt(2 - a.s);
    var str = cents.toString().padStart(3, '0');
    $('holdingText').textContent = GoldCalc.groupThousands(str.slice(0, -2) + '.' + str.slice(-2)) + ' JASMY';
  }

  // the number changes instantly, except while coins fall (count-up); the final text is always the exact 2-dp value
  var tween = 0, tweenEnd = 0;
  function setGrams(toStr, fromNum, ms) {
    cancelAnimationFrame(tween); clearTimeout(tweenEnd);
    var to = parseFloat(toStr);
    if (reduceMotion || fromNum == null || !isFinite(fromNum) || fromNum === to || !ms) {
      gramsEl.textContent = GoldCalc.groupThousands(toStr); return;
    }
    // must not depend on animation frames (throttled in background)
    tweenEnd = setTimeout(function () { cancelAnimationFrame(tween); gramsEl.textContent = GoldCalc.groupThousands(toStr); }, ms + 80);
    var t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      gramsEl.textContent = k < 1 ? GoldCalc.groupThousands((fromNum + (to - fromNum) * e).toFixed(2)) : GoldCalc.groupThousands(toStr);
      if (k < 1) tween = requestAnimationFrame(step);
    })(t0);
  }

  function renderStatus(fresh) {
    var oldQuote = null;
    if (last) {
      var now = Date.now();
      if (now - last.jasmy.time > MAX_QUOTE_AGE_MS) oldQuote = T.oldJasmy(hhmm(last.jasmy.time));
      else if (now - last.gold.time > MAX_QUOTE_AGE_MS) oldQuote = T.oldGold(hhmm(last.gold.time));
      if (!fresh) statusEl.textContent = T.stale(hhmm(last.computedAt));
      else statusEl.textContent = T.updated(hhmm(last.computedAt)) + (oldQuote ? ' · ' + oldQuote : '');
    } else {
      statusEl.textContent = fresh === null ? (amount ? T.loading : '') : T.noData;
    }
    document.body.classList.toggle('stale', last ? (!fresh || !!oldQuote) : fresh === false);
  }

  // ---------- falling coins: 3–7, only when the gold amount increased since the previous opening ----------
  var fx = $('fx'), ctx = fx.getContext('2d');
  var coinImg = new Image();
  var coinReady = fetch('brand/jasmy-mark.png').then(function (r) { return r.blob(); }).then(function (b) {
    return new Promise(function (res, rej) { var f = new FileReader(); f.onload = function () { res(f.result); }; f.onerror = rej; f.readAsDataURL(b); });
  }).then(function (mark) {
    coinImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(VaultArt.coinSVG(mark));
    return coinImg.decode();
  });
  coinReady.catch(function () {});

  function drawCoin(x, y, rad, flip, rot, flat, alpha) {
    // flip: cos of the tumble angle; flat: 0 = falling upright, 1 = lying on the velvet
    var sx = (1 - flat) * Math.max(Math.abs(flip), .08) + flat;
    var sy = 1 - flat * .64;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot * (1 - flat));
    ctx.fillStyle = '#6E4A12';   // coin thickness
    ctx.beginPath();
    ctx.ellipse((1 - flat) * (flip >= 0 ? 1 : -1) * (1 - Math.abs(flip)) * rad * .22, flat * rad * .18, rad * sx, rad * sy, 0, 0, 7);
    ctx.fill();
    ctx.scale(sx, sy);
    ctx.drawImage(coinImg, -rad, -rad, rad * 2, rad * 2);
    ctx.restore();
  }
  function coinDrop(n, onFirstLand) {
    var dpr = devicePixelRatio || 1;
    fx.width = W * dpr; fx.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var G = 2300, coins = [], landed = false;
    var cl = W / 2 - cw / 2, cr = W / 2 + cw / 2;
    for (var i = 0; i < n; i++) {
      var left = i % 2 === 0;   // coins settle beside the bar, never behind it
      var xt = left ? cl + 30 + Math.random() * Math.max(10, barRect.left - cl - 54)
                    : barRect.right + 22 + Math.random() * Math.max(10, cr - barRect.right - 54);
      var yt = ct - 6 + Math.random() * 12;
      var x0 = xt + (Math.random() - .5) * 70, y0 = -50 - Math.random() * 60;
      var tf = Math.sqrt(2 * (yt - y0) / G);
      coins.push({ xt: xt, yt: yt, x0: x0, y0: y0, T: tf, vx: (xt - x0) / tf, rad: 19 + Math.random() * 4,
                   delay: i * .16 + Math.random() * .12, ph: Math.random() * 6, spin: 7 + Math.random() * 6,
                   rot: (Math.random() - .5) * .6, rs: (Math.random() - .5) * 2 });
    }
    coins.sort(function (a, b) { return a.yt - b.yt; });
    var t0 = performance.now();
    (function frame(now) {
      var t = (now - t0) / 1000, alive = false;
      ctx.clearRect(0, 0, W, H);
      coins.forEach(function (c) {
        var s = t - c.delay; if (s < 0) { alive = true; return; }
        var x, y, flip, flat = 0, a = 1, rot = c.rot + c.rs * Math.min(s, c.T);
        if (s < c.T) { x = c.x0 + c.vx * s; y = c.y0 + .5 * G * s * s; flip = Math.cos(c.ph + c.spin * s); }
        else {
          if (!c.hit) { c.hit = true; if (!landed) { landed = true; onFirstLand(); } }
          var u = s - c.T;
          flat = Math.min(1, u / .16);
          flip = Math.cos(c.ph + c.spin * c.T) * (1 - flat) + flat;
          x = c.xt;
          y = c.yt - (u < .22 ? Math.sin(Math.PI * u / .22) * 4 * (1 - u / .22) : 0);   // one small settle, no bounce
          if (u > 1.5) a = Math.max(0, 1 - (u - 1.5) / .7);
          if (flat > .5) {
            ctx.globalAlpha = a * .5; ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.ellipse(x, c.yt + c.rad * .3, c.rad * 1.05, c.rad * .32, 0, 0, 7); ctx.fill();
          }
        }
        if (a > 0) { alive = true; drawCoin(x, y, c.rad, flip, rot, flat, a); }
      });
      ctx.globalAlpha = 1;
      if (alive) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    })(t0);
  }
  function celebrate(fromStr, toStr, n) {
    var from = parseFloat(fromStr), done = false;
    function land() { if (!done) { done = true; setGrams(toStr, from, 1100); } }
    if (!barRect && !layout()) { land(); return; }
    gramsEl.textContent = GoldCalc.groupThousands(fromStr);
    coinReady.then(function () { coinDrop(n, land); }, function () { land(); });
    setTimeout(land, 2500);   // the new value never waits on animation frames
  }

  // ---------- refresh ----------
  var visit = true, inFlight = null;

  function onFresh() {
    var to = last.grams2;
    if (visit) {
      visit = false;
      // compare with the value seen at the previous opening (same holding; an edit resets it)
      var n = seen ? GoldCalc.coinCount(seen.grams18, last.grams18) : 0;
      if (n && !reduceMotion) celebrate(GoldCalc.round2(seen.grams18), to, n);
      else setGrams(to);
    } else setGrams(to);
    seen = { grams18: last.grams18, at: Date.now() };
    persistHolding();
  }

  function refresh() {
    if (!amount) return Promise.resolve();
    if (inFlight) return inFlight;
    var forAmount = amount;
    inFlight = Promise.all([fetchJasmy(), fetchGold()]).then(function (q) {
      if (forAmount !== amount) return;
      // Both quotes are from this refresh: compute. Never mix with an older quote.
      // The requests carry no user data; the holding is only used here, on the device.
      quotes = { jasmy: q[0], gold: q[1], computedAt: Date.now() };
      save(QUOTES_KEY, quotes);
      deriveLast();
      renderStatus(true);
      onFresh();
    }).catch(function () {
      renderStatus(false);
    }).finally(function () { inFlight = null; });
    return inFlight;
  }

  // ---------- lifecycle ----------
  var hiddenAt = 0;
  function resume() {
    if (hiddenAt && Date.now() - hiddenAt >= AWAY_MS) visit = true;
    if (last && Date.now() - last.computedAt > 2 * REFRESH_MS) renderStatus(false);
    refresh();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') hiddenAt = Date.now();
    else resume();
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) resume(); });
  setInterval(function () { if (document.visibilityState === 'visible') refresh(); }, REFRESH_MS);
  $('status').addEventListener('click', function () { refresh(); });

  // ---------- JASMY edit panel ----------
  var sheet = $('sheet'), input = $('amount'), errorEl = $('amountError');
  function openSheet() {
    input.value = amount || ''; errorEl.textContent = '';
    sheet.classList.add('open');
    setTimeout(function () { input.focus(); }, 60);
  }
  function closeSheet() { if (!amount) return; sheet.classList.remove('open'); input.blur(); }
  $('holding').addEventListener('click', openSheet);
  $('cancel').addEventListener('click', closeSheet);
  sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(); });
  $('amountForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = GoldCalc.normalizeAmount(input.value);
    if (!v) { errorEl.textContent = T.error; return; }
    var changed = v !== amount;
    amount = v;
    showHolding();
    document.body.classList.remove('first');
    if (changed) {
      // a new holding is not a market move: show the new value, no coins
      deriveLast();
      seen = last ? { grams18: last.grams18, at: Date.now() } : null;
      if (last) setGrams(last.grams2);
      visit = false;
    }
    persistHolding();
    sheet.classList.remove('open'); input.blur();
    refresh();
  });

  // ---------- start ----------
  showHolding();
  if (!amount) {
    document.body.classList.add('first');
    renderStatus(null);
    setTimeout(openSheet, reduceMotion ? 0 : 600);
  } else {
    // a stored result from an earlier session is shown as stale until the live refresh lands
    if (last) gramsEl.textContent = GoldCalc.groupThousands(last.grams2);
    renderStatus(last ? false : null);
    refresh();
  }

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
