import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type ClanMemberRole = 'leader' | 'member';

@Entity('clan_members')
export class ClanMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'clan_id', type: 'int' })
  clanId: number;

  @Column({ name: 'discord_id', length: 30, unique: true })
  discordId: string;

  @Column({ name: 'minecraft_username', length: 100 })
  minecraftUsername: string;

  @Column({
    type: 'enum',
    enum: ['leader', 'member'],
    default: 'member',
  })
  role: ClanMemberRole;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
