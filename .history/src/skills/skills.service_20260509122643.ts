import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './skill.entity';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
  ) {}

  // Public — get all skills grouped by category
  async findAll() {
    const skills = await this.skillsRepository.find({
      order: { category: 'ASC', sort_order: 'ASC' },
    });

    // Group by category
    const grouped = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    return { success: true, data: skills, grouped };
  }

  // Public — get by category
  async findByCategory(category: string) {
    const skills = await this.skillsRepository.find({
      where: { category },
      order: { sort_order: 'ASC' },
    });
    return { success: true, data: skills };
  }

  // Admin — create
  async create(dto: CreateSkillDto) {
    const skill = this.skillsRepository.create();
    skill.name       = dto.name;
    skill.percentage = dto.percentage;
    skill.icon       = dto.icon || '';
    skill.category   = dto.category || 'backend';
    skill.sort_order = dto.sort_order || 0;

    const saved = await this.skillsRepository.save(skill);
    return { success: true, message: 'Skill created successfully', data: saved };
  }

  // Admin — update
  async update(id: number, dto: UpdateSkillDto) {
    const skill = await this.skillsRepository.findOne({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');

    Object.assign(skill, dto);
    const saved = await this.skillsRepository.save(skill);
    return { success: true, message: 'Skill updated successfully', data: saved };
  }

  // Admin — delete
  async remove(id: number) {
    const skill = await this.skillsRepository.findOne({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');

    await this.skillsRepository.remove(skill);
    return { success: true, message: 'Skill deleted successfully' };
  }
}