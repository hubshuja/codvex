import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
  ) {}

  // Generate slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Public — get all published blogs
  async findAll(page = 1, perPage = 6, category = '') {
    const skip = (page - 1) * perPage;

    const query = this.blogRepository
      .createQueryBuilder('blog')
      .where('blog.status = :status', { status: 'published' })
      .orderBy('blog.created_at', 'DESC')
      .skip(skip)
      .take(perPage);

    if (category) {
      query.andWhere('blog.category = :category', { category });
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

  // Public — get recent blogs
  async findRecent(limit = 3) {
    const blogs = await this.blogRepository.find({
      where: { status: 'published' },
      order: { created_at: 'DESC' },
      take: limit,
    });
    return { success: true, data: blogs };
  }

  // Public — get single blog by slug
  async findBySlug(slug: string) {
    const blog = await this.blogRepository.findOne({
      where: { slug, status: 'published' }
    });
    if (!blog) throw new NotFoundException('Blog post not found');

    // Increment views
    blog.views += 1;
    await this.blogRepository.save(blog);

    return { success: true, data: blog };
  }

  // Public — get all categories
  async getCategories() {
    const blogs = await this.blogRepository
      .createQueryBuilder('blog')
      .select('DISTINCT blog.category', 'category')
      .where('blog.status = :status', { status: 'published' })
      .andWhere('blog.category IS NOT NULL')
      .getRawMany();

    return { success: true, data: blogs.map(b => b.category) };
  }

  // Admin — get all blogs including drafts
  async findAllAdmin(page = 1, perPage = 10) {
    const skip = (page - 1) * perPage;

    const [data, total] = await this.blogRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip,
      take: perPage,
    });

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

  // Admin — create blog
  async create(dto: CreateBlogDto, imageFilename?: string) {
    // Generate unique slug
    let slug = this.generateSlug(dto.title);
    const existing = await this.blogRepository.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const blog     = this.blogRepository.create();
    blog.title     = dto.title;
    blog.slug      = slug;
    blog.content   = dto.content;
    blog.excerpt   = dto.excerpt || dto.content.substring(0, 150) + '...';
    blog.category  = dto.category || null;
    blog.tags      = dto.tags || null;
    blog.status    = dto.status || 'draft';
    blog.image     = imageFilename
      ? `uploads/blog/${imageFilename}`
      : null;

    const saved = await this.blogRepository.save(blog);
    return { success: true, message: 'Blog post created successfully', data: saved };
  }

  // Admin — update blog
  async update(id: number, dto: UpdateBlogDto, imageFilename?: string) {
    const blog = await this.blogRepository.findOne({ where: { id } });
    if (!blog) throw new NotFoundException('Blog post not found');

    // Update slug if title changed
    if (dto.title && dto.title !== blog.title) {
      blog.slug = this.generateSlug(dto.title);
    }

    Object.assign(blog, dto);

    if (imageFilename) {
      if (blog.image && existsSync(blog.image)) {
        unlinkSync(blog.image);
      }
      blog.image = `uploads/blog/${imageFilename}`;
    }

    const saved = await this.blogRepository.save(blog);
    return { success: true, message: 'Blog post updated successfully', data: saved };
  }

  // Admin — delete blog
  async remove(id: number) {
    const blog = await this.blogRepository.findOne({ where: { id } });
    if (!blog) throw new NotFoundException('Blog post not found');

    if (blog.image && existsSync(blog.image)) {
      unlinkSync(blog.image);
    }

    await this.blogRepository.remove(blog);
    return { success: true, message: 'Blog post deleted successfully' };
  }
}