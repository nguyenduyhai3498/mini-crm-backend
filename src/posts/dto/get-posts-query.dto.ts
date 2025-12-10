import { IsOptional, IsDateString } from 'class-validator';

export class GetPostsQueryDto {
  @IsOptional()
  @IsDateString()
  since?: string;

  @IsOptional()
  @IsDateString()
  until?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  refresh?: boolean; // If true, fetch fresh data from social platform
}




