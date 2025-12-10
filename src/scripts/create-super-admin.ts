import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { User } from '../entities/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole, AdminPermission } from '../common/enums/role.enum';

async function createSuperAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepository = dataSource.getRepository(User);

  // Check if super admin already exists
  const existingSuperAdmin = await userRepository.findOne({
    where: { role: UserRole.SUPER_ADMIN },
  });

  if (existingSuperAdmin) {
    console.log('❌ Super Admin already exists!');
    console.log(`Email: ${existingSuperAdmin.email}`);
    await app.close();
    return;
  }

  // Create super admin
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const superAdmin = userRepository.create({
    email: 'admin@hcrm.com',
    password: hashedPassword,
    fullName: 'Super Admin',
    role: UserRole.SUPER_ADMIN,
    adminPermissions: [
      AdminPermission.MANAGE_TENANTS,
      AdminPermission.MANAGE_ADMINS,
      AdminPermission.VIEW_STATISTICS,
    ],
    isActive: true,
  });

  await userRepository.save(superAdmin);

  console.log('✅ Super Admin created successfully!');
  console.log('Email: admin@hcrm.com');
  console.log('Password: Admin@123');
  console.log('⚠️  Please change the password after first login!');

  await app.close();
}

createSuperAdmin().catch((error) => {
  console.error('❌ Error creating super admin:', error);
  process.exit(1);
});

