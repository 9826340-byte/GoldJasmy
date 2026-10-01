// Vault crypto: AES-256-GCM encryption of the holding record with a key derived (HKDF-SHA-256)
// from the WebAuthn PRF output of a device passkey. No key or secret is ever stored: the key
// exists only in memory, as a non-extractable CryptoKey, after a user-verified passkey assertion.
(function (root) {
  'use strict';
  var subtle = root.crypto.subtle;
  var enc = new TextEncoder(), dec = new TextDecoder();
  var HKDF_SALT = enc.encode('jasmy-gold/vault/v1');
  var AAD_PREFIX = 'jasmy-gold/vault/v1/';

  function b64u(bytes) {
    var s = '', b = new Uint8Array(bytes);
    for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unb64u(str) {
    var s = atob(String(str).replace(/-/g, '+').replace(/_/g, '/'));
    var b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
  }
  function random(n) { return root.crypto.getRandomValues(new Uint8Array(n)); }

  // authenticatorData: rpIdHash(32) | flags(1) | ...; flags bit 0x04 = User Verified
  function userVerified(authData) {
    var b = new Uint8Array(authData);
    return b.length > 32 && (b[32] & 0x04) === 0x04;
  }

  // PRF output (32 bytes) -> non-extractable AES-GCM key, bound to the credential id
  function deriveKey(prfOutput, credId) {
    var raw = new Uint8Array(prfOutput);
    if (raw.length < 32) return Promise.reject(new Error('PRF output too short'));
    return subtle.importKey('raw', raw, 'HKDF', false, ['deriveKey']).then(function (ikm) {
      return subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: HKDF_SALT, info: enc.encode(credId) },
        ikm, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }

  function seal(key, credId, record) {
    var iv = random(12);
    return subtle.encrypt({ name: 'AES-GCM', iv: iv, additionalData: enc.encode(AAD_PREFIX + credId) },
      key, enc.encode(JSON.stringify(record))).then(function (ct) {
        return { iv: b64u(iv), ct: b64u(ct) };
      });
  }
  // throws (OperationError) on a wrong key or any tampering: GCM authenticates iv, ciphertext and AAD
  function open(key, credId, box) {
    return subtle.decrypt({ name: 'AES-GCM', iv: unb64u(box.iv), additionalData: enc.encode(AAD_PREFIX + credId) },
      key, unb64u(box.ct)).then(function (pt) { return JSON.parse(dec.decode(pt)); });
  }

  var api = { b64u: b64u, unb64u: unb64u, random: random, userVerified: userVerified,
              deriveKey: deriveKey, seal: seal, open: open };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GoldVault = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
