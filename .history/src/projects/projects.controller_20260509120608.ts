import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const imageStorage = diskStorage({
  destination: './uploads/projects',
  filename: (req, file, cb) => {
    cb(null, uuidv4() + extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Images only!'), false);
};

@Controller('api/projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  // ✅ Public routes
  @Get('featured')
  findFeatured() {
    return this.projectsService.findFeatured();
  }

  @Get()
  findAll(
    @Query('page')     page     = '1',
    @Query('perPage')  perPage  = '9',
    @Query('category') category = '',
  ) {
    return this.projectsService.findAll(+page, +perPage, category);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  // 🔒 Admin only routes
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  }))
  create(
    @Body() dto: CreateProjectDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.projectsService.create(dto, file?.filename);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.projectsService.update(id, dto, file?.filename);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }
}