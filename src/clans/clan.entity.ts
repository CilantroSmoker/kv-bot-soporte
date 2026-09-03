import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('clans')
export class Clan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  requirements: string | null;

  @Column({ name: 'leader_discord_id', length: 30 })
  leaderDiscordId: string;

  @Column({ name: 'forum_thread_id', type: 'varchar', length: 30, nullable: true })
  forumThreadId: string | null;

  @Column({ name: 'max_members', type: 'int', default: 20 })
maxMembers: number;

@Column({
  name: 'member_count',
  type: 'int',
  default: 1,
})
memberCount: number;

@CreateDateColumn({ name: 'created_at' })
createdAt: Date;
}
