import { IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class GetMessagesQueryDto {
  @IsOptional()
  @IsDateString()
  since?: string;

  @IsOptional()
  @IsDateString()
  until?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsBoolean()
  refresh?: boolean; // If true, fetch fresh data from social platform

  @IsOptional()
  conversationId?: string; // Filter by conversation
}






