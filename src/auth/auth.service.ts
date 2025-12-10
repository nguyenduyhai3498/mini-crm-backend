import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['tenant'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }
    

    return user;
  }

  async login(user: User, type: 'user' | 'admin') {
    if (type === 'admin') {
      if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }else if(type === 'user'){
      if (user.role !== UserRole.TENANT_ADMIN && user.role !== UserRole.TENANT_USER) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    // Update last login
    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
        adminPermissions: user.adminPermissions,
        tenantPermissions: user.tenantPermissions,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    return { message: 'Password changed successfully' };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}




