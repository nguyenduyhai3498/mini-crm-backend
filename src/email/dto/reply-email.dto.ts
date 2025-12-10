import { IsNotEmpty } from 'class-validator';

export class ReplyEmailDto {
  @IsNotEmpty()
  socialPageId: string; // Gmail account to reply from

  @IsNotEmpty()
  threadId: string;

  @IsNotEmpty()
  messageId: string;

  @IsNotEmpty()
  body: string;
}






