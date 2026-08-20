import { minecraftPing } from '../minecraft/minecraft-ping';

async function test() {
  try {
    const status = await minecraftPing(
      'play.dreamsgamers.net',
      25565,
    );

    console.log('Servidor online');
    console.log('Online:', status.online);
    console.log('Latency:', status.latency);

    console.log('Version:', status.status.version);
    console.log('Players:', status.status.players);
    console.log('Description:', status.status.description);

  } catch (error) {
    console.error('Error haciendo ping:', error);
  }
}

test();