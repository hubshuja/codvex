import { IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsIn } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty({ message: 'Project title is required' })
  title: string;

  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsOptional()
  live_url?: string;

  @IsOptional()
  github_url?: string;

  @IsOptional()
  tech_stack?: string;

  @IsOptional()
  @IsIn(['web', 'mobile', 'api'])
  category?: string;

  @IsOptional()
  is_featured?: boolean;

  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class UpdateProjectDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  live_url?: string;

  @IsOptional()
  github_url?: string;

  @IsOptional()
  tech_stack?: string;

  @IsOptional()
  @IsIn(['web', 'mobile', 'api'])
  category?: string;

  @IsOptional()
  is_featured?: boolean;

  @IsOptional()
  @IsNumber()
  sort_order?: number;
}