import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface LeaderboardEntry {
  playerName: string;
  playerID: string;
  position: number;
  score: number;
  board: string;
  type: string;
}

@Injectable()
export class LeaderboardsReaderService {
  private dockerId: string;

  constructor(private configService: ConfigService) {
    this.dockerId = this.configService.get('MINECRAFT_DOCKER_ID') || '7e4300ac-ae78-455b-afd7-9afade5665b1';
  }

  async getLeaderboard(type: string, period: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const boardName = this.getBoardName(type);
      const latestFile = await this.getLatestFile(boardName, period);
      
      if (!latestFile) {
        return [];
      }

      const command = `docker exec ${this.dockerId} cat /home/container/plugins/ajLeaderboards/past-resets/${period}/${latestFile}`;
      const { stdout } = await execAsync(command);
      
      const data = JSON.parse(stdout);
      return data.entries.slice(0, limit) || [];
    } catch (error) {
      console.error('Error reading leaderboard:', error);
      return [];
    }
  }

  private getBoardName(type: string): string {
    const boardMap: Record<string, string> = {
      kills: 'statistic_player_kills',
      time: 'statistic_time_played',
      money: 'vault_eco_balance_commas',
    };
    return boardMap[type] || type;
  }

  private async getLatestFile(boardName: string, period: string): Promise<string | null> {
  try {
    const command = `docker exec ${this.dockerId} sh -c 'ls -t /home/container/plugins/ajLeaderboards/past-resets/${period}/${boardName}_${period}_*.json 2>/dev/null | head -1'`;
    const { stdout } = await execAsync(command);
    const path = stdout.trim();

    return path ? path.split('/').pop() ?? null : null;
  } catch (error) {
    console.error('Error getting latest file:', error);
    return null;
  }
 }
}
