import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  excerpt: string;    // short summary

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  category: string;   // Laravel, Node.js, Career

  @Column({ nullable: true })
  tags: string;       // comma separated

  @Column({ default: 'published' })
  status: string;     // draft, published

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}