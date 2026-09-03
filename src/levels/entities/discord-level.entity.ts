import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('discord_levels')
@Index(['discordId'], { unique: true })
export class DiscordLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 255 })
  discordId: string;

  @Column('bigint', { default: 0 })
  xp: number;

  @Column('int', { default: 0 })
  level: number;

  @Column('bigint', { default: 0 })
  messages: number;

  @Column('bigint', { nullable: true })
  lastXpAt: number; // timestamp en ms

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
