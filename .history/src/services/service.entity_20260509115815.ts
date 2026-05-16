import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  icon: string;       // icon class name e.g. "fa-code"

  @Column({ nullable: true })
  price_from: string; // e.g. "$500"

  @Column({ default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_active: boolean;
}