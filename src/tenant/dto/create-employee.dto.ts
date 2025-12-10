import { IsEmail, IsNotEmpty, IsOptional, IsEnum, IsArray, MinLength, IsNumber } from 'class-validator';
import { TenantPermission } from '../../common/enums/role.enum';

export class CreateEmployeeDto {
  @IsNotEmpty()
  tenantId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  fullName: string;

  @IsArray()
  @IsEnum(TenantPermission, { each: true })
  @IsOptional()
  tenantPermissions?: TenantPermission[];

  @IsArray()
  @IsOptional()
  authorizedPageIds?: string[]; // IDs of pages the employee can access
}

