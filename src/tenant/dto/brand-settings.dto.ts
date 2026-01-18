import { IsNotEmpty, IsOptional } from 'class-validator';

export class BrandSettingsDto {
  @IsNotEmpty()
  industry: string;

  @IsNotEmpty()
  targetAudience?: string;

  @IsNotEmpty()
  offerings: string;

  @IsNotEmpty()
  archetype: string;

  @IsNotEmpty()
  tone: string;

  @IsOptional()
  defaultLanguage: string;

  @IsNotEmpty()
  exemplar: string;

  @IsNotEmpty()
  forbiddenKeywords: string[];
}







