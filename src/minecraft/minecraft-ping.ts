import * as net from 'net';

import {
  MinecraftPingResult,
  MinecraftStatus,
} from './types';

import {
  buildHandshakePacket,
  buildPingPacket,
  buildStatusRequestPacket,
} from './packet-builder';

import {
  readPong,
  readStatusResponse,
} from './packet-reader';

import { readVarInt } from './varint';


export async function minecraftPing(
  host: string,
  port: number,
  timeout = 5000,
): Promise<MinecraftPingResult> {

  return new Promise((resolve, reject) => {

    let startTime = 0;
    let latency = 0;

    const socket = net.createConnection({
      host,
      port,
    });

    let buffer = Buffer.alloc(0);
    let status: MinecraftStatus | null = null;
    let waitingForPong = false;

    socket.setTimeout(timeout);


    socket.on('connect', () => {

      startTime = Date.now();

      socket.write(
        buildHandshakePacket(
          host,
          port,
        ),
      );

      socket.write(
        buildStatusRequestPacket(),
      );

    });


    socket.on('data', (chunk) => {

      buffer = Buffer.concat([
        buffer,
        chunk,
      ]);


      while (true) {

        try {

          const length = readVarInt(buffer);


          if (
            buffer.length <
            length.bytesRead + length.value
          ) {
            return;
          }


          const packetSize =
            length.bytesRead + length.value;


          const packet =
            buffer.subarray(
              0,
              packetSize,
            );


          buffer =
            buffer.subarray(packetSize);



          if (!waitingForPong) {

            status =
              readStatusResponse(packet);


            socket.write(
              buildPingPacket(),
            );


            waitingForPong = true;


          } else {

            readPong(packet);


            latency =
              Date.now() - startTime;


            socket.end();


            resolve({
              online: true,
              latency,
              status: status!,
            });


            return;
          }


        } catch {

          return;

        }

      }

    });



    socket.on('timeout', () => {

      socket.destroy();

      reject(
        new Error(
          'Minecraft ping timeout',
        ),
      );

    });



    socket.on('error', (error) => {

      socket.destroy();

      reject(error);

    });



    socket.on('close', () => {

      if (!status) {

        reject(
          new Error(
            'Connection closed before receiving status.',
          ),
        );

      }

    });

  });

}