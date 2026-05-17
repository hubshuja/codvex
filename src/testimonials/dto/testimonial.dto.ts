import { IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateTestimonialDto {
  @IsNotEmpty({ message: 'Client name is required' })
  client_name: string;

   @IsNotEmpty({ message: 'Job Title is required' })
  job_title: string;

  
  @IsOptional()
  client_title?: string;

  @IsOptional()
  client_country?: string;

  @IsOptional()
  screen_shot?: string;

  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
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
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}