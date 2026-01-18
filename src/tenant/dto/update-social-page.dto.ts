import { IsOptional, IsEnum } from 'class-validator';
import { SocialPageStatus } from '../../common/enums/social-platform.enum';

export class UpdateSocialPageDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  accessToken?: string;

  @IsOptional()
  refreshToken?: string;

  @IsOptional()
  tokenExpiresAt?: Date;

  @IsEnum(SocialPageStatus)
  @IsOptional()
  status?: SocialPageStatus;

  @IsOptional()
  profilePicture?: string;

  @IsOptional()
  metadata?: any;
}







