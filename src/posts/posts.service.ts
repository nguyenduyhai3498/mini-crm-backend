import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Post } from '../entities/post.entity';
import { SocialPage } from '../entities/social-page.entity';
import { FacebookService } from '../social/services/facebook.service';
import { InstagramService } from '../social/services/instagram.service';
import { SocialPlatform } from '../common/enums/social-platform.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { GetAllPostsQueryDto } from './dto/get-all-posts-query.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(SocialPage)
    private socialPageRepository: Repository<SocialPage>,
    private facebookService: FacebookService,
    private instagramService: InstagramService,
  ) {}

  async getPosts(
    tenantId: string,
    socialPageId: string,
    query: GetPostsQueryDto,
  ): Promise<Post[]> {
    const page = await this.socialPageRepository.findOne({
      where: { id: socialPageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Social page not found');
    }

    // If refresh is requested, fetch fresh data from social platform
    if (query.refresh) {
      await this.syncPostsFromPlatform(page, query.since, query.until);
    }

    // Build query conditions
    const where: any = { socialPageId };

    if (query.since || query.until) {
      where.postedAt = Between(
        query.since ? new Date(query.since) : new Date(0),
        query.until ? new Date(query.until) : new Date(),
      );
    }

    return this.postRepository.find({
      where,
      order: { postedAt: 'DESC' },
      take: query.limit || 25,
    });
  }

  async getPostById(
    tenantId: string,
    socialPageId: string,
    postId: string,
    refresh: boolean = false,
  ): Promise<Post> {
    const page = await this.socialPageRepository.findOne({
      where: { id: socialPageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Social page not found');
    }

    let post = await this.postRepository.findOne({
      where: { id: postId, socialPageId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If refresh is requested, fetch fresh data from social platform
    if (refresh) {
      try {
        let platformPost;

        if (page.platform === SocialPlatform.FACEBOOK) {
          platformPost = await this.facebookService.getPostById(
            post.externalId,
            page.accessToken,
          );
          post.likes = platformPost.likes?.summary?.total_count || 0;
          post.comments = platformPost.comments?.summary?.total_count || 0;
          post.shares = platformPost.shares?.count || 0;
        } else if (page.platform === SocialPlatform.INSTAGRAM) {
          platformPost = await this.instagramService.getPostById(
            post.externalId,
            page.accessToken,
          );
          post.likes = platformPost.like_count || 0;
          post.comments = platformPost.comments_count || 0;
        }

        await this.postRepository.save(post);
      } catch (error) {
        // If fetching fresh data fails, return cached data
        console.error('Error refreshing post:', error.message);
      }
    }

    return post;
  }

  async createPost(
    tenantId: string,
    createPostDto: CreatePostDto,
  ): Promise<Post> {
    const page = await this.socialPageRepository.findOne({
      where: { id: createPostDto.socialPageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Social page not found');
    }

    if (page.platform !== createPostDto.platform) {
      throw new BadRequestException('Platform mismatch');
    }

    let externalPostId: string;

    try {
      // Post to the social platform
      if (page.platform === SocialPlatform.FACEBOOK) {
        const result = await this.facebookService.createPost(
          page.pageId,
          page.accessToken,
          createPostDto.content,
          createPostDto.mediaUrls?.[0],
        );
        externalPostId = result.id;
      } else if (page.platform === SocialPlatform.INSTAGRAM) {
        if (!createPostDto.mediaUrls || createPostDto.mediaUrls.length === 0) {
          throw new BadRequestException('Instagram posts require an image');
        }
        const result = await this.instagramService.createPost(
          page.pageId,
          page.accessToken,
          createPostDto.mediaUrls[0],
          createPostDto.content,
        );
        externalPostId = result.id;
      } else {
        throw new BadRequestException('Platform not supported for posting');
      }

      // Save to database
      const post = this.postRepository.create({
        externalId: externalPostId,
        socialPageId: page.id,
        platform: page.platform,
        content: createPostDto.content,
        mediaUrls: createPostDto.mediaUrls || [],
        metadata: createPostDto.metadata,
        postedAt: new Date(),
      });

      return this.postRepository.save(post);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create post: ${error.message}`,
      );
    }
  }

  private async syncPostsFromPlatform(
    page: SocialPage,
    since?: string,
    until?: string,
  ): Promise<void> {
    try {
      let platformPosts: any[] = [];

      const sinceDate = since ? new Date(since) : undefined;
      const untilDate = until ? new Date(until) : undefined;

      if (page.platform === SocialPlatform.FACEBOOK) {
        platformPosts = await this.facebookService.getPosts(
          page.pageId,
          page.accessToken,
          sinceDate,
          untilDate,
        );

        for (const fbPost of platformPosts) {
          const existingPost = await this.postRepository.findOne({
            where: { externalId: fbPost.id },
          });

          const postData = {
            externalId: fbPost.id,
            socialPageId: page.id,
            platform: page.platform,
            content: fbPost.message || fbPost.story || '',
            mediaUrls: fbPost.full_picture ? [fbPost.full_picture] : [],
            likes: fbPost.likes?.summary?.total_count || 0,
            comments: fbPost.comments?.summary?.total_count || 0,
            shares: fbPost.shares?.count || 0,
            postedAt: new Date(fbPost.created_time),
            metadata: fbPost,
          };

          if (existingPost) {
            Object.assign(existingPost, postData);
            await this.postRepository.save(existingPost);
          } else {
            const post = this.postRepository.create(postData);
            await this.postRepository.save(post);
          }
        }
      } else if (page.platform === SocialPlatform.INSTAGRAM) {
        platformPosts = await this.instagramService.getPosts(
          page.pageId,
          page.accessToken,
          sinceDate,
          untilDate,
        );

        for (const igPost of platformPosts) {
          const existingPost = await this.postRepository.findOne({
            where: { externalId: igPost.id },
          });

          const mediaUrls = [igPost.media_url];
          if (igPost.children?.data) {
            mediaUrls.push(
              ...igPost.children.data.map((child: any) => child.media_url),
            );
          }

          const postData = {
            externalId: igPost.id,
            socialPageId: page.id,
            platform: page.platform,
            content: igPost.caption || '',
            mediaUrls,
            likes: igPost.like_count || 0,
            comments: igPost.comments_count || 0,
            shares: 0,
            postedAt: new Date(igPost.timestamp),
            metadata: igPost,
          };

          if (existingPost) {
            Object.assign(existingPost, postData);
            await this.postRepository.save(existingPost);
          } else {
            const post = this.postRepository.create(postData);
            await this.postRepository.save(post);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing posts:', error.message);
      throw new BadRequestException(`Failed to sync posts: ${error.message}`);
    }
  }

  async getAllPosts(tenantId: string, query: GetAllPostsQueryDto) {
    const posts: any[] = [];
    let platform = query.platform;
    let where: any = { tenantId };
    if (platform !== 'All') {
      where.platform = platform;
    }
    const pages = await this.socialPageRepository.find({
      where,
    });
    for (const page of pages) {
      if (page.platform === SocialPlatform.FACEBOOK) {
        const fetched = await this.facebookService.getPosts(
          page.pageId,
          page.accessToken,
          query.startDate ? new Date(query.startDate) : undefined,
          query.endDate ? new Date(query.endDate) : undefined,
        );
        if (fetched) {
          posts.push(...this.mapPostsToGlobal(fetched, page.id, page.platform));
        }
      } else if (page.platform === SocialPlatform.INSTAGRAM) {
        const fetched = await this.instagramService.getPosts(
          page.pageId,
          page.accessToken,
          query.startDate ? new Date(query.startDate) : undefined,
          query.endDate ? new Date(query.endDate) : undefined,
        );
        if (fetched) {
          posts.push(...fetched);
        }
      }
    }
    return {
      posts,
    };
  }

  private mapPostsToGlobal(posts: any[], socialPageId: string, platform: SocialPlatform): Partial<any>[] {
    if (platform === SocialPlatform.FACEBOOK) {
      return posts.map((post) => ({
        id: post.id,
        socialPageId,
        platform,
        content: post.message ?? '',
        mediaUrls: post.permalink_url ?? '',
        likes: post.likes ?? 0,
        comments: post.comments ?? 0,
        shares: post.shares ?? 0,
        fullPicture: post.full_picture ?? '',
        postedAt: post.created_time ? new Date(post.created_time) : new Date(),
        status: 'Posted',
        attachments: [],
        date: post.created_time ? new Date(post.created_time).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }) : new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }),
      }));
    }else if (platform === SocialPlatform.INSTAGRAM) {
      return posts.map((post) => ({
        id: post.id,
        socialPageId,
        platform,
        content: post.caption ?? '',
        mediaUrls: post.media_url ? [post.media_url] : [],
        likes: post.like_count ?? 0,
        comments: post.comments_count ?? 0,
        shares: 0,
        metadata: post,
        postedAt: post.timestamp ? new Date(post.timestamp) : new Date(),
      }));
    }else{
      return [];
    }
  }
}
