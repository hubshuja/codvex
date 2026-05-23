import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Platform } from '../enums/platform.enum';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  client_name: string;

  @Column({ nullable: true })
  client_title: string;

  @Column({ nullable: true })
  client_country: string;

  @Column({ nullable: true })
  client_avatar: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  job_title: string;

  @Column({ type: 'text', nullable: true })
  screen_shot: string;

  @Column({ default: 5 })
  rating: number;

  @Column({ type: 'enum', enum: Platform, nullable: true })
  platform: Platform;

  @Column({ type: 'tinyint', default: 0 })  // ✅ added @Column
  is_featured: number;

  @CreateDateColumn()
  created_at: Date;
}