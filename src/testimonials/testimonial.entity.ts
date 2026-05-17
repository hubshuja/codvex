import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  client_name: string;

  @Column({ nullable: true })
  client_title: string;   // e.g. "CEO at TechCorp"

  @Column({ nullable: true })
  client_country: string;

  @Column({ nullable: true })
  client_avatar: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text' })
  job_title: string;

   @Column({ type: 'text' })
  screen_shot: string;

  @Column({ default: 5 })
  rating: number;         // 1-5

  @Column({ default: true })
  is_featured: boolean;

  @CreateDateColumn()
  created_at: Date;
}