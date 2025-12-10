# HCRM Backend - Project Structure

## 📁 Cấu trúc thư mục

```
backend/src/
├── src/
│   ├── admin/                      # Module quản lý admin & tenant
│   │   ├── dto/                    # Data Transfer Objects
│   │   │   ├── create-admin.dto.ts
│   │   │   ├── update-admin.dto.ts
│   │   │   ├── create-tenant.dto.ts
│   │   │   └── update-tenant.dto.ts
│   │   ├── admin.controller.ts     # API endpoints cho admin
│   │   ├── admin.service.ts        # Business logic
│   │   └── admin.module.ts         # Module definition
│   │
│   ├── auth/                       # Module authentication & authorization
│   │   ├── decorators/             # Custom decorators
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── change-password.dto.ts
│   │   ├── guards/                 # Authorization guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── local-auth.guard.ts
│   │   │   ├── permissions.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interfaces/
│   │   │   └── jwt-payload.interface.ts
│   │   ├── strategies/             # Passport strategies
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── common/                     # Shared resources
│   │   ├── decorators/
│   │   │   └── tenant.decorator.ts
│   │   ├── dto/
│   │   │   ├── api-response.dto.ts
│   │   │   └── pagination.dto.ts
│   │   ├── enums/                  # Enumerations
│   │   │   ├── role.enum.ts
│   │   │   └── social-platform.enum.ts
│   │   ├── filters/                # Exception filters
│   │   │   └── all-exceptions.filter.ts
│   │   └── interceptors/           # Request/Response interceptors
│   │       └── logging.interceptor.ts
│   │
│   ├── email/                      # Module gửi email qua Gmail
│   │   ├── dto/
│   │   │   ├── send-email.dto.ts
│   │   │   └── reply-email.dto.ts
│   │   ├── email.controller.ts
│   │   ├── email.service.ts
│   │   └── email.module.ts
│   │
│   ├── entities/                   # TypeORM entities (Database models)
│   │   ├── audit-log.entity.ts     # Audit logs
│   │   ├── message.entity.ts       # Social media messages
│   │   ├── post.entity.ts          # Social media posts
│   │   ├── social-page.entity.ts   # Connected social pages
│   │   ├── tenant.entity.ts        # Tenants (customers)
│   │   ├── user.entity.ts          # Users
│   │   └── index.ts                # Export all entities
│   │
│   ├── messages/                   # Module quản lý tin nhắn
│   │   ├── dto/
│   │   │   ├── get-messages-query.dto.ts
│   │   │   └── send-message.dto.ts
│   │   ├── messages.controller.ts
│   │   ├── messages.service.ts
│   │   └── messages.module.ts
│   │
│   ├── posts/                      # Module quản lý bài viết
│   │   ├── dto/
│   │   │   ├── create-post.dto.ts
│   │   │   └── get-posts-query.dto.ts
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   └── posts.module.ts
│   │
│   ├── scripts/                    # Utility scripts
│   │   └── create-super-admin.ts
│   │
│   ├── social/                     # Module tích hợp social media
│   │   ├── services/
│   │   │   ├── facebook.service.ts # Facebook Graph API
│   │   │   ├── instagram.service.ts # Instagram API
│   │   │   └── gmail.service.ts    # Gmail API
│   │   └── social.module.ts
│   │
│   ├── tenant/                     # Module quản lý tenant
│   │   ├── dto/
│   │   │   ├── create-employee.dto.ts
│   │   │   ├── update-employee.dto.ts
│   │   │   ├── create-social-page.dto.ts
│   │   │   └── update-social-page.dto.ts
│   │   ├── tenant.controller.ts
│   │   ├── tenant.service.ts
│   │   └── tenant.module.ts
│   │
│   ├── app.controller.ts           # Root controller
│   ├── app.module.ts               # Root module
│   ├── app.service.ts              # Root service
│   └── main.ts                     # Application entry point
│
├── test/                           # E2E tests
├── .env.example                    # Environment variables template
├── API_DOCUMENTATION.md            # API documentation
├── DATABASE_SETUP.md               # Database setup guide
├── DEPLOYMENT.md                   # Deployment guide
├── README.md                       # Project README
├── postman_collection.json         # Postman API collection
├── package.json                    # NPM dependencies
├── tsconfig.json                   # TypeScript configuration
└── nest-cli.json                   # NestJS CLI configuration
```

## 🏗️ Architecture Overview

### Layered Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (Controllers - HTTP Endpoints)       │
├─────────────────────────────────────────┤
│          Business Layer                 │
│     (Services - Business Logic)         │
├─────────────────────────────────────────┤
│         Data Access Layer               │
│   (Repositories - Database Access)      │
├─────────────────────────────────────────┤
│           Database Layer                │
│        (PostgreSQL + TypeORM)           │
└─────────────────────────────────────────┘
```

### Module Dependencies

```
App Module
├── ConfigModule (Global)
├── TypeOrmModule (Global)
├── AuthModule
│   └── Uses: User Entity
├── AdminModule
│   └── Uses: Tenant, User Entities, AuthModule
├── TenantModule
│   └── Uses: User, Tenant, SocialPage Entities, AuthModule
├── SocialModule
│   └── Provides: Facebook, Instagram, Gmail Services
├── PostsModule
│   └── Uses: Post, SocialPage Entities, SocialModule, TenantModule
├── MessagesModule
│   └── Uses: Message, SocialPage Entities, SocialModule, TenantModule
└── EmailModule
    └── Uses: SocialPage Entity, SocialModule, TenantModule
```

## 🔐 Security Layers

### 1. Authentication (JWT)
- JWT tokens với expiration
- Password hashing với bcrypt (10 rounds)
- Secure password requirements

### 2. Authorization
- Role-based access control (RBAC)
- Permission-based access control (PBAC)
- Guards: JWT, Roles, Permissions

### 3. Data Protection
- Input validation (class-validator)
- SQL injection prevention (TypeORM parameterized queries)
- XSS protection (built-in with NestJS)

## 📊 Database Schema

### Entity Relationships

```
User (N) ──── (1) Tenant
User (N) ──── (N) SocialPage (via user_page_permissions)
Tenant (1) ──── (N) SocialPage
SocialPage (1) ──── (N) Post
SocialPage (1) ──── (N) Message
User (1) ──── (N) AuditLog
```

### Key Tables
- **users**: Tất cả users (admin, tenant users)
- **tenants**: Khách hàng/tổ chức
- **social_pages**: Trang social đã kết nối
- **posts**: Bài viết từ social media
- **messages**: Tin nhắn từ social media
- **audit_logs**: Logs hoạt động hệ thống

## 🔄 Request Flow

### 1. Authentication Flow
```
Client Request
    ↓
JWT Guard (validates token)
    ↓
JWT Strategy (loads user from DB)
    ↓
Roles Guard (checks user role)
    ↓
Permissions Guard (checks specific permissions)
    ↓
Controller (handles request)
    ↓
Service (business logic)
    ↓
Repository (database access)
    ↓
Response
```

### 2. Multi-Tenant Isolation
```
Request → JWT → Extract tenantId → Filter by tenantId → Response
```

## 🎯 Key Features Implementation

### 1. Admin Features
- **Location**: `src/admin/`
- **Authentication**: Super Admin or Admin role required
- **Permissions**: MANAGE_TENANTS, MANAGE_ADMINS, VIEW_STATISTICS

### 2. Tenant Features  
- **Location**: `src/tenant/`, `src/posts/`, `src/messages/`, `src/email/`
- **Authentication**: Tenant Admin or Tenant User role required
- **Permissions**: Based on tenant-specific permissions
- **Isolation**: Data filtered by tenantId

### 3. Social Media Integration
- **Location**: `src/social/`
- **Platforms**: Facebook, Instagram, Gmail
- **Strategy**: API client services, token management

## 🔧 Configuration

### Environment Variables
- Application config (PORT, NODE_ENV)
- Database config (DB_*)
- JWT config (JWT_SECRET, JWT_EXPIRES_IN)
- CORS config (CORS_ORIGIN)

### Database Connection
- TypeORM with PostgreSQL
- Connection pooling
- Auto-sync for development (disabled in production)

## 📝 Code Style & Standards

### Naming Conventions
- **Files**: kebab-case (user.entity.ts)
- **Classes**: PascalCase (UserEntity)
- **Methods**: camelCase (createUser)
- **Constants**: UPPER_SNAKE_CASE (JWT_SECRET)

### Module Structure
```
feature/
├── dto/              # Data transfer objects
├── interfaces/       # TypeScript interfaces
├── feature.controller.ts
├── feature.service.ts
├── feature.module.ts
└── index.ts          # Exports
```

### DTO Pattern
- Input validation with class-validator
- Transformation with class-transformer
- Separate DTOs for create/update operations

### Service Pattern
- Business logic in services
- Controllers are thin, only handle HTTP
- Services are testable and reusable

## 🧪 Testing Strategy

### Unit Tests
- Test individual services
- Mock dependencies
- Focus on business logic

### Integration Tests
- Test module interactions
- Use test database
- Test API endpoints

### E2E Tests
- Test complete user flows
- Test authentication/authorization
- Test multi-tenant isolation

## 🚀 Performance Considerations

### Database
- Indexes on foreign keys
- Query optimization with relations
- Pagination for large datasets

### API
- Response caching (can be added)
- Rate limiting (can be added)
- Compression (can be added)

### Social Media
- Cache posts/messages in database
- Refresh only when needed
- Batch API requests

## 📦 Deployment

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker-compose up -d
```

## 🔍 Monitoring & Logging

### Application Logs
- Console logs in development
- File logs in production (with PM2)
- Logging interceptor for request/response

### Error Handling
- Global exception filter
- Structured error responses
- Stack traces in development only

### Audit Logs
- Track important actions
- Store in database (audit_logs table)
- Include user, action, timestamp, metadata

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [Instagram API](https://developers.facebook.com/docs/instagram-api/)
- [Gmail API](https://developers.google.com/gmail/api/)






