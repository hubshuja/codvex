import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadedFiles } from '@nestjs/common';

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
    console.log('testimonial listing - page:', page, 'perPage:', perPage);
    return this.testimonialsService.findAll(+page, +perPage);
  }

  // 🔒 Admin only routes
  @Post()
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileFieldsInterceptor([
  { name: 'client_avatar', maxCount: 1 },
  { name: 'screen_shot', maxCount: 1 },
], {
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
}))
create(
  @Body() dto: CreateTestimonialDto,
  @UploadedFiles() files: {
    client_avatar?: Express.Multer.File[],
    screen_shot?: Express.Multer.File[],
  }
) {
  const avatar = files?.client_avatar?.[0]?.filename;
  const screenshot = files?.screen_shot?.[0]?.filename;
  return this.testimonialsService.create(dto, avatar, screenshot);
}

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'client_avatar', maxCount: 1 },
    { name: 'screen_shot', maxCount: 1 },
  ], {
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestimonialDto,
    @UploadedFiles() files: {
    client_avatar?: Express.Multer.File[],
    screen_shot?: Express.Multer.File[],
  }
) {
  const avatar = files?.client_avatar?.[0]?.filename;
  const screenshot = files?.screen_shot?.[0]?.filename;
  return this.testimonialsService.update(id, dto, avatar, screenshot);
}

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testimonialsService.remove(id);
  }
}