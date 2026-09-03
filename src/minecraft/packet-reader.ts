import { MinecraftStatus } from './types';
import { readVarInt } from './varint';


export function readStatusResponse(
  buffer: Buffer,
): MinecraftStatus {

  let offset = 0;

  const packetLength = readVarInt(buffer, offset);
  offset += packetLength.bytesRead;


  const packetId = readVarInt(buffer, offset);
  offset += packetId.bytesRead;


  if (packetId.value !== 0x00) {
    throw new Error(
      `Unexpected packet id: ${packetId.value}`,
    );
  }


  const jsonLength = readVarInt(buffer, offset);
  offset += jsonLength.bytesRead;


  const json = buffer
    .subarray(offset, offset + jsonLength.value)
    .toString('utf8');


  return JSON.parse(json);
}



export function readPong(buffer: Buffer): bigint {

  let offset = 0;

  const packetLength = readVarInt(buffer, offset);
  offset += packetLength.bytesRead;


  const packetId = readVarInt(buffer, offset);
  offset += packetId.bytesRead;


  if (packetId.value !== 0x01) {
    throw new Error(
      `Unexpected packet id: ${packetId.value}`,
    );
  }


  return buffer.readBigInt64BE(offset);
}