import {
  Controller, Get, Post, Delete, Patch,
  Body, Param, Query, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/contact.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  // ✅ Public — submit contact form
  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  // 🔒 Admin only routes
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page')    page    = '1',
    @Query('perPage') perPage = '10',
    @Query('status')  status  = '',
  ) {
    return this.contactService.findAll(+page, +perPage, status);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.markAsRead(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.remove(id);
  }
}