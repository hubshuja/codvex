import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFiles, Req
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const fileStorage = diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'client_avatar' ? 'avatars' : 'screenshots';
    cb(null, `./uploads/${folder}`);
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + extname(file.originalname));
  },
});

const fileInterceptor = FileFieldsInterceptor(
  [
    { name: 'client_avatar', maxCount: 1 },
    { name: 'screen_shot',   maxCount: 1 },
  ],
  {
    storage: fileStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
  },
);

@Controller('api/testimonials')
export class TestimonialsController {
  constructor(private testimonialsService: TestimonialsService) {}

  // ✅ Public routes
  @Get('featured')
  findFeatured(
    @Query('page')    page    = '1',
    @Query('perPage') perPage = '6',
  ) {
    return this.testimonialsService.findFeatured(+page, +perPage);
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
  @UseInterceptors(fileInterceptor)
  create(
    @Body() dto: CreateTestimonialDto,
    @UploadedFiles() files: {
      client_avatar?: Express.Multer.File[];
      screen_shot?:   Express.Multer.File[];
    },
  ) {
    const avatar     = files?.client_avatar?.[0]?.filename;
    const screenshot = files?.screen_shot?.[0]?.filename;
    return this.testimonialsService.create(dto, avatar, screenshot);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(fileInterceptor)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestimonialDto,
    @UploadedFiles() files: {
      client_avatar?: Express.Multer.File[];
      screen_shot?:   Express.Multer.File[];
    },
  ) {
    const avatar     = files?.client_avatar?.[0]?.filename;
    const screenshot = files?.screen_shot?.[0]?.filename;
    return this.testimonialsService.update(id, dto,  avatar, screenshot);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testimonialsService.remove(id);
  }
}