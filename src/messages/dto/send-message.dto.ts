import { IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  socialPageId: string;

  @IsNotEmpty()
  recipientId: string; // External ID of the recipient

  @IsNotEmpty()
  content: string;
}






