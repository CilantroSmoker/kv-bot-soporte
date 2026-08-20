export interface ServerStatus {
      online: boolean;

      motd: string;

      maxPlayers: number;

      players: number;

      latency: number;

      ip: string;

      javaVersion: string;

      bedrockVersion: string;
    }