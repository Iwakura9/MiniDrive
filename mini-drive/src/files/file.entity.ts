import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
@Entity('files') @Index(['ownerId', 'name'], { unique: true })
export class StoredFile { @PrimaryColumn('uuid') id: string; @Column() ownerId: number; @Column() name: string; @Column() storedName: string; @Column() mimeType: string; @Column('integer') size: number; @CreateDateColumn() createdAt: Date; @UpdateDateColumn() updatedAt: Date; }
