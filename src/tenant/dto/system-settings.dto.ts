import { IsNotEmpty, IsOptional } from 'class-validator';

export class SystemSettingsDto {
  @IsNotEmpty()
  language: string;

  @IsNotEmpty()
  timezone: string;

  @IsOptional()
  businessName: string;

  @IsOptional()
  dateFormat: string;

  @IsOptional()
  currency: string;
}







