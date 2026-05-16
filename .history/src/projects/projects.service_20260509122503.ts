import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  // Public — get all featured projects
  async findFeatured() {
    const projects = await this.projectsRepository.find({
      where: { is_featured: true },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
    return { success: true, data: projects };
  }

  // Public — get all projects with filter
  async findAll(page = 1, perPage = 9, category = '') {
    const skip = (page - 1) * perPage;

    const query = this.projectsRepository
      .createQueryBuilder('project')
      .orderBy('project.sort_order', 'ASC')
      .skip(skip)
      .take(perPage);

    if (category) {
      query.where('project.category = :category', { category });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      success: true,
      data,
      pagination: {
        total,
        perPage,
        currentPage: page,
        totalPages: Math.ceil(total / perPage),
        hasNext: page < Math.ceil(total / perPage),
        hasPrev: page > 1,
      }
    };
  }

  // Public — get single project
  async findOne(id: number) {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return { success: true, data: project };
  }

  // Admin — create project
  async create(dto: CreateProjectDto, imageFilename?: string) {
    const project = this.projectsRepository.create();
    project.title       = dto.title;
    project.description = dto.description;
    project.live_url    = dto.live_url || '';;
    project.github_url  = dto.github_url || ''  ;
    project.tech_stack  = dto.tech_stack || '';
    project.category    = dto.category || 'web';
    project.is_featured = dto.is_featured ?? false;
    project.sort_order  = dto.sort_order || 0;
    project.image       = imageFilename || '';
      ? `uploads/projects/${imageFilename}`
      : null;

    const saved = await this.projectsRepository.save(project);
    return { success: true, message: 'Project created successfully', data: saved };
  }

  // Admin — update project
  async update(id: number, dto: UpdateProjectDto, imageFilename?: string) {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    Object.assign(project, dto);

    if (imageFilename) {
      // Delete old image
      if (project.image && existsSync(project.image)) {
        unlinkSync(project.image);
      }
      project.image = `uploads/projects/${imageFilename}`;
    }

    const saved = await this.projectsRepository.save(project);
    return { success: true, message: 'Project updated successfully', data: saved };
  }

  // Admin — delete project
  async remove(id: number) {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    // Delete image file
    if (project.image && existsSync(project.image)) {
      unlinkSync(project.image);
    }

    await this.projectsRepository.remove(project);
    return { success: true, message: 'Project deleted successfully' };
  }
}