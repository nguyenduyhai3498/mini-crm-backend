# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Tất cả các endpoint (trừ login) đều yêu cầu JWT token trong header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication APIs

### 1.1. Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@hcrm.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@hcrm.com",
    "fullName": "Super Admin",
    "role": "super_admin",
    "tenantId": null,
    "adminPermissions": ["manage_tenants", "manage_admins", "view_statistics"],
    "tenantPermissions": []
  }
}
```

### 1.2. Change Password
**Endpoint:** `POST /auth/change-password`

**Request Body:**
```json
{
  "oldPassword": "Admin@123",
  "newPassword": "NewPassword@123"
}
```

### 1.3. Get Current User
**Endpoint:** `POST /auth/me`

---

## 2. Admin APIs

### 2.1. Tenant Management

#### Create Tenant
**Endpoint:** `POST /admin/tenants`

**Permissions Required:** `MANAGE_TENANTS`

**Request Body:**
```json
{
  "name": "ABC Company",
  "description": "Marketing agency",
  "maxSocialPages": 10
}
```

#### Get All Tenants
**Endpoint:** `GET /admin/tenants?page=1&limit=10`

**Permissions Required:** `MANAGE_TENANTS` or `VIEW_STATISTICS`

#### Get Tenant by ID
**Endpoint:** `GET /admin/tenants/:id`

#### Update Tenant
**Endpoint:** `PUT /admin/tenants/:id`

**Request Body:**
```json
{
  "name": "ABC Company Updated",
  "maxSocialPages": 15,
  "isActive": true
}
```

#### Delete Tenant
**Endpoint:** `DELETE /admin/tenants/:id`

### 2.2. Admin Management

#### Create Admin
**Endpoint:** `POST /admin/admins`

**Permissions Required:** `MANAGE_ADMINS` (Super Admin only)

**Request Body:**
```json
{
  "email": "admin2@hcrm.com",
  "password": "Admin@123",
  "fullName": "Admin User",
  "role": "admin",
  "adminPermissions": ["manage_tenants", "view_statistics"]
}
```

#### Get All Admins
**Endpoint:** `GET /admin/admins`

#### Update Admin
**Endpoint:** `PUT /admin/admins/:id`

#### Delete Admin
**Endpoint:** `DELETE /admin/admins/:id`

### 2.3. Statistics
**Endpoint:** `GET /admin/statistics`

**Response:**
```json
{
  "totalTenants": 5,
  "activeTenants": 4,
  "totalUsers": 20,
  "totalAdmins": 2
}
```

---

## 3. Tenant APIs

### 3.1. Employee Management

#### Create Employee
**Endpoint:** `POST /tenant/employees`

**Permissions Required:** `MANAGE_EMPLOYEES` (Tenant Admin only)

**Request Body:**
```json
{
  "email": "employee@company.com",
  "password": "Employee@123",
  "fullName": "John Doe",
  "tenantPermissions": ["view_posts", "view_messages"],
  "authorizedPageIds": ["page-id-1", "page-id-2"]
}
```

#### Get All Employees
**Endpoint:** `GET /tenant/employees`

#### Update Employee
**Endpoint:** `PUT /tenant/employees/:id`

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "tenantPermissions": ["view_posts", "create_posts", "view_messages"],
  "authorizedPageIds": ["page-id-1", "page-id-2", "page-id-3"],
  "isActive": true
}
```

#### Delete Employee
**Endpoint:** `DELETE /tenant/employees/:id`

### 3.2. Social Page Management

#### Connect Social Page
**Endpoint:** `POST /tenant/social-pages`

**Permissions Required:** `MANAGE_SOCIAL_PAGES` (Tenant Admin only)

**Request Body:**
```json
{
  "name": "My Facebook Page",
  "platform": "facebook",
  "pageId": "123456789",
  "accessToken": "EAAxxxxxxxxxx",
  "refreshToken": "optional",
  "tokenExpiresAt": "2024-12-31T23:59:59Z",
  "profilePicture": "https://example.com/profile.jpg",
  "metadata": {}
}
```

#### Get All Social Pages
**Endpoint:** `GET /tenant/social-pages`

#### Update Social Page
**Endpoint:** `PUT /tenant/social-pages/:id`

#### Delete Social Page
**Endpoint:** `DELETE /tenant/social-pages/:id`

---

## 4. Posts APIs

### 4.1. Get Posts from Page
**Endpoint:** `GET /posts/page/:pageId?since=2024-01-01&until=2024-12-31&limit=25&refresh=true`

**Permissions Required:** `VIEW_POSTS`

**Query Parameters:**
- `since` (optional): Start date (ISO 8601)
- `until` (optional): End date (ISO 8601)
- `limit` (optional): Number of posts (default: 25)
- `refresh` (optional): Fetch fresh data from social platform (default: false)

**Response:**
```json
[
  {
    "id": "uuid",
    "externalId": "123456789_987654321",
    "socialPageId": "page-uuid",
    "platform": "facebook",
    "content": "This is a post",
    "mediaUrls": ["https://example.com/image.jpg"],
    "likes": 100,
    "comments": 50,
    "shares": 10,
    "postedAt": "2024-01-15T10:00:00Z",
    "createdAt": "2024-01-15T10:05:00Z"
  }
]
```

### 4.2. Get Post Detail
**Endpoint:** `GET /posts/page/:pageId/post/:postId?refresh=true`

### 4.3. Create Post
**Endpoint:** `POST /posts`

**Permissions Required:** `CREATE_POSTS`

**Request Body:**
```json
{
  "socialPageId": "page-uuid",
  "platform": "facebook",
  "content": "New post content",
  "mediaUrls": ["https://example.com/image.jpg"]
}
```

---

## 5. Messages APIs

### 5.1. Get Messages from Page
**Endpoint:** `GET /messages/page/:pageId?since=2024-01-01&until=2024-12-31&limit=25&refresh=true&conversationId=xxx`

**Permissions Required:** `VIEW_MESSAGES`

### 5.2. Get Conversations
**Endpoint:** `GET /messages/page/:pageId/conversations`

**Response:**
```json
[
  {
    "conversationId": "123456789",
    "lastMessageAt": "2024-01-15T10:00:00Z",
    "messageCount": 10,
    "unreadCount": 2,
    "lastMessage": {
      "id": "uuid",
      "content": "Hello",
      "senderId": "987654321",
      "senderName": "User Name",
      "isFromPage": false,
      "sentAt": "2024-01-15T10:00:00Z"
    }
  }
]
```

### 5.3. Send Message
**Endpoint:** `POST /messages/send`

**Permissions Required:** `MANAGE_MESSAGES`

**Request Body:**
```json
{
  "socialPageId": "page-uuid",
  "recipientId": "123456789",
  "content": "Hello, how can I help you?"
}
```

### 5.4. Mark Message as Read
**Endpoint:** `PUT /messages/page/:pageId/message/:messageId/read`

### 5.5. Mark Conversation as Read
**Endpoint:** `PUT /messages/page/:pageId/conversation/:conversationId/read`

---

## 6. Email APIs

### 6.1. Send Email
**Endpoint:** `POST /email/send`

**Permissions Required:** `SEND_EMAILS`

**Request Body:**
```json
{
  "socialPageId": "gmail-account-uuid",
  "to": "recipient@example.com",
  "subject": "Subject line",
  "body": "Email body content",
  "cc": "cc@example.com",
  "bcc": "bcc@example.com"
}
```

### 6.2. Reply to Email
**Endpoint:** `POST /email/reply`

**Request Body:**
```json
{
  "socialPageId": "gmail-account-uuid",
  "threadId": "thread-id-from-gmail",
  "messageId": "message-id-from-gmail",
  "body": "Reply content"
}
```

### 6.3. Get Emails
**Endpoint:** `GET /email/account/:accountId?maxResults=25&after=2024-01-01&before=2024-12-31`

### 6.4. Get Email Detail
**Endpoint:** `GET /email/account/:accountId/message/:messageId`

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Error description",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/endpoint"
}
```

Common HTTP Status Codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hcrm.com",
    "password": "Admin@123"
  }'
```

### Create Tenant Example
```bash
curl -X POST http://localhost:3000/api/admin/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "ABC Company",
    "description": "Marketing agency",
    "maxSocialPages": 10
  }'
```

### Get Posts Example
```bash
curl -X GET "http://localhost:3000/api/posts/page/PAGE_ID?limit=10&refresh=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```


