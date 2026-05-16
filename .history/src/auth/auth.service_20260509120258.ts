import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersRepository.findOne({
      where: { email: dto.email }
    });
    if (exists) throw new ConflictException('Email already registered');

    const user = this.usersRepository.create();
    user.name     = dto.name;
    user.email    = dto.email;
    user.password = bcrypt.hashSync(dto.password, 10);

    const saved = await this.usersRepository.save(user);
    const token = this.jwtService.sign({ id: saved.id, email: saved.email });

    return {
      success: true,
      message: 'Registered successfully',
      token,
      user: { id: saved.id, name: saved.name, email: saved.email }
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'name', 'email', 'password'],
    });

    if (!user || !bcrypt.compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return {
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    };
  }
}