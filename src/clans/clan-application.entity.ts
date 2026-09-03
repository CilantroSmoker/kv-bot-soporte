import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type ClanApplicationStatus = 'pending' | 'accepted' | 'rejected';

@Entity('clan_applications')
export class ClanApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'clan_id', type: 'int' })
  clanId: number;

  @Column({ name: 'applicant_discord_id', length: 30 })
  applicantDiscordId: string;

  @Column({ name: 'minecraft_username', length: 100 })
  minecraftUsername: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: ClanApplicationStatus;

  @Column({ name: 'processed_at', type: 'datetime', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
