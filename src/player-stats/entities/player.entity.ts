import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { PlayerStats } from './player-stats.entity';
import { PlayerLevel } from './player-level.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 16 })
  username: string;

  @Column({ type: 'bigint', nullable: true })
  discord_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToOne(() => PlayerStats, stats => stats.player, { cascade: true })
  stats: PlayerStats;

  @OneToOne(() => PlayerLevel, level => level.player, { cascade: true })
  level: PlayerLevel;
}
