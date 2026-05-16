import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Valid email is required' })
  email: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  subject?: string;

  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}