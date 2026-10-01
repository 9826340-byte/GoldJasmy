// node test-vault.js — vault crypto: round trip, wrong key, tampering, credential binding, UV flag.
const assert = require('assert');
const V = require('./vault.js');

(async () => {
  const prfA = V.random(32), prfB = V.random(32);
  const record = { amount: '1234567.89012345', seenGrams18: '55.884170354490713800', seenAt: 1790000000000 };

  const kA = await V.deriveKey(prfA, 'cred-1');
  const box = await V.seal(kA, 'cred-1', record);
  assert.ok(!JSON.stringify(box).includes('1234567'), 'ciphertext must not contain the amount');
  assert.deepStrictEqual(await V.open(kA, 'cred-1', box), record);

  // same PRF output + credential -> same key (deterministic derivation)
  assert.deepStrictEqual(await V.open(await V.deriveKey(prfA, 'cred-1'), 'cred-1', box), record);

  // fresh IV each time
  const box2 = await V.seal(kA, 'cred-1', record);
  assert.notStrictEqual(box.iv, box2.iv); assert.notStrictEqual(box.ct, box2.ct);

  // wrong PRF output, other credential, tampered ciphertext / iv -> rejected
  await assert.rejects(V.open(await V.deriveKey(prfB, 'cred-1'), 'cred-1', box));
  await assert.rejects(V.open(await V.deriveKey(prfA, 'cred-2'), 'cred-2', box));
  await assert.rejects(V.open(kA, 'cred-2', box));                         // AAD binds the credential id
  const ct = V.unb64u(box.ct); ct[0] ^= 1;
  await assert.rejects(V.open(kA, 'cred-1', { iv: box.iv, ct: V.b64u(ct) }));
  const iv = V.unb64u(box.iv); iv[0] ^= 1;
  await assert.rejects(V.open(kA, 'cred-1', { iv: V.b64u(iv), ct: box.ct }));
  await assert.rejects(V.deriveKey(V.random(16), 'cred-1'));                // short PRF output

  // the key cannot be exported
  await assert.rejects(globalThis.crypto.subtle.exportKey('raw', kA));

  // UV flag (byte 32, bit 0x04)
  const ad = new Uint8Array(37); ad[32] = 0x05; assert.strictEqual(V.userVerified(ad), true);
  ad[32] = 0x01; assert.strictEqual(V.userVerified(ad), false);
  assert.strictEqual(V.userVerified(new Uint8Array(10)), false);

  assert.strictEqual(V.b64u(V.unb64u('AQID_-8')), 'AQID_-8');
  console.log('all vault tests passed');
})().catch(e => { console.error(e); process.exit(1); });
