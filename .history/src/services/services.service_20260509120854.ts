import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  // Public — get all active services
  async findAll() {
    const services = await this.servicesRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
    return { success: true, data: services };
  }

  // Public — get single service
  async findOne(id: number) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return { success: true, data: service };
  }

  // Admin — get all including inactive
  async findAllAdmin() {
    const services = await this.servicesRepository.find({
      order: { sort_order: 'ASC' },
    });
    return { success: true, data: services };
  }

  // Admin — create
  async create(dto: CreateServiceDto) {
    const service = this.servicesRepository.create();
    service.title       = dto.title;
    service.description = dto.description;
    service.icon        = dto.icon || 'fa-code';
    service.price_from  = dto.price_from || null;
    service.sort_order  = dto.sort_order || 0;
    service.is_active   = dto.is_active ?? true;

    const saved = await this.servicesRepository.save(service);
    return { success: true, message: 'Service created successfully', data: saved };
  }

  // Admin — update
  async update(id: number, dto: UpdateServiceDto) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');

    Object.assign(service, dto);
    const saved = await this.servicesRepository.save(service);
    return { success: true, message: 'Service updated successfully', data: saved };
  }

  // Admin — delete
  async remove(id: number) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');

    await this.servicesRepository.remove(service);
    return { success: true, message: 'Service deleted successfully' };
  }
}