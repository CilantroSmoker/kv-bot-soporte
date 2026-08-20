import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type TicketType = 'soporte' | 'apelacion' | 'postulacion';
export type TicketStatus = 'open' | 'closed';
export type Platform = 'Java' | 'Bedrock' | null;
export type Device = 'Consola' | 'PC' | 'Móvil' | null;

@Entity('tickets')
export class Ticket {
  @PrimaryColumn()
  ticket_id: string;
  
  @Column()
  ticket_number: number;
  
  @Column()
  type: TicketType;
  
  @Column()
  user_id: string;
  
  @Column()
  guild_id: string;
  
  @Column()
  channel_id: string;
  
  @Column({ nullable: true })
  subject: string;
  
  @Column({ type: 'text', nullable: true })
  appeal_reason: string;

  // ✨ ESPECIFICAR TIPO DE COLUMNA
  @Column({ type: 'varchar', length: 50, nullable: true })
  minecraft_username: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  platform: Platform;

  @Column({ type: 'varchar', length: 20, nullable: true })
  device: Device;

  @Column({ default: 'open' })
  status: TicketStatus;
  
  @Column({ nullable: true })
  claimed_by: string;
  
  @Column({ nullable: true })
  closed_by: string;
  
  @Column({ nullable: true })
  closed_at: Date;
  
  @Column({ nullable: true })
  log_message_id: string;
  
  @CreateDateColumn()
  created_at: Date;
}