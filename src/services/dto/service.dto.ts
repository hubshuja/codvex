import { IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty({ message: 'Service title is required' })
  title: string;

  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsOptional()
  icon?: string;

  @IsOptional()
  price_from?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateServiceDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  icon?: string;

  @IsOptional()
  price_from?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}