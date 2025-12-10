import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { SocialPlatform } from 'src/common/enums/social-platform.enum';

export class GetAllPostsQueryDto {

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsEnum(SocialPlatform)
  platform?: SocialPlatform | 'All';

  @IsOptional()
  socialPageId?: string;
}




