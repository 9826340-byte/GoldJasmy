// Exact decimal arithmetic for the JASMY -> gold grams calculation.
// All inputs are decimal strings; intermediate values are never rounded.
(function (root) {
  'use strict';

  var GRAMS_PER_TROY_OUNCE = '31.1034768';

  // "123.456" | "6.05e-3" -> { i: BigInt mantissa, s: decimal scale }
  function parseDec(str) {
    var m = /^\s*(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?\s*$/.exec(String(str));
    if (!m) throw new Error('not a positive decimal: ' + str);
    var frac = m[2] || '';
    var i = BigInt(m[1] + frac);
    var s = frac.length - (m[3] ? parseInt(m[3], 10) : 0);
    if (s < 0) { i *= 10n ** BigInt(-s); s = 0; }
    return { i: i, s: s };
  }

  // exact n/d rounded half-up to `places` decimals, as a plain string
  function divRound(n, d, places) {
    var scaled = n * 10n ** BigInt(places);
    var q = (2n * scaled + d) / (2n * d);
    var str = q.toString().padStart(places + 1, '0');
    return places ? str.slice(0, -places) + '.' + str.slice(-places) : str;
  }

  // grams = amount * jasmyUsd / (xauUsdPerOz / 31.1034768)
  //       = amount * jasmyUsd * 31.1034768 / xauUsdPerOz
  function goldGrams(jasmyUsd, xauUsdPerOz, amount) {
    var a = parseDec(amount);
    var j = parseDec(jasmyUsd);
    var k = parseDec(GRAMS_PER_TROY_OUNCE);
    var x = parseDec(xauUsdPerOz);
    if (j.i === 0n || x.i === 0n) throw new Error('zero price');
    var n = a.i * j.i * k.i * 10n ** BigInt(x.s);
    var d = x.i * 10n ** BigInt(a.s + j.s + k.s);
    return {
      grams2: divRound(n, d, 2),             // display value
      grams18: divRound(n, d, 18),           // internal record
      portfolioUsd: divRound(a.i * j.i, 10n ** BigInt(a.s + j.s), 18)
    };
  }

  // user input "1 234 567,891" -> "1234567.891"; null if not a positive decimal (max 18 dp)
  function normalizeAmount(str) {
    var v = String(str).replace(/[\s  ']/g, '').replace(',', '.');
    if (!/^\d{1,15}(\.\d{1,18})?$/.test(v)) return null;
    v = v.replace(/^0+(?=\d)/, '');
    if (v.indexOf('.') >= 0) v = v.replace(/0+$/, '').replace(/\.$/, '');
    return /[1-9]/.test(v) ? v : null;
  }

  // signed difference a - b of two 18-dp strings, rounded half-up to 2 dp: "+0.84", "-0.31", "0.00"
  function diff2(a18, b18) {
    function to18(s) { var p = parseDec(s); return p.i * 10n ** BigInt(18 - p.s); }
    var d = to18(a18) - to18(b18), neg = d < 0n;
    if (neg) d = -d;
    var unit = 10n ** 16n;
    var str = ((2n * d + unit) / (2n * unit)).toString().padStart(3, '0');
    str = str.slice(0, -2) + '.' + str.slice(-2);
    return str === '0.00' ? str : (neg ? '-' : '+') + str;
  }

  // exact decimal string -> 2 dp, half-up (display of a stored 18-dp value)
  function round2(s) {
    var p = parseDec(s);
    return divRound(p.i, 10n ** BigInt(p.s), 2);
  }

  // coins to drop when the gold value rose from prev18 to next18 (as displayed, >= 0.01 g): 3..7; otherwise 0
  function coinCount(prev18, next18) {
    var d = diff2(next18, prev18);
    if (d.charAt(0) !== '+') return 0;
    var rel = parseFloat(d) / Math.max(parseFloat(prev18), 1e-9);
    return Math.max(3, Math.min(7, 3 + Math.round(rel * 400)));
  }

  function groupThousands(s) {
    var parts = s.split('.');
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1] ? '.' + parts[1] : '');
  }

  var api = { GRAMS_PER_TROY_OUNCE: GRAMS_PER_TROY_OUNCE,
              parseDec: parseDec, goldGrams: goldGrams, groupThousands: groupThousands,
              normalizeAmount: normalizeAmount, diff2: diff2, round2: round2, coinCount: coinCount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GoldCalc = api;
})(this);
