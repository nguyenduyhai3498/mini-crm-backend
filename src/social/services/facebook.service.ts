import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  full_picture?: string;
  attachments?: any;
  likes?: { summary: { total_count: number } };
  comments?: { summary: { total_count: number } };
  shares?: { count: number };
}

export interface FacebookMessage {
  id: string;
  created_time: string;
  from: { id: string; name: string; email?: string };
  to: { data: Array<{ id: string; name: string }> };
  message: string;
  attachments?: any;
}

@Injectable()
export class FacebookService {
  private readonly apiUrl = 'https://graph.facebook.com/v18.0';

  async getPosts(
    pageId: string,
    accessToken: string,
    since?: Date,
    until?: Date,
    limit: number = 25,
  ): Promise<FacebookPost[]> {
    try {
      const params: any = {
        access_token: accessToken,
        fields:
          'id,message,story,created_time,full_picture,attachments,likes.summary(true),comments.summary(true),shares',
        limit,
      };

      if (since) {
        params.since = Math.floor(since.getTime() / 1000);
      }

      if (until) {
        params.until = Math.floor(until.getTime() / 1000);
      }

      const response = await axios.get(`${this.apiUrl}/${pageId}/posts`, {
        params,
      });

      return response.data.data || [];
    } catch (error) {
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getPostById(
    postId: string,
    accessToken: string,
  ): Promise<FacebookPost> {
    try {
      const response = await axios.get(`${this.apiUrl}/${postId}`, {
        params: {
          access_token: accessToken,
          fields:
            'id,message,story,created_time,full_picture,attachments,likes.summary(true),comments.summary(true),shares',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getConversations(
    pageId: string,
    accessToken: string,
    limit: number = 25,
  ): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/${pageId}/conversations`, {
        params: {
          access_token: accessToken,
          fields: 'id,updated_time,participants,unread_count,message_count',
          limit,
        },
      });

      return response.data.data || [];
    } catch (error) {
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getMessages(
    conversationId: string,
    accessToken: string,
    limit: number = 25,
  ): Promise<FacebookMessage[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${conversationId}/messages`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,created_time,from,to,message,attachments',
            limit,
          },
        },
      );

      return response.data.data || [];
    } catch (error) {
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createPost(
    pageId: string,
    accessToken: string,
    message: string,
    link?: string,
  ): Promise<{ id: string }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${pageId}/feed`,
        {
          message,
          link,
          access_token: accessToken,
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async sendMessage(
    pageId: string,
    accessToken: string,
    recipientId: string,
    message: string,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${pageId}/messages`,
        {
          recipient: { id: recipientId },
          message: { text: message },
          access_token: accessToken,
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async verifyToken(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/me`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,picture',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getPageInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/me`, {
        params: {
          fields: 'id,name,picture',
          access_token: accessToken,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}


