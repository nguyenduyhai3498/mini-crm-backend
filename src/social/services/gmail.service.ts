import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: any;
  internalDate: any;
  from: string;
  to: string;
  subject: string;
  body?: string;
  attachments?: Array<{ filename: string; mimeType: string; size: number }>;
}

@Injectable()
export class GmailService {
  async getMessages(
    accessToken: string,
    maxResults: number = 25,
    after?: Date,
    before?: Date,
  ): Promise<GmailMessage[]> {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      let query = 'in:inbox';
      if (after) {
        query += ` after:${Math.floor(after.getTime() / 1000)}`;
      }
      if (before) {
        query += ` before:${Math.floor(before.getTime() / 1000)}`;
      }

      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: query,
      });

      const messages = response.data.messages || [];

      const detailedMessages = await Promise.all(
        messages
          // Ensure message has an id to satisfy the Gmail SDK typings
          .filter((msg): msg is { id: string } => Boolean(msg.id))
          .map(async (msg) => {
            const detail = await gmail.users.messages.get({
              userId: 'me',
              id: msg.id,
              format: 'full',
            });

            const headers = detail?.data?.payload?.headers || [];
            const getHeader = (name: string) =>
              headers.find(
                (h) => h?.name?.toLowerCase && h.name.toLowerCase() === name.toLowerCase(),
              )?.value || '';

            return {
              id: detail.data.id || '',
              threadId: detail.data.threadId || '',
              snippet: detail.data.snippet || '',
              internalDate: detail.data.internalDate,
              from: getHeader('from'),
              to: getHeader('to'),
              subject: getHeader('subject'),
              body:
                detail && typeof detail.data === 'object' && detail.data
                  ? this.extractBody(detail.data?.payload as any)
                  : '',
            };
          }),
      );

      return detailedMessages as GmailMessage[];
    } catch (error) {
      throw new Error(`Gmail API error: ${error.message}`);
    }
  }

  async getMessageById(
    accessToken: string,
    messageId: string,
  ): Promise<GmailMessage> {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const headers = detail.data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h && h.name && h.name.toLowerCase() === name.toLowerCase())?.value || '';

      return {
        id: detail.data.id || '',
        threadId: detail.data.threadId || '',
        snippet: detail.data.snippet,
        internalDate: detail.data.internalDate,
        from: getHeader('from'),
        to: getHeader('to'),
        subject: getHeader('subject'),
        body: this.extractBody(detail.data.payload),
      };
    } catch (error) {
      throw new Error(`Gmail API error: ${error.message}`);
    }
  }

  async sendMessage(
    accessToken: string,
    to: string,
    subject: string,
    body: string,
    cc?: string,
    bcc?: string,
  ): Promise<any> {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const message = [
        `To: ${to}`,
        cc ? `Cc: ${cc}` : '',
        bcc ? `Bcc: ${bcc}` : '',
        `Subject: ${subject}`,
        '',
        body,
      ]
        .filter(Boolean)
        .join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Gmail API error: ${error.message}`);
    }
  }

  async replyToMessage(
    accessToken: string,
    threadId: string,
    messageId: string,
    body: string,
  ): Promise<any> {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // Get original message to extract recipient info
      const original = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const headers = original.data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h?.name?.toLowerCase() === name.toLowerCase())?.value || '';

      const to = getHeader('from');
      const subject = getHeader('subject');

      const message = [
        `To: ${to}`,
        `Subject: Re: ${subject}`,
        `In-Reply-To: ${messageId}`,
        `References: ${messageId}`,
        '',
        body,
      ].join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
          threadId,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Gmail API error: ${error.message}`);
    }
  }

  async verifyToken(accessToken: string): Promise<any> {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const response = await gmail.users.getProfile({
        userId: 'me',
      });

      return response.data;
    } catch (error) {
      throw new Error(`Gmail API error: ${error.message}`);
    }
  }

  private extractBody(payload: any): string {
    if (!payload) return '';

    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }

      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    return '';
  }
}

