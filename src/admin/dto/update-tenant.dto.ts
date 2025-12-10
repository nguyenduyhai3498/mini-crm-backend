import { IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  maxSocialPages?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}






