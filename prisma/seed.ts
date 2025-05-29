import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { encrypt } from '../src/lib/encryption';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a super admin user
  const encryptedPassword = encrypt('admin123');

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: encryptedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      superAdmin: {
        create: {}
      }
    }
  });

  console.log('Created super admin:', superAdmin);

  // Create a branch
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Branch',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      pincode: '10001',
      phone: '+1 (555) 123-4567',
      email: 'main@example.com'
    }
  });

  console.log('Created branch:', branch);

  // Create a branch manager
  const branchManager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: hashedPassword,
      firstName: 'Branch',
      lastName: 'Manager',
      role: UserRole.BRANCH_MANAGER,
      status: UserStatus.ACTIVE,
      branchManager: {
        create: {
          branchId: branch.id
        }
      }
    }
  });

  console.log('Created branch manager:', branchManager);

  // Create a team leader with transaction to ensure proper relationship
  const { teamLeader, team } = await prisma.$transaction(async (tx) => {
    // Create team leader user
    const teamLeaderUser = await tx.user.upsert({
      where: { email: 'teamlead@example.com' },
      update: {},
      create: {
        email: 'teamlead@example.com',
        password: hashedPassword,
        firstName: 'Team',
        lastName: 'Leader',
        role: UserRole.TEAM_LEADER,
        status: UserStatus.ACTIVE,
        teamLeader: {
          create: {}
        }
      },
      include: {
        teamLeader: true
      }
    });

    // Create team with the team leader
    const newTeam = await tx.team.create({
      data: {
        name: 'Development Team',
        description: 'Software development team',
        branchId: branch.id,
        teamLeaderId: teamLeaderUser.teamLeader!.id
      }
    });

    return { teamLeader: teamLeaderUser, team: newTeam };
  });

  console.log('Created team leader:', teamLeader);
  console.log('Created team:', team);

  // Create an employee
  const employee = await prisma.user.upsert({
    where: { email: 'employee@example.com' },
    update: {},
    create: {
      email: 'employee@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      employee: {
        create: {
          employeeId: 'EMP001',
          designation: 'Software Engineer',
          department: 'Engineering',
          joiningDate: new Date(),
          salary: 75000,
          branchId: branch.id,
          teamId: team.id
        }
      }
    }
  });

  console.log('Created employee:', employee);

  console.log('Database seeding completed');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
