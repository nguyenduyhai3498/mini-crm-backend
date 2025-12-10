import { IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import { SocialPlatform } from '../../common/enums/social-platform.enum';

export class CreatePostDto {
  @IsNotEmpty()
  socialPageId: string;

  @IsEnum(SocialPlatform)
  @IsNotEmpty()
  platform: SocialPlatform;

  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  mediaUrls?: string[];

  @IsOptional()
  metadata?: any;
}






