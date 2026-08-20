export interface VarIntResult {
  value: number;
  bytesRead: number;
}

export function writeVarInt(value: number): Buffer {
  const bytes: number[] = [];

  let current = value >>> 0;

  while ((current & 0xffffff80) !== 0) {
    bytes.push((current & 0x7f) | 0x80);
    current >>>= 7;
  }

  bytes.push(current);

  return Buffer.from(bytes);
}

export function readVarInt(
  buffer: Buffer,
  offset = 0,
): VarIntResult {
  let value = 0;
  let position = 0;
  let currentByte: number;

  do {
    if (offset + position >= buffer.length) {
      throw new Error('Incomplete VarInt');
    }

    currentByte = buffer[offset + position];

    value |= (currentByte & 0x7f) << (7 * position);

    position++;

    if (position > 5) {
      throw new Error('VarInt is too big');
    }
  } while ((currentByte & 0x80) !== 0);

  return {
    value,
    bytesRead: position,
  };
}