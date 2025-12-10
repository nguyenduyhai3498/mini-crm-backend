import { IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { TenantPermission } from '../../common/enums/role.enum';

export class UpdateEmployeeDto {
  @IsOptional()
  fullName?: string;

  @IsArray()
  @IsEnum(TenantPermission, { each: true })
  @IsOptional()
  tenantPermissions?: TenantPermission[];

  @IsArray()
  @IsOptional()
  authorizedPageIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

