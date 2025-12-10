import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, TenantPermission } from '../common/enums/role.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { GetAllPostsQueryDto } from './dto/get-all-posts-query.dto';
import { User } from '../entities/user.entity';
import { TenantService } from '../tenant/tenant.service';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly tenantService: TenantService,
  ) {}

  @Get('page/:pageId')
  @Permissions(TenantPermission.VIEW_POSTS)
  async getPosts(
    @CurrentUser() user: User,
    @Param('pageId') pageId: string,
    @Query() query: GetPostsQueryDto,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    // Check if user has permission to view this page
    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      pageId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to view posts from this page',
      );
    }

    return this.postsService.getPosts(user.tenantId, pageId, query);
  }

  @Get('page/:pageId/post/:postId')
  @Permissions(TenantPermission.VIEW_POSTS)
  async getPostById(
    @CurrentUser() user: User,
    @Param('pageId') pageId: string,
    @Param('postId') postId: string,
    @Query('refresh') refresh?: boolean,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      pageId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to view posts from this page',
      );
    }

    return this.postsService.getPostById(
      user.tenantId,
      pageId,
      postId,
      refresh,
    );
  }

  @Post()
  @Permissions(TenantPermission.CREATE_POSTS)
  async createPost(
    @CurrentUser() user: User,
    @Body() createPostDto: CreatePostDto,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      createPostDto.socialPageId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to post to this page',
      );
    }

    return this.postsService.createPost(user.tenantId, createPostDto);
  }

  @Get('')
  @Permissions(TenantPermission.VIEW_POSTS)
  async getAllPosts(
    @CurrentUser() user: User,
    @Query() query: GetAllPostsQueryDto,
  ) {
    return this.postsService.getAllPosts(user.tenantId, query);
  }
}




