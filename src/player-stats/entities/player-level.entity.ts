import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity('player_levels')
export class PlayerLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  player_id: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  xp: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToOne(() => Player, player => player.level)
  @JoinColumn({ name: 'player_id' })
  player: Player;
}
