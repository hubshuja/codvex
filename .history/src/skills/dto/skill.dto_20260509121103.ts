import { IsNotEmpty, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';

export class CreateSkillDto {
  @IsNotEmpty({ message: 'Skill name is required' })
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsOptional()
  icon?: string;

  @IsOptional()
  @IsIn(['backend', 'frontend', 'database', 'tools'])
  category?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class UpdateSkillDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;

  @IsOptional()
  icon?: string;

  @IsOptional()
  @IsIn(['backend', 'frontend', 'database', 'tools'])
  category?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;
}