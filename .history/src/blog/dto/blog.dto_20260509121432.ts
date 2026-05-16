import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsOptional()
  excerpt?: string;

  @IsOptional()
  category?: string;

  @IsOptional()
  tags?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;
}

export class UpdateBlogDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  content?: string;

  @IsOptional()
  excerpt?: string;

  @IsOptional()
  category?: string;

  @IsOptional()
  tags?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;
}