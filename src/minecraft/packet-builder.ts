import { writeVarInt } from './varint';

export function buildHandshakePacket(
  host: string,
  port: number,
  protocolVersion = -1,
): Buffer {
  const hostBuffer = Buffer.from(host, 'utf8');

  const packetData = Buffer.concat([
    writeVarInt(0x00), // Packet ID (Handshake)
    writeVarInt(protocolVersion),
    writeVarInt(hostBuffer.length),
    hostBuffer,
    Buffer.from([
      (port >> 8) & 0xff,
      port & 0xff,
    ]),
    writeVarInt(0x01), // Next State = Status
  ]);

  return Buffer.concat([
    writeVarInt(packetData.length),
    packetData,
  ]);
}

export function buildStatusRequestPacket(): Buffer {
  const packetData = writeVarInt(0x00);

  return Buffer.concat([
    writeVarInt(packetData.length),
    packetData,
  ]);
}

export function buildPingPacket(payload = BigInt(Date.now())): Buffer {
  const payloadBuffer = Buffer.alloc(8);

  payloadBuffer.writeBigInt64BE(payload);

  const packetData = Buffer.concat([
    writeVarInt(0x01),
    payloadBuffer,
  ]);

  return Buffer.concat([
    writeVarInt(packetData.length),
    packetData,
  ]);
}