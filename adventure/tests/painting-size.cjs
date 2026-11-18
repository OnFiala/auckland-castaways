'use strict';
const assert = require('node:assert/strict');

// The painted stage uses RGB WebP. Alpha-bearing sprite sheets can also use VP8X.
module.exports = function webpSize(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  switch (bytes.toString('ascii', 12, 16)) {
    case 'VP8 ': return [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
    case 'VP8X': return [1 + bytes.readUIntLE(24, 3), 1 + bytes.readUIntLE(27, 3)];
    case 'VP8L': {
      const bits = bytes.readUInt32LE(21);
      return [1 + (bits & 0x3fff), 1 + ((bits >>> 14) & 0x3fff)];
    }
    default: throw new Error('Unknown WebP header');
  }
};
