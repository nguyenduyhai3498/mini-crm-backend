# HCRM - Multi-Tenant Social Media Management System

Hệ thống quản lý trang social media đa khách hàng (multi-tenant) với đầy đủ tính năng quản trị và tích hợp với Facebook, Instagram, Gmail.

## 🚀 Quick Start

**Muốn chạy ngay? Xem [Quick Start Guide](./QUICK_START.md)** - Chạy được trong 5 phút!

---

## 🚀 Tính năng chính

### 1. Chức năng của Admin
- ✅ Quản lý khách hàng (Tenant)
- ✅ Quản lý các trang kết nối (API token) của khách hàng
- ✅ Giới hạn số trang kết nối cho mỗi tenant
- ✅ Phân quyền tài khoản admin (Super Admin, Admin)
- ✅ Xem thống kê hệ thống

### 2. Chức năng của Tenant
- ✅ Quản lý trang social (Facebook, Instagram, Gmail)
- ✅ Xem bài viết từ các trang social
- ✅ Lọc bài viết theo thời gian
- ✅ Xem chi tiết bài viết
- ✅ Quản lý tin nhắn theo trang
- ✅ Phân quyền xem tin nhắn theo trang
- ✅ Đăng nhập, đăng xuất, đổi mật khẩu
- ✅ Quản lý nhân viên
- ✅ Phân quyền nhân viên chi tiết
- ✅ Đăng bài lên social media
- ✅ Gửi email bằng Gmail đã kết nối

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

## 🔧 Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd backend/src
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình môi trường**
```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin của bạn
```

4. **Tạo database**
```bash
createdb hcrm
# hoặc sử dụng pgAdmin/psql để tạo database
```

5. **Chạy ứng dụng**

Development:
```bash
npm run start:dev
```

Production:
```bash
npm run build
npm run start:prod
```

## 📚 Cấu trúc API

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/me` - Lấy thông tin user hiện tại

### Admin Routes
- `POST /api/admin/tenants` - Tạo tenant mới
- `GET /api/admin/tenants` - Lấy danh sách tenant
- `GET /api/admin/tenants/:id` - Lấy chi tiết tenant
- `PUT /api/admin/tenants/:id` - Cập nhật tenant
- `DELETE /api/admin/tenants/:id` - Xóa tenant
- `POST /api/admin/admins` - Tạo admin mới
- `GET /api/admin/admins` - Lấy danh sách admin
- `PUT /api/admin/admins/:id` - Cập nhật admin
- `DELETE /api/admin/admins/:id` - Xóa admin
- `GET /api/admin/statistics` - Xem thống kê

### Tenant Routes
- `POST /api/tenant/employees` - Tạo nhân viên
- `GET /api/tenant/employees` - Lấy danh sách nhân viên
- `PUT /api/tenant/employees/:id` - Cập nhật nhân viên
- `DELETE /api/tenant/employees/:id` - Xóa nhân viên
- `POST /api/tenant/social-pages` - Kết nối trang social
- `GET /api/tenant/social-pages` - Lấy danh sách trang
- `PUT /api/tenant/social-pages/:id` - Cập nhật trang
- `DELETE /api/tenant/social-pages/:id` - Xóa kết nối trang

### Posts Routes
- `GET /api/posts/page/:pageId` - Lấy bài viết từ trang
- `GET /api/posts/page/:pageId/post/:postId` - Chi tiết bài viết
- `POST /api/posts` - Đăng bài mới

### Messages Routes
- `GET /api/messages/page/:pageId` - Lấy tin nhắn từ trang
- `GET /api/messages/page/:pageId/conversations` - Lấy danh sách cuộc hội thoại
- `POST /api/messages/send` - Gửi tin nhắn
- `PUT /api/messages/page/:pageId/message/:messageId/read` - Đánh dấu đã đọc

### Email Routes
- `POST /api/email/send` - Gửi email
- `POST /api/email/reply` - Trả lời email
- `GET /api/email/account/:accountId` - Lấy danh sách email
- `GET /api/email/account/:accountId/message/:messageId` - Chi tiết email

## 🔐 Phân quyền

### Admin Permissions
- `MANAGE_TENANTS` - Quản lý tenant
- `MANAGE_ADMINS` - Quản lý admin
- `VIEW_STATISTICS` - Xem thống kê

### Tenant Permissions
- `MANAGE_SOCIAL_PAGES` - Quản lý trang social
- `VIEW_POSTS` - Xem bài viết
- `CREATE_POSTS` - Đăng bài
- `MANAGE_MESSAGES` - Quản lý tin nhắn
- `VIEW_MESSAGES` - Xem tin nhắn
- `MANAGE_EMPLOYEES` - Quản lý nhân viên
- `SEND_EMAILS` - Gửi email

## 🗃️ Database Schema

### Entities
- **User** - Người dùng (Admin, Tenant Admin, Tenant User)
- **Tenant** - Khách hàng
- **SocialPage** - Trang social media đã kết nối
- **Post** - Bài viết từ social media
- **Message** - Tin nhắn từ social media
- **AuditLog** - Log hoạt động

## 🔌 Tích hợp Social Media

### Facebook
- Lấy bài viết từ Facebook Page
- Đăng bài lên Facebook Page
- Quản lý tin nhắn Facebook Messenger

### Instagram
- Lấy bài viết từ Instagram Business Account
- Đăng ảnh lên Instagram
- Xem và trả lời comment

### Gmail
- Lấy email từ Gmail
- Gửi email
- Trả lời email

## 📝 Ghi chú

### Tạo Super Admin đầu tiên
Sau khi chạy ứng dụng lần đầu, bạn cần tạo Super Admin bằng cách chạy script hoặc insert trực tiếp vào database:

```sql
INSERT INTO users (id, email, password, "fullName", role, "adminPermissions", "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@hcrm.com',
  -- Password: Admin@123 (hashed với bcrypt)
  '$2b$10$rXqYqXrVxGxOXKXxXxXxXeXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
  'Super Admin',
  'super_admin',
  '{manage_tenants,manage_admins,view_statistics}',
  true,
  NOW(),
  NOW()
);
```

**Lưu ý:** Bạn cần hash password bằng bcrypt trước khi insert. Hoặc sử dụng API để tạo admin đầu tiên.

### Lấy Access Token cho Social Media

#### Facebook
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo ứng dụng và cấu hình Page Access Token
3. Sử dụng token để kết nối trang

#### Instagram
1. Cần có Instagram Business Account
2. Kết nối với Facebook Page
3. Sử dụng Facebook Graph API để lấy Instagram token

#### Gmail
1. Tạo OAuth 2.0 credentials trong Google Cloud Console
2. Sử dụng OAuth flow để lấy access token và refresh token

## 🛠️ Development

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

## 📦 Build

```bash
npm run build
```

## 🚢 Deploy

1. Build ứng dụng
2. Set environment variables
3. Chạy migrations (nếu có)
4. Start ứng dụng

```bash
npm run build
NODE_ENV=production npm run start:prod
```

## 📄 License

[UNLICENSED]

## 👥 Support

Liên hệ team phát triển để được hỗ trợ.
