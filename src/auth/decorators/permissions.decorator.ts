import { SetMetadata } from '@nestjs/common';
import { AdminPermission, TenantPermission } from '../../common/enums/role.enum';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (
  ...permissions: (AdminPermission | TenantPermission)[]
) => SetMetadata(PERMISSIONS_KEY, permissions);






