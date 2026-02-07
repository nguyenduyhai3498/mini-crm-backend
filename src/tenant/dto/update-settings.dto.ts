import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { BrandSettingsDto } from './brand-settings.dto';
import { SystemSettingsDto } from './system-settings.dto';
import { ContentStrategyDto } from './content-strategy-dto';
import { Type } from 'class-transformer';

export class UpdateTenantSettingsDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => BrandSettingsDto)
  brandSettings: BrandSettingsDto;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SystemSettingsDto)
  systemSettings: SystemSettingsDto;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ContentStrategyDto)
  contentStrategy: ContentStrategyDto;
}







