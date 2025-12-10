# 🚀 Quick Start Guide

Hướng dẫn nhanh để chạy HCRM Backend trong 5 phút!

## ⚡ Cài đặt nhanh

### 1. Prerequisites

Đảm bảo đã cài đặt:
- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- ✅ Git

### 2. Clone & Install (1 phút)

```bash
# Clone repository
git clone <repository-url>
cd backend/src

# Install dependencies
npm install
```

### 3. Database Setup (2 phút)

```bash
# Tạo database
createdb hcrm

# Hoặc dùng psql
psql -U postgres
CREATE DATABASE hcrm;
\q
```

### 4. Configuration (1 phút)

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Chỉnh sửa `.env` nếu cần (mặc định đã OK cho local):

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres  # Đổi nếu bạn set password khác
DB_DATABASE=hcrm
DB_SYNC=true

JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

### 5. Start Application (1 phút)

```bash
# Development mode
npm run start:dev
```

Đợi đến khi thấy:
```
🚀 Application is running on: http://localhost:3000/api
```

### 6. Create Super Admin

Mở terminal mới:

```bash
npm run create:superadmin
```

Thông tin đăng nhập:
- **Email**: `admin@hcrm.com`
- **Password**: `Admin@123`

---

## ✅ Test API

### Option 1: Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hcrm.com","password":"Admin@123"}'
```

Lưu lại `access_token` từ response!

### Option 2: Using Postman

1. Import file `postman_collection.json`
2. Chạy request "Login" trong folder "Authentication"
3. Token sẽ tự động được lưu vào biến collection

---

## 🎯 Next Steps

### 1. Tạo Tenant đầu tiên

```bash
curl -X POST http://localhost:3000/api/admin/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "My First Company",
    "description": "Test tenant",
    "maxSocialPages": 5
  }'
```

### 2. Tạo Tenant Admin

Tạo user admin cho tenant vừa tạo:

```bash
curl -X POST http://localhost:3000/api/tenant/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "tenant@company.com",
    "password": "Tenant@123",
    "fullName": "Tenant Admin",
    "tenantPermissions": [
      "manage_social_pages",
      "view_posts",
      "create_posts",
      "manage_messages",
      "view_messages",
      "manage_employees",
      "send_emails"
    ]
  }'
```

### 3. Kết nối Social Media Page

Để kết nối Facebook/Instagram/Gmail, bạn cần:

#### Facebook Page
1. Tạo ứng dụng tại [Facebook Developers](https://developers.facebook.com/)
2. Lấy Page Access Token
3. Kết nối:

```bash
curl -X POST http://localhost:3000/api/tenant/social-pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN" \
  -d '{
    "name": "My Facebook Page",
    "platform": "facebook",
    "pageId": "YOUR_PAGE_ID",
    "accessToken": "YOUR_ACCESS_TOKEN"
  }'
```

#### Gmail Account
1. Tạo OAuth 2.0 credentials tại [Google Cloud Console](https://console.cloud.google.com/)
2. Lấy access token thông qua OAuth flow
3. Kết nối tương tự Facebook

### 4. Test các chức năng

#### Xem bài viết từ Facebook
```bash
curl -X GET "http://localhost:3000/api/posts/page/PAGE_ID?refresh=true&limit=10" \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN"
```

#### Đăng bài lên Facebook
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN" \
  -d '{
    "socialPageId": "YOUR_PAGE_ID",
    "platform": "facebook",
    "content": "Hello from HCRM!"
  }'
```

#### Xem tin nhắn
```bash
curl -X GET "http://localhost:3000/api/messages/page/PAGE_ID?refresh=true" \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN"
```

---

## 📚 Tài liệu chi tiết

- [API Documentation](./API_DOCUMENTATION.md) - Tất cả API endpoints
- [Database Setup](./DATABASE_SETUP.md) - Hướng dẫn database chi tiết
- [Deployment Guide](./DEPLOYMENT.md) - Hướng dẫn deploy production
- [Project Structure](./PROJECT_STRUCTURE.md) - Cấu trúc code

---

## 🐛 Troubleshooting

### Database connection error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Giải pháp:**
- Kiểm tra PostgreSQL đang chạy: `sudo systemctl status postgresql`
- Kiểm tra credentials trong `.env`

### Port already in use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Giải pháp:**
- Đổi port trong `.env`: `PORT=3001`
- Hoặc kill process đang dùng port 3000

### Super admin already exists

```
❌ Super Admin already exists!
```

**Giải pháp:**
- Đây không phải lỗi! Super admin đã được tạo rồi
- Dùng thông tin đã có để đăng nhập

### Token expired

```
401 Unauthorized: Token has expired
```

**Giải pháp:**
- Login lại để lấy token mới
- Token mặc định có thời hạn 24h

---

## 💡 Tips

### Development Tips

1. **Auto-restart khi thay đổi code**
   ```bash
   npm run start:dev  # Đã có nodemon tích hợp
   ```

2. **Xem logs chi tiết**
   - Logs sẽ hiện trong console
   - Mỗi request đều được log với thời gian xử lý

3. **Test API nhanh**
   - Dùng Postman collection đã có sẵn
   - Hoặc dùng REST Client extension trong VS Code

### Security Tips

1. **Đổi JWT secret**
   ```bash
   # Generate secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **Đổi password admin**
   - Đăng nhập và gọi API `/auth/change-password`

3. **Disable DB_SYNC trong production**
   ```env
   DB_SYNC=false
   ```

### Performance Tips

1. **Sử dụng pagination**
   ```
   GET /admin/tenants?page=1&limit=10
   ```

2. **Cache social data**
   - Set `refresh=false` khi không cần data mới
   - Database sẽ trả về data đã cache

3. **Limit API calls**
   - Social media có rate limits
   - Chỉ refresh khi cần thiết

---

## 🎉 Xong!

Bạn đã sẵn sàng sử dụng HCRM Backend!

### Next Actions:
- [ ] Đọc [API Documentation](./API_DOCUMENTATION.md) để biết tất cả endpoints
- [ ] Kết nối Facebook/Instagram/Gmail pages
- [ ] Tạo tenant và users
- [ ] Test các chức năng posts, messages, emails
- [ ] Deploy lên production (xem [Deployment Guide](./DEPLOYMENT.md))

### Need Help?
- Xem các file documentation trong project
- Check logs để debug
- Liên hệ team phát triển

**Happy Coding! 🚀**

