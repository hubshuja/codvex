import { IsOptional, IsEnum } from 'class-validator';
import { Platform } from '../../enums/platform.enum';

export class CreateTestimonialDto {
  client_name:     string;
  client_title?:   string;
  client_country?: string;
  message:         string;
  job_title?:      string;
  rating?:         number;
  is_featured?:    number;

  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;
}

export class UpdateTestimonialDto {
  @IsOptional()
  client_name?: string;

  @IsOptional()
  client_title?: string;

  @IsOptional()
  client_country?: string;

  @IsOptional()
  message?: string;

  @IsOptional()
  job_title?: string;

  @IsOptional()
  rating?: number;

  @IsOptional()
  is_featured?: boolean;

  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;
}