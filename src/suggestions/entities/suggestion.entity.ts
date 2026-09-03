import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from 'typeorm';
import { SuggestionStatus } from '../suggestion-status.enum';

@Entity({ name: 'suggestions' })
@Unique(['suggestionNumber'])
export class Suggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  suggestionNumber: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar', length: 32 })
  userId: string;

  @Column({ type: 'varchar', length: 50, default: SuggestionStatus.PENDING })
  status: SuggestionStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  messageId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  threadId?: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  reviewedBy?: string;

  @Column({ type: 'text', nullable: true })
  reviewNote?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}