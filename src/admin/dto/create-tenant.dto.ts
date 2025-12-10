import { IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateTenantDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  maxSocialPages?: number;
}






