const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with initial data...');
  
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
    
    // Create some employees
    const departments = ['Engineering', 'Finance', 'Marketing', 'Human Resources', 'Operations'];
    const designations = ['Software Developer', 'Financial Analyst', 'Marketing Specialist', 'HR Manager', 'Operations Manager'];
    
    for (let i = 0; i < 5; i++) {
      const hashedPassword = await hash(`employee${i+1}`, 10);
      
      const employeeUser = await prisma.user.upsert({
        where: { email: `employee${i+1}@luciafinserv.com` },
        update: {},
        create: {
          email: `employee${i+1}@luciafinserv.com`,
          password: hashedPassword,
          role: 'EMPLOYEE',
          status: 'ACTIVE',
          firstName: `Employee`,
          lastName: `${i+1}`,
          phone: `+91 98765432${i+1}`,
          address: 'Mumbai, Maharashtra'
        }
      });
      
      const employee = await prisma.employee.upsert({
        where: { userId: employeeUser.id },
        update: {},
        create: {
          userId: employeeUser.id,
          employeeId: `EMP00${i+1}`,
          designation: designations[i % designations.length],
          department: departments[i % departments.length],
          joiningDate: new Date(2023, i, 1), // Different joining dates
          salary: 50000 + (i * 10000),
          branchId: branch.id
        }
      });
      
      console.log('Created employee:', employee.employeeId);
      
      // Create attendance records for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: employee.id,
            date: today
          }
        },
        update: {},
        create: {
          employeeId: employee.id,
          date: today,
          checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
          checkOut: i < 4 ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0) : null,
          status: i < 4 ? 'Present' : 'Absent',
          workHours: i < 4 ? 9 : 0
        }
      });
      
      // Create some activity logs
      const activities = [
        'updated their profile',
        'completed training',
        'submitted expense report',
        'marked task as complete',
        'requested time off'
      ];
      
      const timeAgo = new Date();
      timeAgo.setHours(timeAgo.getHours() - (i + 1));
      
      await prisma.activityLog.create({
        data: {
          userId: employeeUser.id,
          action: activities[i],
          details: `Employee ${i+1} ${activities[i]}`,
          timestamp: timeAgo
        }
      });
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
