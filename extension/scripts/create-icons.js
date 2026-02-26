/**
 * Generates minimal placeholder PNG icons for the Chrome Extension.
 *
 * Each icon is a solid blue (#0A66C2) square at the required size.
 * We build the PNG binary manually so this script has zero dependencies
 * (no canvas, no Jimp, no sharp) — just Node.js built-ins.
 *
 * Run once: `node scripts/create-icons.js`
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZES = [16, 32, 48, 128];
const OUT_DIR = path.resolve(__dirname, '../src/assets/icons');

// MockMaster primary brand blue
const FILL_R = 0x0a; // #0A
const FILL_G = 0x66; // #66
const FILL_B = 0xc2; // #C2
const FILL_A = 0xff; // fully opaque

/**
 * Writes a 4-byte big-endian unsigned integer into a Buffer at the given offset.
 */
function writeUInt32BE(buf, value, offset) {
  buf[offset]     = (value >>> 24) & 0xff;
  buf[offset + 1] = (value >>> 16) & 0xff;
  buf[offset + 2] = (value >>> 8)  & 0xff;
  buf[offset + 3] =  value         & 0xff;
}

/**
 * Computes CRC32 for a Buffer region (standard PNG CRC).
 */
function crc32(buf) {
  // Pre-computed CRC table
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      t[i] = c;
    }
    return t;
  })());

  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Builds a valid PNG file Buffer for a solid-colour square of `size` pixels.
 */
function buildPNG(size) {
  // --- PNG signature ---
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // --- IHDR chunk (13 bytes of data) ---
  const ihdrData = Buffer.alloc(13);
  writeUInt32BE(ihdrData, size, 0); // width
  writeUInt32BE(ihdrData, size, 4); // height
  ihdrData[8]  = 8;  // bit depth
  ihdrData[9]  = 2;  // colour type: RGB (we will use RGBA -> type 6)
  ihdrData[9]  = 6;  // colour type: RGBA
  ihdrData[10] = 0;  // compression method
  ihdrData[11] = 0;  // filter method
  ihdrData[12] = 0;  // interlace method

  const ihdr = buildChunk('IHDR', ihdrData);

  // --- IDAT chunk: raw image data (deflate-compressed) ---
  // Each row has a filter byte (0 = None) followed by size * 4 RGBA bytes.
  const rawRows = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowOffset = y * (1 + size * 4);
    rawRows[rowOffset] = 0; // filter byte: None
    for (let x = 0; x < size; x++) {
      const px = rowOffset + 1 + x * 4;
      rawRows[px]     = FILL_R;
      rawRows[px + 1] = FILL_G;
      rawRows[px + 2] = FILL_B;
      rawRows[px + 3] = FILL_A;
    }
  }
  const compressed = zlib.deflateSync(rawRows, { level: 9 });
  const idat = buildChunk('IDAT', compressed);

  // --- IEND chunk (empty) ---
  const iend = buildChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

/**
 * Builds a PNG chunk: length (4B) + type (4B) + data + CRC (4B).
 */
function buildChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  writeUInt32BE(len, data.length, 0);

  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4);
  writeUInt32BE(crcBuf, crc32(crcInput), 0);

  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

for (const size of SIZES) {
  const outPath = path.join(OUT_DIR, `icon-${size}.png`);
  const png = buildPNG(size);
  fs.writeFileSync(outPath, png);
  console.log(`Created: ${outPath} (${png.length} bytes)`);
}

console.log('Icons created successfully.');
