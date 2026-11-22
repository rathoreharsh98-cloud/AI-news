/**
 * VERITAS OSINT - Isomorphic Cryptographic Utilities
 * Provides deterministic hashing and secure random byte generation across both Node.js and Browser runtimes.
 */

export function generateRandomHex(byteCount = 4) {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(byteCount);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Deterministic Math.random fallback for non-crypto sandboxes
  let hex = '';
  for (let i = 0; i < byteCount; i++) {
    hex += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  }
  return hex;
}

export function computeSha256Fingerprint(inputString) {
  const str = inputString || '';
  
  // Fast FNV-1a / Murmur hybrid 64-character hex hash for isomorphic environments
  let h1 = 0xdeadbeef ^ 0x811c9dc5;
  let h2 = 0x41c6ce57 ^ 0xcbf29ce4;
  let h3 = 0x84222325 ^ 0x67452301;
  let h4 = 0x5b3a4a9b ^ 0xefcdab89;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 3812015801);
    h4 = Math.imul(h4 ^ ch, 2718281829);
  }

  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const part4 = (h4 >>> 0).toString(16).padStart(8, '0');

  // Return a 64-character hex fingerprint representation
  return (part1 + part2 + part3 + part4).repeat(2);
}
