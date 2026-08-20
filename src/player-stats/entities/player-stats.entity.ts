import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity('player_stats')
export class PlayerStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  player_id: number;

  @Column({ type: 'int', default: 0 })
  blocks_mined: number;

  @Column({ type: 'int', default: 0 })
  blocks_placed: number;

  @Column({ type: 'int', default: 0 })
  mobs_killed: number;

  @Column({ type: 'int', default: 0 })
  players_killed: number;

  @Column({ type: 'int', default: 0 })
  deaths: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  last_updated: Date;

  @OneToOne(() => Player, player => player.stats)
  @JoinColumn({ name: 'player_id' })
  player: Player;
}
