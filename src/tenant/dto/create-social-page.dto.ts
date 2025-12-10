import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { SocialPlatform } from '../../common/enums/social-platform.enum';

export class CreateSocialPageDto {
  @IsOptional()
  name: string;

  @IsEnum(SocialPlatform)
  @IsNotEmpty()
  platform: SocialPlatform;

  @IsOptional()
  pageId: string;

  @IsNotEmpty()
  accessToken: string;

  @IsOptional()
  refreshToken?: string;

  @IsOptional()
  tokenExpiresAt?: Date;

  @IsOptional()
  profilePicture?: string;

  @IsOptional()
  metadata?: any;
}


