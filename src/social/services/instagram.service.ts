import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  children?: any;
}

export interface InstagramComment {
  id: string;
  text: string;
  timestamp: string;
  from: { id: string; username: string };
  replies?: any;
}

@Injectable()
export class InstagramService {
  private readonly apiUrl = 'https://graph.instagram.com';

  async getPosts(
    accountId: string,
    accessToken: string,
    since?: Date,
    until?: Date,
    limit: number = 25,
  ): Promise<InstagramPost[]> {
    try {
      const params: any = {
        access_token: accessToken,
        fields:
          'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,children{media_url,media_type}',
        limit,
      };

      if (since) {
        params.since = Math.floor(since.getTime() / 1000);
      }

      if (until) {
        params.until = Math.floor(until.getTime() / 1000);
      }

      const response = await axios.get(`${this.apiUrl}/${accountId}/media`, {
        params,
      });

      return response.data.data || [];
    } catch (error) {
      throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getPostById(
    postId: string,
    accessToken: string,
  ): Promise<InstagramPost> {
    try {
      const response = await axios.get(`${this.apiUrl}/${postId}`, {
        params: {
          access_token: accessToken,
          fields:
            'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,children{media_url,media_type}',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getComments(
    mediaId: string,
    accessToken: string,
    limit: number = 25,
  ): Promise<InstagramComment[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/${mediaId}/comments`, {
        params: {
          access_token: accessToken,
          fields: 'id,text,timestamp,from,replies{id,text,timestamp}',
          limit,
        },
      });

      return response.data.data || [];
    } catch (error) {
      throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createPost(
    accountId: string,
    accessToken: string,
    imageUrl: string,
    caption?: string,
  ): Promise<{ id: string }> {
    try {
      // Step 1: Create media container
      const containerResponse = await axios.post(
        `${this.apiUrl}/${accountId}/media`,
        {
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        },
      );

      const containerId = containerResponse.data.id;

      // Step 2: Publish the container
      const publishResponse = await axios.post(
        `${this.apiUrl}/${accountId}/media_publish`,
        {
          creation_id: containerId,
          access_token: accessToken,
        },
      );

      return publishResponse.data;
    } catch (error) {
      throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async replyToComment(
    commentId: string,
    accessToken: string,
    message: string,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${commentId}/replies`,
        {
          message,
          access_token: accessToken,
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async verifyToken(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/me`, {
        params: {
          access_token: accessToken,
          fields: 'id,username,account_type',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}






