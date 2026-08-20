import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../entities/player.entity';
import { PlayerStats } from '../entities/player-stats.entity';
import { PlayerLevel } from '../entities/player-level.entity';

@Injectable()
export class PlayerStatsService {
  constructor(
    @InjectRepository(Player)
    private playerRepo: Repository<Player>,
    @InjectRepository(PlayerStats)
    private statsRepo: Repository<PlayerStats>,
    @InjectRepository(PlayerLevel)
    private levelRepo: Repository<PlayerLevel>,
  ) {}

  async getPlayerStats(username: string) {
    const player = await this.playerRepo.findOne({
      where: { username },
      relations: ['stats', 'level'],
    });

    if (!player || !player.stats) {
      return null;
    }

    return {
      username: player.username,
      blocks_mined: player.stats.blocks_mined,
      blocks_placed: player.stats.blocks_placed,
      mobs_killed: player.stats.mobs_killed,
      players_killed: player.stats.players_killed,
      deaths: player.stats.deaths,
      level: player.level?.level || 1,
      xp: player.level?.xp || 0,
    };
  }

  async getTopPlayers(statType: string, limit: number = 10) {
    const query = this.statsRepo
      .createQueryBuilder('ps')
      .leftJoinAndSelect('ps.player', 'p')
      .orderBy(`ps.${statType}`, 'DESC')
      .take(limit);

    const results = await query.getMany();

    return results.map((item, index) => ({
      position: index + 1,
      username: item.player.username,
      value: item[statType],
    }));
  }
}
