// This script removes all sample data from the database, keeping only admin users
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database - removing sample data...');
  
  try {
    // Delete all attendance records
    console.log('Deleting attendance records...');
    await prisma.attendance.deleteMany({});
    
    // Delete all activity logs
    console.log('Deleting activity logs...');
    await prisma.activityLog.deleteMany({});
    
    // Delete all employees (this will cascade to related records)
    console.log('Deleting employees...');
    await prisma.employee.deleteMany({});
    
    // Delete all employee users
    // First, find all employee users
    const employeeUsers = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE'
      }
    });
    
    // Delete each employee user
    console.log('Deleting employee users...');
    for (const user of employeeUsers) {
      await prisma.user.delete({
        where: {
          id: user.id
        }
      });
    }
    
    // Keep only admin and manager users
    console.log('Database cleaned successfully!');
    
    // Count remaining users
    const adminCount = await prisma.user.count({
      where: {
        role: 'SUPER_ADMIN'
      }
    });
    
    const managerCount = await prisma.user.count({
      where: {
        role: 'BRANCH_MANAGER'
      }
    });
    
    console.log(`Remaining users: ${adminCount} admin(s), ${managerCount} manager(s)`);
    console.log('The database is now ready for real data entry.');
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
