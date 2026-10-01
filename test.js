// node test.js — checks calc.js against values computed independently with .NET System.Decimal
// ($usd = amount * jasmy; $g = $usd / (xau / 31.1034768)), using a neutral sample holding.
const assert = require('assert');
const C = require('./site/calc.js');
const AMOUNT = '1234567.89012345';

const ref = [
  // jasmyUsd, xauUsd/oz, portfolio USD (.NET), grams (.NET), expected display
  ['0.00605',      '4157.100098', '7469.1357352468725',       '55.884170354490713799576158296',  '55.88'],
  ['0.006',        '4000',        '7407.40734074070',         '57.599030592719514316439999999',  '57.60'],
  ['1',            '2000',        '1234567.89012345',         '19199.67686423983810548',         '19199.68'],
  ['0.0123456789', '3333.33',     '15241.578751714595060205', '142.21996954976791007085431708',  '142.22'],
  ['0.00000001',   '5000',        '0.0123456789012345',       '0.00007679870745695935242192',    '0.00'],
  ['0.05',         '2650.5',      '61728.3945061725',         '724.37943271985806849575551784',  '724.38'],
];
const trim = s => s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
for (const [j, x, usd, g, disp] of ref) {
  const r = C.goldGrams(j, x, AMOUNT);
  assert.strictEqual(r.grams2, disp, `display ${j}/${x}`);
  // exact result agrees with the 28-digit .NET result (only .NET's own rounding differs)
  assert.ok(Math.abs(Number(r.grams18) - Number(g)) <= Math.max(1e-15, Number(g) * 1e-15), `grams ${j}/${x}: ${r.grams18} vs ${g}`);
  assert.strictEqual(trim(r.portfolioUsd), trim(usd), `usd ${j}`);
}

// half-up at the 2nd decimal, decided on the exact value
assert.strictEqual(C.goldGrams('1', '31.1034768', '1.005').grams2, '1.01');
assert.strictEqual(C.goldGrams('1', '31.1034768', '1.00499999999999').grams2, '1.00');
assert.throws(() => C.goldGrams('0.006', '4000'));          // no built-in holding
assert.throws(() => C.goldGrams('-1', '4000', AMOUNT));
assert.throws(() => C.goldGrams('0', '4000', AMOUNT));
assert.throws(() => C.goldGrams('abc', '4000', AMOUNT));

assert.strictEqual(C.groupThousands('25439.00'), '25,439.00');
assert.strictEqual(C.groupThousands('74.04'), '74.04');
assert.deepStrictEqual(C.parseDec('6.05e-3'), C.parseDec('0.00605'));

// holding editor input
assert.strictEqual(C.normalizeAmount('1 234 567,89012345'), '1234567.89012345');
assert.strictEqual(C.normalizeAmount('2000000'), '2000000');
assert.strictEqual(C.normalizeAmount('007.500'), '7.5');
for (const bad of ['', '0', '0.000', '-5', '1.2.3', 'abc', '1e5', '1,000,000'])
  assert.strictEqual(C.normalizeAmount(bad), null, bad);

// change since last visit
assert.strictEqual(C.diff2('72.935921080064040181', '72.100000000000000000'), '+0.84');
assert.strictEqual(C.diff2('72.1', '72.41'), '-0.31');
assert.strictEqual(C.diff2('72.1049', '72.1'), '0.00');
assert.strictEqual(C.diff2('72.105', '72.1'), '+0.01');
assert.strictEqual(C.diff2('55.884170354490713800', '0'), '+55.88');

// display rounding of a stored value
assert.strictEqual(C.round2('55.884170354490713800'), '55.88');
assert.strictEqual(C.round2('72.105'), '72.11');
assert.strictEqual(C.round2('72.104999999999999999'), '72.10');

// falling coins: only for an increase that shows (>= 0.01 g), 3..7 coins
assert.strictEqual(C.coinCount('128.350000000000000000', '128.350000000000000000'), 0);   // unchanged
assert.strictEqual(C.coinCount('128.350000000000000000', '128.354000000000000000'), 0);   // +0.004 g: not visible
assert.strictEqual(C.coinCount('128.350000000000000000', '128.100000000000000000'), 0);   // decreased
assert.strictEqual(C.coinCount('128.350000000000000000', '128.360000000000000000'), 3);   // +0.01 g
assert.strictEqual(C.coinCount('128.350000000000000000', '128.850000000000000000'), 5);   // +0.39 %
assert.strictEqual(C.coinCount('128.350000000000000000', '140.000000000000000000'), 7);   // large rise: capped
for (let i = 0; i < 200; i++) {
  const a = (Math.random() * 500).toFixed(18), b = (Math.random() * 500).toFixed(18), n = C.coinCount(a, b);
  assert.ok(n === 0 || (n >= 3 && n <= 7));
  if (parseFloat(b) <= parseFloat(a)) assert.strictEqual(n, 0);
}

console.log('all calculation tests passed');
