import { Controller, Post, UseGuards, Body, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return this.authService.login(req.user, 'user');
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('admin-login')
  async loginAdmin(@Body() loginDto: LoginDto, @Request() req) {
    return this.authService.login(req.user, 'admin');
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    // In a JWT system, logout is typically handled on the client side
    // by removing the token. You can implement token blacklisting here if needed.
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
      adminPermissions: user.adminPermissions,
      tenantPermissions: user.tenantPermissions,
    };
  }
}

