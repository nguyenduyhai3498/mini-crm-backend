import { IsNotEmpty } from 'class-validator';

export class SystemSettingsDto {
  @IsNotEmpty()
  language: string;

  @IsNotEmpty()
  timezone: string;
}







