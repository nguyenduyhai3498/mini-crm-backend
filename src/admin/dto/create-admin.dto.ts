import { IsEmail, IsNotEmpty, IsOptional, IsEnum, IsArray, MinLength } from 'class-validator';
import { UserRole, AdminPermission } from '../../common/enums/role.enum';

export class CreateAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  fullName: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  @IsOptional()
  adminPermissions?: AdminPermission[];
}






