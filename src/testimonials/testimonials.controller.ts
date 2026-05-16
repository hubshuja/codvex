import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const avatarStorage = diskStorage({
  destination: './uploads/avatars',
  filename: (req, file, cb) => {
    cb(null, uuidv4() + extname(file.originalname));
  }
});

@Controller('api/testimonials')
export class TestimonialsController {
  constructor(private testimonialsService: TestimonialsService) {}

  // ✅ Public routes
  @Get('featured')
  findFeatured() {
    return this.testimonialsService.findFeatured();
  }

  @Get()
  findAll(
    @Query('page')    page    = '1',
    @Query('perPage') perPage = '6',
  ) {
    return this.testimonialsService.findAll(+page, +perPage);
  }

  // 🔒 Admin only routes
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('client_avatar', {
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  create(
    @Body() dto: CreateTestimonialDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.testimonialsService.create(dto, file?.filename);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('client_avatar', {
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestimonialDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.testimonialsService.update(id, dto, file?.filename);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testimonialsService.remove(id);
  }
}