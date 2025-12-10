import { IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { AdminPermission } from '../../common/enums/role.enum';

export class UpdateAdminDto {
  @IsOptional()
  fullName?: string;

  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  @IsOptional()
  adminPermissions?: AdminPermission[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}






