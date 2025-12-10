export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TENANT_ADMIN = 'tenant_admin',
  TENANT_USER = 'tenant_user',
}

export enum AdminPermission {
  MANAGE_TENANTS = 'manage_tenants',
  MANAGE_ADMINS = 'manage_admins',
  VIEW_STATISTICS = 'view_statistics',
}

export enum TenantPermission {
  MANAGE_SOCIAL_PAGES = 'manage_social_pages',
  VIEW_POSTS = 'view_posts',
  CREATE_POSTS = 'create_posts',
  MANAGE_MESSAGES = 'manage_messages',
  VIEW_MESSAGES = 'view_messages',
  MANAGE_EMPLOYEES = 'manage_employees',
  SEND_EMAILS = 'send_emails',
}

