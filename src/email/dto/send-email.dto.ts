import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class SendEmailDto {
  @IsNotEmpty()
  socialPageId: string; // Gmail account to send from

  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  body: string;

  @IsEmail()
  @IsOptional()
  cc?: string;

  @IsEmail()
  @IsOptional()
  bcc?: string;
}






