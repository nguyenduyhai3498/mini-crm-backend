import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { SocialPage } from '../entities/social-page.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateSocialPageDto } from './dto/create-social-page.dto';
import { UpdateSocialPageDto } from './dto/update-social-page.dto';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../common/enums/role.enum';
import { FacebookService } from '../social/services/facebook.service';
import { TenantSettings } from 'src/entities/tenant-settings.entity';
import { UpdateTenantSettingsDto } from './dto/update-settings.dto';

const DEFAULT_BRAND_SETTINGS = {
  industry: '',
  targetAudience: '',
  offerings: '',
  archetype: '',
  tone: '',
  defaultLanguage: '',
  exemplar: '',
  forbiddenKeywords: [],
};

const DEFAULT_SYSTEM_SETTINGS = {
  language: 'en',
  timeZone: 'UTC',
};

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantSettings)
    private tenantSettingsRepository: Repository<TenantSettings>,
    @InjectRepository(SocialPage)
    private socialPageRepository: Repository<SocialPage>,
    private authService: AuthService,
    private facebookService: FacebookService,
  ) {}

  // Employee Management
  async createEmployee(
    tenantId: string,
    createEmployeeDto: CreateEmployeeDto,
  ): Promise<User> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: createEmployeeDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.authService.hashPassword(
      createEmployeeDto.password,
    );

    const user = this.userRepository.create({
      email: createEmployeeDto.email,
      password: hashedPassword,
      fullName: createEmployeeDto.fullName,
      role: UserRole.TENANT_USER,
      tenantId,
      tenantPermissions: createEmployeeDto.tenantPermissions || [],
    });

    const savedUser = await this.userRepository.save(user);

    // Set authorized pages if provided
    if (createEmployeeDto.authorizedPageIds &&createEmployeeDto.authorizedPageIds?.length > 0) {
      await this.updateEmployeeAuthorizedPages(
        tenantId,
        savedUser.id,
        createEmployeeDto.authorizedPageIds || [],
      );
    }

    return savedUser;
  }

  async getEmployees(tenantId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { tenantId },
      relations: ['authorizedPages'],
      order: { createdAt: 'DESC' },
    });
  }

  async getEmployeeById(tenantId: string, employeeId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: employeeId, tenantId },
      relations: ['authorizedPages'],
    });

    if (!user) {
      throw new NotFoundException('Employee not found');
    }

    return user;
  }

  async updateEmployee(
    tenantId: string,
    employeeId: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<User> {
    const user = await this.getEmployeeById(tenantId, employeeId);

    if (updateEmployeeDto.authorizedPageIds !== undefined) {
      await this.updateEmployeeAuthorizedPages(
        tenantId,
        employeeId,
        updateEmployeeDto.authorizedPageIds,
      );
      delete updateEmployeeDto.authorizedPageIds;
    }

    Object.assign(user, updateEmployeeDto);
    return this.userRepository.save(user);
  }

  async deleteEmployee(tenantId: string, employeeId: string): Promise<void> {
    const user = await this.getEmployeeById(tenantId, employeeId);
    await this.userRepository.remove(user);
  }

  private async updateEmployeeAuthorizedPages(
    tenantId: string,
    employeeId: string,
    pageIds: string[],
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: employeeId, tenantId },
      relations: ['authorizedPages'],
    });

    if (!user) {
      throw new NotFoundException('Employee not found');
    }

    if (pageIds.length > 0) {
      const pages = await this.socialPageRepository.find({
        where: { id: In(pageIds), tenantId },
      });

      if (pages.length !== pageIds.length) {
        throw new BadRequestException('Some page IDs are invalid');
      }

      user.authorizedPages = pages;
    } else {
      user.authorizedPages = [];
    }

    await this.userRepository.save(user);
  }

  // Social Page Management
  async createSocialPage(
    tenantId: string,
    createSocialPageDto: CreateSocialPageDto,
  ): Promise<SocialPage> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['socialPages'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if tenant has reached the limit
    if (tenant.socialPages.length >= tenant.maxSocialPages) {
      throw new BadRequestException(
        `Maximum number of social pages (${tenant.maxSocialPages}) reached`,
      );
    }
    

    const pageInfo = await this.facebookService.getPageInfo(createSocialPageDto.accessToken);
    if (!pageInfo) {
      throw new BadRequestException('Invalid access token');
    }

    createSocialPageDto.pageId = pageInfo.id;
    createSocialPageDto.name = pageInfo.name;
    createSocialPageDto.profilePicture = pageInfo.picture.data.url;
    createSocialPageDto.metadata = pageInfo;

    // Check for duplicate page
    const existingPage = await this.socialPageRepository.findOne({
      where: {
        tenantId,
        platform: createSocialPageDto.platform,
        pageId: createSocialPageDto.pageId,
      },
    });

    if (existingPage) {
      throw new ConflictException('This page is already connected');
    }

    const page = this.socialPageRepository.create({
      ...createSocialPageDto,
      tenantId,
    });

    return this.socialPageRepository.save(page);
  }

  async getSocialPages(tenantId: string): Promise<SocialPage[]> {
    return this.socialPageRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSocialPageById(tenantId: string, pageId: string): Promise<SocialPage> {
    const page = await this.socialPageRepository.findOne({
      where: { id: pageId, tenantId },
      relations: ['authorizedUsers'],
    });

    if (!page) {
      throw new NotFoundException('Social page not found');
    }

    return page;
  }

  async updateSocialPage(
    tenantId: string,
    pageId: string,
    updateSocialPageDto: UpdateSocialPageDto,
  ): Promise<SocialPage> {
    const page = await this.getSocialPageById(tenantId, pageId);

    Object.assign(page, updateSocialPageDto);
    return this.socialPageRepository.save(page);
  }

  async deleteSocialPage(tenantId: string, pageId: string): Promise<void> {
    const page = await this.getSocialPageById(tenantId, pageId);
    await this.socialPageRepository.remove(page);
  }

  // Permission check helper
  async checkUserPagePermission(
    userId: string,
    pageId: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['authorizedPages', 'tenant'],
    });

    if (!user) {
      return false;
    }

    // Tenant admins have access to all pages
    if (user.role === UserRole.TENANT_ADMIN) {
      const page = await this.socialPageRepository.findOne({
        where: { id: pageId, tenantId: user.tenantId },
      });
      return !!page;
    }

    // Check if user has explicit permission for this page
    return user.authorizedPages.some((page) => page.id === pageId);
  }

  async getTenantSettings(tenantId: string) {
    const tenantSettings = await this.tenantSettingsRepository.findOne({
      where: { tenant: { id: tenantId } },
    });
    
    return {
      statusCode: 200,
      brandSettings: tenantSettings?.brandSettings || DEFAULT_BRAND_SETTINGS,
      systemSettings: tenantSettings?.systemSettings || DEFAULT_SYSTEM_SETTINGS,
    };
  }

  async updateTenantSettings(tenantId, updateTenantSettingsDto: UpdateTenantSettingsDto){
    let tenantSettings = await this.tenantSettingsRepository.findOne({
      where: { tenant: { id: tenantId } },
    });

    if (!tenantSettings) {
      tenantSettings = this.tenantSettingsRepository.create({
        tenant: { id: tenantId },
        brandSettings: updateTenantSettingsDto.brandSettings || DEFAULT_BRAND_SETTINGS,
        systemSettings: updateTenantSettingsDto.systemSettings || DEFAULT_SYSTEM_SETTINGS,
      });
    }

    tenantSettings.brandSettings = updateTenantSettingsDto.brandSettings;
    tenantSettings.systemSettings = updateTenantSettingsDto.systemSettings;
    return this.tenantSettingsRepository.save(tenantSettings);
  }
}
