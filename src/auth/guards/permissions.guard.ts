import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AdminPermission, TenantPermission } from '../../common/enums/role.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    
    const requiredPermissions = this.reflector.getAllAndOverride<
      (AdminPermission | TenantPermission)[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    
    console.log('requiredPermissions', requiredPermissions);
    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userPermissions = [
      ...(user.adminPermissions || []),
      ...(user.tenantPermissions || []),
    ];

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );


    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}


