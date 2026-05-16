import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const blogImageStorage = diskStorage({
  destination: './uploads/blog',
  filename: (req, file, cb) => {
    cb(null, uuidv4() + extname(file.originalname));
  }
});

@Controller('api/blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  // ✅ Public routes
  @Get()
  findAll(
    @Query('page')     page     = '1',
    @Query('perPage')  perPage  = '6',
    @Query('category') category = '',
  ) {
    return this.blogService.findAll(+page, +perPage, category);
  }

  @Get('recent')
  findRecent(@Query('limit') limit = '3') {
    return this.blogService.findRecent(+limit);
  }

  @Get('categories')
  getCategories() {
    return this.blogService.getCategories();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // 🔒 Admin only routes
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  findAllAdmin(
    @Query('page')    page    = '1',
    @Query('perPage') perPage = '10',
  ) {
    return this.blogService.findAllAdmin(+page, +perPage);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: blogImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  create(
    @Body() dto: CreateBlogDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.blogService.create(dto, file?.filename);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: blogImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.blogService.update(id, dto, file?.filename);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.remove(id);
  }
}