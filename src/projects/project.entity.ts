import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  live_url: string;

  @Column({ nullable: true })
  github_url: string;

  @Column({ nullable: true })
  tech_stack: string;   // comma separated: Laravel,Node.js,MySQL

  @Column({ default: 'web' })
  category: string;    // web, mobile, api

  @Column({ default: true })
  is_featured: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;
}