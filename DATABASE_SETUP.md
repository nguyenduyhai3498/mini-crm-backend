# Database Setup Guide

## PostgreSQL Installation

### Windows
1. Download PostgreSQL from [official website](https://www.postgresql.org/download/windows/)
2. Run installer and follow instructions
3. Remember your postgres password

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS
```bash
brew install postgresql
brew services start postgresql
```

## Create Database

### Using psql
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hcrm;

# Create user (optional)
CREATE USER hcrm_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hcrm TO hcrm_user;

# Exit
\q
```

### Using pgAdmin
1. Open pgAdmin
2. Right-click on "Databases"
3. Create > Database
4. Name: `hcrm`
5. Save

## Configure Application

1. Copy `.env.example` to `.env`
```bash
cp .env.example .env
```

2. Update database credentials in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=hcrm
DB_SYNC=true  # Auto-create tables (development only)
DB_LOGGING=false
```

## Initialize Database

### Auto-sync (Development)
Set `DB_SYNC=true` in `.env` and start the application. Tables will be created automatically.

```bash
npm run start:dev
```

### Manual Setup (Production)
For production, you should use migrations instead of auto-sync.

1. Set `DB_SYNC=false` in `.env`

2. Generate migration:
```bash
npm run typeorm migration:generate -- -n InitialMigration
```

3. Run migration:
```bash
npm run typeorm migration:run
```

## Create Super Admin

After database is set up, create the first super admin:

```bash
npm run create:superadmin
```

This will create:
- Email: `admin@hcrm.com`
- Password: `Admin@123`

**⚠️ Important:** Change the password after first login!

## Database Schema

### Tables Created

1. **users** - All system users (Admin, Tenant Admin, Tenant Users)
   - Stores credentials, roles, permissions
   - Links to tenants for tenant users

2. **tenants** - Customer accounts
   - Has max social pages limit
   - Can be activated/deactivated

3. **social_pages** - Connected social media accounts
   - Stores access tokens (should be encrypted in production)
   - Links to tenant
   - Supports Facebook, Instagram, Gmail

4. **posts** - Social media posts
   - Cached from social platforms
   - Includes engagement metrics

5. **messages** - Social media messages
   - Cached from social platforms
   - Grouped by conversations

6. **audit_logs** - System activity logs
   - Tracks all important actions
   - For security and compliance

7. **user_page_permissions** - Junction table
   - Maps users to pages they can access
   - For granular permission control

## Backup and Restore

### Backup
```bash
pg_dump -U postgres hcrm > backup.sql
```

### Restore
```bash
psql -U postgres hcrm < backup.sql
```

## Troubleshooting

### Connection refused
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Check port: default is 5432
- Check firewall settings

### Authentication failed
- Verify username and password in `.env`
- Check pg_hba.conf for authentication method

### Database doesn't exist
- Create database manually: `createdb hcrm`
- Or use psql/pgAdmin to create

### Tables not created
- Check `DB_SYNC=true` in `.env`
- Check database permissions
- Look for errors in application logs

## Security Recommendations

### Production
1. Set `DB_SYNC=false` - Use migrations instead
2. Use strong database password
3. Limit database user permissions
4. Enable SSL connection
5. Regular backups
6. Encrypt sensitive data (tokens, passwords)

### Environment Variables
```env
# Production settings
DB_SYNC=false
DB_LOGGING=false
NODE_ENV=production
```

## Monitoring

### Check database size
```sql
SELECT pg_size_pretty(pg_database_size('hcrm'));
```

### Check table sizes
```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check connections
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'hcrm';
```






