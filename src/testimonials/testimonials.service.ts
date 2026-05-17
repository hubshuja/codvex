import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './testimonial.entity';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private testimonialsRepository: Repository<Testimonial>,
  ) {}

  // Public — get featured testimonials
  async findFeatured() {
    const testimonials = await this.testimonialsRepository.find({
      where: { is_featured: true },
      order: { created_at: 'DESC' },
    });
    return { success: true, data: testimonials };
  }

  // Public — get all testimonials
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
        hasNext: page < Math.ceil(total / perPage),
        hasPrev: page > 1,
      }
    };
  }

  // Admin — create
  async create(dto: CreateTestimonialDto, avatarFilename?: string, screenshotFilename?: string) {
    const testimonial        = this.testimonialsRepository.create();
    testimonial.client_name    = dto.client_name;
    testimonial.client_title   = dto.client_title || '';
    testimonial.client_country = dto.client_country || '';
    testimonial.message        = dto.message;
    testimonial.rating         = dto.rating || 5;
    testimonial.job_title      = dto.job_title;
    testimonial.screen_shot    = screenshotFilename
      ? `uploads/screenshots/${screenshotFilename}`
      : '';
    testimonial.is_featured    = dto.is_featured ?? false;
    testimonial.client_avatar  = avatarFilename
      ? `uploads/avatars/${avatarFilename}`
      : '';

    const saved = await this.testimonialsRepository.save(testimonial);
    return { success: true, message: 'Testimonial created successfully', data: saved };
  }

  // Admin — update
  async update(id: number, dto: UpdateTestimonialDto, avatarFilename?: string, screenshotFilename?: string) {
    const testimonial = await this.testimonialsRepository.findOne({ where: { id } });
    if (!testimonial) throw new NotFoundException('Testimonial not found');

    Object.assign(testimonial, dto);

    if (avatarFilename) {
      if (testimonial.client_avatar && existsSync(testimonial.client_avatar)) {
        unlinkSync(testimonial.client_avatar);
      }
      testimonial.client_avatar = `uploads/avatars/${avatarFilename}`;
    }

    const saved = await this.testimonialsRepository.save(testimonial);
    return { success: true, message: 'Testimonial updated successfully', data: saved };
  }

  // Admin — delete
  async remove(id: number) {
    const testimonial = await this.testimonialsRepository.findOne({ where: { id } });
    if (!testimonial) throw new NotFoundException('Testimonial not found');

    if (testimonial.client_avatar && existsSync(testimonial.client_avatar)) {
      unlinkSync(testimonial.client_avatar);
    }

    await this.testimonialsRepository.remove(testimonial);
    return { success: true, message: 'Testimonial deleted successfully' };
  }
}