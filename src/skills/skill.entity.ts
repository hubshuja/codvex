import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;       // Laravel, Node.js, React

  @Column()
  percentage: number; // 0-100

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 'backend' })
  category: string;   // backend, frontend, database, tools

  @Column({ default: 0 })
  sort_order: number;
}