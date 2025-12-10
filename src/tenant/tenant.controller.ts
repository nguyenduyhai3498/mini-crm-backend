import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, TenantPermission, AdminPermission } from '../common/enums/role.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateSocialPageDto } from './dto/create-social-page.dto';
import { UpdateSocialPageDto } from './dto/update-social-page.dto';
import { User } from '../entities/user.entity';

@Controller('tenant')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.TENANT_ADMIN, UserRole.TENANT_USER, UserRole.SUPER_ADMIN)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // Employee Management
  @Post('employees')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN)
  @Permissions(AdminPermission.MANAGE_TENANTS)
  async createEmployee(
    @CurrentUser() user: User,
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    return this.tenantService.createEmployee(createEmployeeDto.tenantId, createEmployeeDto);
  }

  @Get('employees')
  @Permissions(TenantPermission.MANAGE_EMPLOYEES)
  async getEmployees(@CurrentUser() user: User) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }
    return this.tenantService.getEmployees(user.tenantId);
  }

  @Get('employees/:id')
  @Permissions(TenantPermission.MANAGE_EMPLOYEES)
  async getEmployeeById(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }
    return this.tenantService.getEmployeeById(user.tenantId, id);
  }

  @Put('employees/:id')
  @Permissions(TenantPermission.MANAGE_EMPLOYEES)
  @Roles(UserRole.TENANT_ADMIN)
  async updateEmployee(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }
    return this.tenantService.updateEmployee(user.tenantId, id, updateEmployeeDto);
  }

  @Delete('employees/:id')
  @Permissions(TenantPermission.MANAGE_EMPLOYEES)
  @Roles(UserRole.TENANT_ADMIN)
  async deleteEmployee(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }
    await this.tenantService.deleteEmployee(user.tenantId, id);
    return { message: 'Employee deleted successfully' };
  }

  // Social Page Management
  @Post('social-pages')
  @Permissions(TenantPermission.MANAGE_SOCIAL_PAGES)
  @Roles(UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async createSocialPage(
    @CurrentUser() user: User,
    @Body() createSocialPageDto: CreateSocialPageDto,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }
    return this.tenantService.createSocialPage(user.tenantId, createSocialPageDto);
  }

  @Get('social-pages')
  @Permissions(TenantPermission.MANAGE_SOCIAL_PAGES, TenantPermission.VIEW_POSTS)
  async getSocialPages(@CurrentUser() user: User) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }
    return this.tenantService.getSocialPages(user.tenantId);
  }

  @Get('social-pages/:id')
  @Permissions(TenantPermission.MANAGE_SOCIAL_PAGES, TenantPermission.VIEW_POSTS)
  async getSocialPageById(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }
    return this.tenantService.getSocialPageById(user.tenantId, id);
  }

  @Put('social-pages/:id')
  @Permissions(TenantPermission.MANAGE_SOCIAL_PAGES)
  @Roles(UserRole.TENANT_ADMIN)
  async updateSocialPage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateSocialPageDto: UpdateSocialPageDto,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }
    return this.tenantService.updateSocialPage(
      user.tenantId,
      id,
      updateSocialPageDto,
    );
  }

  @Delete('social-pages/:id')
  @Permissions(TenantPermission.MANAGE_SOCIAL_PAGES)
  @Roles(UserRole.TENANT_ADMIN)
  async deleteSocialPage(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }
    await this.tenantService.deleteSocialPage(user.tenantId, id);
    return { message: 'Social page deleted successfully' };
  }
}

