# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed
- PM2 or similar process manager (for production)
- Reverse proxy (Nginx/Apache) - optional but recommended

## Environment Setup

### 1. Production Environment Variables

Create `.env` file:

```env
# Application
PORT=3000
NODE_ENV=production

# CORS - Set to your frontend domain
CORS_ORIGIN=https://yourdomain.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=hcrm_user
DB_PASSWORD=strong_password_here
DB_DATABASE=hcrm
DB_SYNC=false  # IMPORTANT: Never use true in production
DB_LOGGING=false

# JWT - MUST change these!
JWT_SECRET=generate-a-very-long-random-secret-key-here-use-openssl-rand-base64-32
JWT_EXPIRES_IN=24h
```

### 2. Generate Secure JWT Secret

```bash
# Linux/macOS
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Installation Steps

### 1. Clone and Install

```bash
git clone <repository-url>
cd backend/src
npm install --production
```

### 2. Build Application

```bash
npm run build
```

This creates optimized production build in `dist/` folder.

### 3. Database Setup

```bash
# Create database
createdb hcrm

# Run migrations (if you have them)
npm run typeorm migration:run

# Create super admin
npm run create:superadmin
```

### 4. Test Production Build

```bash
npm run start:prod
```

Visit `http://localhost:3000/api` to verify it's working.

## Process Management with PM2

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'hcrm-api',
    script: 'dist/main.js',
    instances: 2,  // or 'max' for all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
}
```

### 3. Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs hcrm-api

# Monitor
pm2 monit

# Restart
pm2 restart hcrm-api

# Stop
pm2 stop hcrm-api
```

### 4. Auto-start on System Boot

```bash
pm2 startup
pm2 save
```

## Nginx Reverse Proxy (Recommended)

### 1. Install Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/hcrm-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Increase body size for file uploads
    client_max_body_size 10M;
}
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/hcrm-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is set up automatically
```

## Docker Deployment (Alternative)

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=hcrm
      - POSTGRES_USER=hcrm_user
      - POSTGRES_PASSWORD=strong_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Deploy with Docker

```bash
docker-compose up -d
```

## Monitoring and Maintenance

### 1. Application Logs

```bash
# PM2 logs
pm2 logs hcrm-api

# Or check log files
tail -f logs/out.log
tail -f logs/err.log
```

### 2. Database Backups

Create backup script `/home/user/backup-db.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"
mkdir -p $BACKUP_DIR

pg_dump -U hcrm_user hcrm > $BACKUP_DIR/hcrm_$DATE.sql
gzip $BACKUP_DIR/hcrm_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "hcrm_*.sql.gz" -mtime +7 -delete
```

Add to crontab:

```bash
crontab -e
# Add line:
0 2 * * * /home/user/backup-db.sh
```

### 3. System Monitoring

Install monitoring tools:

```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-logrotate
```

### 4. Health Check Endpoint

The application should have a health check endpoint. You can add this to your monitoring:

```bash
# Check if application is running
curl http://localhost:3000/api/health
```

## Security Checklist

- [ ] Changed default JWT secret
- [ ] Set strong database password
- [ ] Disabled DB_SYNC in production
- [ ] Configured CORS properly
- [ ] Set up SSL/HTTPS
- [ ] Configured firewall (allow only 80, 443)
- [ ] Regular database backups
- [ ] Log rotation configured
- [ ] Updated all dependencies
- [ ] Changed default admin password
- [ ] Set up monitoring/alerts

## Troubleshooting

### Application won't start

1. Check logs: `pm2 logs hcrm-api`
2. Verify database connection
3. Check all environment variables
4. Ensure port 3000 is available

### High memory usage

1. Check for memory leaks in logs
2. Reduce PM2 instances
3. Increase `max_memory_restart` in PM2 config

### Database connection errors

1. Verify database is running: `sudo systemctl status postgresql`
2. Check credentials in `.env`
3. Verify database exists
4. Check firewall rules

### 502 Bad Gateway (Nginx)

1. Check if Node.js app is running: `pm2 status`
2. Verify port in Nginx config matches application
3. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

## Scaling

### Horizontal Scaling

Use PM2 cluster mode:

```javascript
// ecosystem.config.js
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster'
```

### Load Balancing

For multiple servers, use Nginx load balancer:

```nginx
upstream backend {
    least_conn;
    server server1.example.com:3000;
    server server2.example.com:3000;
    server server3.example.com:3000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

## Updates and Maintenance

### Updating Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Build
npm run build

# Restart with PM2
pm2 restart hcrm-api

# Check logs
pm2 logs hcrm-api
```

### Zero-downtime Deployment

```bash
# PM2 graceful reload
pm2 reload hcrm-api
```






