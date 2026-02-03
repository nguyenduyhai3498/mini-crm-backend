import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { User } from '../entities/user.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../common/enums/role.enum';
import { SocialPage } from 'src/entities/social-page.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
    @InjectRepository(SocialPage)
    private socialPageRepository: Repository<SocialPage>,
  ) {}

  // Tenant Management
  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const existingTenant = await this.tenantRepository.findOne({
      where: { name: createTenantDto.name },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this name already exists');
    }

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      maxSocialPages: createTenantDto.maxSocialPages || 5,
    });

    return this.tenantRepository.save(tenant);
  }

  async getAllTenants(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Tenant[]; total: number; page: number; totalPages: number }> {
    const [data, total] = await this.tenantRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['users', 'socialPages'],
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTenantById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['users', 'socialPages'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async updateTenant(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.getTenantById(id);

    if (updateTenantDto.name && updateTenantDto.name !== tenant.name) {
      const existingTenant = await this.tenantRepository.findOne({
        where: { name: updateTenantDto.name },
      });

      if (existingTenant) {
        throw new ConflictException('Tenant with this name already exists');
      }
    }

    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async deleteTenant(id: string): Promise<void> {
    const tenant = await this.getTenantById(id);

    // Check if tenant has active users
    const userCount = await this.userRepository.count({
      where: { tenantId: id },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        'Cannot delete tenant with active users. Please remove all users first.',
      );
    }

    await this.tenantRepository.remove(tenant);
  }

  // Admin Management
  async createAdmin(createAdminDto: CreateAdminDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.authService.hashPassword(
      createAdminDto.password,
    );

    const user = this.userRepository.create({
      email: createAdminDto.email,
      password: hashedPassword,
      fullName: createAdminDto.fullName,
      role: createAdminDto.role || UserRole.ADMIN,
      adminPermissions: createAdminDto.adminPermissions || [],
    });

    return this.userRepository.save(user);
  }

  async getAllAdmins(): Promise<User[]> {
    return this.userRepository.find({
      where: [{ role: UserRole.SUPER_ADMIN }, { role: UserRole.ADMIN }],
      order: { createdAt: 'DESC' },
    });
  }

  async getAdminById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
      throw new NotFoundException('Admin not found');
    }

    return user;
  }

  async updateAdmin(id: string, updateAdminDto: UpdateAdminDto): Promise<User> {
    const user = await this.getAdminById(id);

    Object.assign(user, updateAdminDto);
    return this.userRepository.save(user);
  }

  async deleteAdmin(id: string): Promise<void> {
    const user = await this.getAdminById(id);

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot delete super admin');
    }

    await this.userRepository.remove(user);
  }

  // Statistics
  async getStatistics() {
    const [totalTenants, activeTenants, totalUsers, totalAdmins] = await Promise.all([
      this.tenantRepository.count(),
      this.tenantRepository.count({ where: { isActive: true } }),
      this.userRepository.count({
        where: [{ role: UserRole.TENANT_ADMIN }, { role: UserRole.TENANT_USER }],
      }),
      this.userRepository.count({
        where: [{ role: UserRole.ADMIN }, { role: UserRole.SUPER_ADMIN }],
      }),
    ]);

    return {
      totalTenants,
      activeTenants,
      totalUsers,
      totalAdmins,
    };
  }

  async getSocialPages(tenantId: string, page: number = 1, limit: number = 10): Promise<SocialPage[]> {
    const socialPages = await this.socialPageRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return socialPages;
  }
}






