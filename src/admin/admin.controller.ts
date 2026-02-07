import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { UserRole, AdminPermission } from '../common/enums/role.enum';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Tenant Management
  @Post('tenants')
  @Permissions(AdminPermission.MANAGE_TENANTS)
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.adminService.createTenant(createTenantDto);
  }

  @Get('tenants')
  @Permissions(AdminPermission.MANAGE_TENANTS, AdminPermission.VIEW_STATISTICS)
  async getAllTenants(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.adminService.getAllTenants(page, limit);
  }

  @Get('tenants/:id')
  @Permissions(AdminPermission.MANAGE_TENANTS)
  async getTenantById(@Param('id') id: string) {
    return this.adminService.getTenantById(id);
  }

  @Put('tenants/:id')
  @Permissions(AdminPermission.MANAGE_TENANTS)
  async updateTenant(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.adminService.updateTenant(id, updateTenantDto);
  }

  @Delete('tenants/:id')
  @Permissions(AdminPermission.MANAGE_TENANTS)
  async deleteTenant(@Param('id') id: string) {
    await this.adminService.deleteTenant(id);
    return { message: 'Tenant deleted successfully' };
  }

  // Admin Management
  @Post('admins')
  @Permissions(AdminPermission.MANAGE_ADMINS)
  @Roles(UserRole.SUPER_ADMIN)
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Get('admins')
  @Permissions(AdminPermission.MANAGE_ADMINS)
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Get('admins/:id')
  @Permissions(AdminPermission.MANAGE_ADMINS)
  async getAdminById(@Param('id') id: string) {
    return this.adminService.getAdminById(id);
  }

  @Put('admins/:id')
  @Permissions(AdminPermission.MANAGE_ADMINS)
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminService.updateAdmin(id, updateAdminDto);
  }

  @Delete('admins/:id')
  @Permissions(AdminPermission.MANAGE_ADMINS)
  @Roles(UserRole.SUPER_ADMIN)
  async deleteAdmin(@Param('id') id: string) {
    await this.adminService.deleteAdmin(id);
    return { message: 'Admin deleted successfully' };
  }

  // Statistics
  @Get('statistics')
  @Permissions(AdminPermission.VIEW_STATISTICS)
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  @Get('tenant/:tenantId/social-pages')
  @Permissions(AdminPermission.MANAGE_TENANTS)
  async getSocialPagesByTenantId(@Param('tenantId') tenantId: string, @Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10) {
    return this.adminService.getSocialPagesByTenantId(tenantId, page, limit);
  }

  @Get('social-pages')
  @Permissions(AdminPermission.MANAGE_TENANTS)
  async getSocialPages(@Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10) {
    return this.adminService.getSocialPages(page, limit);
  }

  @Get('tanent-users')
  @Permissions(AdminPermission.MANAGE_TENANTS)
  async getTanentUsers(@Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10) {
    return this.adminService.getTanentUsers(page, limit);
  }
}






