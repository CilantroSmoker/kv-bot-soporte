export interface MinecraftVersion {
  name: string;
  protocol: number;
}


export interface MinecraftPlayers {
  online: number;
  max: number;
  sample?: Array<{
    id: string;
    name: string;
  }>;
}


export interface MinecraftDescription {
  text?: string;
  extra?: unknown[];
  [key: string]: unknown;
}


export interface MinecraftStatus {
  version: MinecraftVersion;
  players: MinecraftPlayers;
  description?: string | MinecraftDescription;
  favicon?: string;
  enforcesSecureChat?: boolean;
  previewsChat?: boolean;
}


export interface MinecraftPingResult {
  online: boolean;
  latency: number;
  status: MinecraftStatus;
}

export interface BedrockPingResult {
  online: boolean;
  latency: number;
  players: number;
  maxPlayers: number;
}