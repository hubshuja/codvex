import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './testimonial.entity';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto';
import { existsSync, unlinkSync, mkdirSync } from 'fs';
import { Platform } from 'src/enums/platform.enum';
import * as path from 'path';
import * as express from 'express';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private testimonialsRepository: Repository<Testimonial>,
  ) {}

  // ensure upload directories exist
  private ensureUploadDirs() {
    ['avatars', 'screenshots'].forEach(folder => {
      const dir = path.join(__dirname, '..', '..', 'uploads', folder);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    });
  }

  // build base url from request
  private getBaseUrl(req: express.Request): string {
    return `${req.protocol}://${req.get('host')}`;
  }

  // ✅ Public — get featured testimonials
  async findFeatured(page = 1, perPage = 6) {
    const skip = (page - 1) * perPage;
    const [data, total] = await this.testimonialsRepository.findAndCount({
      where: { is_featured: 1 },
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
        hasNext:     page < Math.ceil(total / perPage),
        hasPrev:     page > 1,
      },
    };
  }

  // ✅ Public — get all testimonials
  async findAll(page = 1, perPage = 6) {
    const skip = (page - 1) * perPage;
    const [data, total] = await this.testimonialsRepository.findAndCount({
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
        hasNext:     page < Math.ceil(total / perPage),
        hasPrev:     page > 1,
      },
    };
  }

  // 🔒 Admin — create
  async create(
  dto: CreateTestimonialDto,
  avatarFilename?: string,
  screenshotFilename?: string,
) {
  this.ensureUploadDirs();

  const appUrl = process.env.APP_URL || 'https://codvex.net';

  // ✅ Exclude file fields from dto
  const { client_avatar, screen_shot, ...rest } = dto as any;

  const testimonial = this.testimonialsRepository.create();
  Object.assign(testimonial, rest);

  // override specific fields with fallbacks
  testimonial.client_title   = dto.client_title   || '';
  testimonial.client_country = dto.client_country || '';
  testimonial.rating         = dto.rating         || 5;
  testimonial.job_title      = dto.job_title      || '';
  testimonial.platform       = dto.platform       ?? Platform.UPWORK;
  testimonial.is_featured    = dto.is_featured    ? 1 : 0;

  // ✅ Only set if file uploaded, otherwise keep empty
  testimonial.client_avatar = avatarFilename
    ? `${appUrl}/uploads/avatars/${avatarFilename}`
    : '';
  testimonial.screen_shot = screenshotFilename
    ? `${appUrl}/uploads/screenshots/${screenshotFilename}`
    : '';

  const saved = await this.testimonialsRepository.save(testimonial);
  return { success: true, message: 'Testimonial created successfully', data: saved };
}
  // 🔒 Admin — update
 async update(
  id: number,
  dto: UpdateTestimonialDto,
  avatarFilename?: string,
  screenshotFilename?: string,
) {
  const testimonial = await this.testimonialsRepository.findOne({ where: { id } });
  if (!testimonial) throw new NotFoundException('Testimonial not found');
   
  // ✅ Exclude file fields from dto before assigning
  const { client_avatar, screen_shot, ...rest } = dto as any;
  Object.assign(testimonial, rest);
  const appUrl = process.env.APP_URL || 'https://codvex.net';
  if (avatarFilename) {
    if (testimonial.client_avatar) {
      const oldPath = path.join(__dirname, '..', '..', 'uploads', 'avatars', path.basename(testimonial.client_avatar));
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }
    testimonial.client_avatar = `${appUrl}/uploads/avatars/${avatarFilename}`;
  }

  if (screenshotFilename) {
    if (testimonial.screen_shot) {
      const oldPath = path.join(__dirname, '..', '..', 'uploads', 'screenshots', path.basename(testimonial.screen_shot));
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }
    testimonial.screen_shot = `${appUrl}/uploads/screenshots/${screenshotFilename}`;
  }

  const saved = await this.testimonialsRepository.save(testimonial);
  return { success: true, message: 'Testimonial updated successfully', data: saved };
}

  // 🔒 Admin — delete
  async remove(id: number) {
    const testimonial = await this.testimonialsRepository.findOne({ where: { id } });
    if (!testimonial) throw new NotFoundException('Testimonial not found');

    // delete avatar file
    if (testimonial.client_avatar) {
      const avatarPath = path.join(__dirname, '..', '..', 'uploads', 'avatars', path.basename(testimonial.client_avatar));
      if (existsSync(avatarPath)) unlinkSync(avatarPath);
    }

    // delete screenshot file
    if (testimonial.screen_shot) {
      const screenshotPath = path.join(__dirname, '..', '..', 'uploads', 'screenshots', path.basename(testimonial.screen_shot));
      if (existsSync(screenshotPath)) unlinkSync(screenshotPath);
    }

    await this.testimonialsRepository.remove(testimonial);
    return { success: true, message: 'Testimonial deleted successfully' };
  }
}