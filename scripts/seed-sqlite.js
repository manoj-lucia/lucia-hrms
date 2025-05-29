const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite database with initial data...');

  try {
    // Create a branch
    const branch = await prisma.branch.upsert({
      where: { id: '11111111-1111-1111-1111-111111111111' },
      update: {},
      create: {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Lucia Finserv HQ',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400001',
        phone: '+91 22 12345678',
        email: 'hq@luciafinserv.com'
      }
    });

    console.log('Created branch:', branch.name);

    // Create super admin user
    const hashedAdminPassword = await hash('admin123', 10);

    const superAdminUser = await prisma.user.upsert({
      where: { email: 'admin@luciafinserv.com' },
      update: {},
      create: {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'admin@luciafinserv.com',
        password: hashedAdminPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+91 9876543210',
        address: 'Mumbai, Maharashtra'
      }
    });

    console.log('Created super admin user:', superAdminUser.email);

    // Create super admin profile
    await prisma.superAdmin.upsert({
      where: { userId: superAdminUser.id },
      update: {},
      create: {
        userId: superAdminUser.id
      }
    });

    // Create branch manager user
    const hashedManagerPassword = await hash('manager123', 10);

    const branchManagerUser = await prisma.user.upsert({
      where: { email: 'manager@luciafinserv.com' },
      update: {},
      create: {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'manager@luciafinserv.com',
        password: hashedManagerPassword,
        role: 'BRANCH_MANAGER',
        status: 'ACTIVE',
        firstName: 'Branch',
        lastName: 'Manager',
        phone: '+91 9876543211'
      }
    });

    console.log('Created branch manager user:', branchManagerUser.email);

    // Create branch manager profile
    await prisma.branchManager.upsert({
      where: { userId: branchManagerUser.id },
      update: {},
      create: {
        userId: branchManagerUser.id,
        branchId: branch.id
      }
    });

    // We're not creating sample employees by default
    // This allows the admin to add real employees through the UI
    console.log('No sample employees created - admin can add real employees through the UI');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
