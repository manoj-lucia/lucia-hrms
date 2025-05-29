import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { encrypt, simpleEncode } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    // Protect route - only authenticated users with specific roles can access
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR,
      UserRole.BRANCH_ADMIN,
      UserRole.TEAM_LEADER
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        // Test database connection
        await prisma.$connect();

        // Get search query from URL if present
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.toLowerCase() || '';
        const branchId = searchParams.get('branchId');
        const departmentFilter = searchParams.get('department');
        const statusFilter = searchParams.get('status');

        // Build the where clause for filtering
        const where: any = {};

        // Add branch filter if provided
        if (branchId) {
          where.branchId = branchId;
        }

        // Add department filter if provided
        if (departmentFilter) {
          where.department = departmentFilter;
        }

        // Add status filter if provided (status is in the User model)
        if (statusFilter) {
          where.user = {
            status: statusFilter
          };
        }

        // Add search query if provided
        if (query) {
          // For SQLite, we need to use LIKE with LOWER() for case-insensitive search
          // Since SQLite doesn't support mode: 'insensitive'
          where.OR = [
            {
              user: {
                OR: [
                  { firstName: { contains: query } },
                  { lastName: { contains: query } },
                  { email: { contains: query } }
                ]
              }
            },
            { department: { contains: query } },
            { designation: { contains: query } }
          ];
        }

        // Fetch employees with their user data
        const employees = await prisma.employee.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
                phone: true,
                address: true,
                profileImage: true
              }
            },
            branch: {
              select: {
                id: true,
                name: true
              }
            },
            team: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            user: {
              firstName: 'asc'
            }
          }
        });

        // Transform the data for the frontend
        const formattedEmployees = employees.map(employee => ({
          id: employee.id,
          employeeId: employee.employeeId,
          name: `${employee.user.firstName} ${employee.user.lastName}`,
          email: employee.user.email,
          department: employee.department,
          designation: employee.designation,
          status: employee.user.status,
          branch: employee.branch.name,
          team: employee.team?.name || 'Not Assigned',
          joiningDate: employee.joiningDate,
          phone: employee.user.phone || '',
          address: employee.user.address || '',
          profileImage: employee.user.profileImage || null,
          salary: employee.salary,
          gender: null // Gender field not yet implemented in schema
        }));

        return NextResponse.json(formattedEmployees);
      } catch (dbError) {
        console.error('Database error:', dbError);

        return NextResponse.json(
          { error: 'Database connection error. Please make sure PostgreSQL is running and properly set up.' },
          { status: 503 }
        );
      } finally {
        // Disconnect from the database to prevent connection leaks
        await prisma.$disconnect().catch(console.error);
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Protect route - only admins and HR can create employees
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR,
      UserRole.BRANCH_ADMIN
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        const data = await request.json();
        console.log('Received employee data:', JSON.stringify(data, null, 2));

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'employeeId', 'department', 'designation', 'salary', 'joiningDate', 'branchId', 'bankAccountNo', 'ifscCode', 'panCard', 'aadharCard'];
        const missingFields = requiredFields.filter(field => !data[field]);

        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          return NextResponse.json(
            { error: `Missing required fields: ${missingFields.join(', ')}` },
            { status: 400 }
          );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email }
        });

        if (existingUser) {
          return NextResponse.json(
            { error: 'Email already in use' },
            { status: 400 }
          );
        }

        // Check if employee ID already exists
        const existingEmployee = await prisma.employee.findFirst({
          where: { employeeId: data.employeeId }
        });

        if (existingEmployee) {
          return NextResponse.json(
            { error: 'Employee ID already in use' },
            { status: 400 }
          );
        }

        // Encrypt the password with fallback
        let encryptedPassword;
        try {
          console.log('Attempting to encrypt password...');
          encryptedPassword = encrypt(data.password);
          console.log('Password encrypted successfully, length:', encryptedPassword.length);
        } catch (encryptError) {
          console.error('Primary encryption failed, trying fallback:', encryptError);
          try {
            // Use simple encoding as fallback
            encryptedPassword = 'SIMPLE:' + simpleEncode(data.password);
            console.log('Fallback encoding successful, length:', encryptedPassword.length);
          } catch (fallbackError) {
            console.error('Fallback encoding also failed:', fallbackError);
            return NextResponse.json(
              { error: 'Password encryption failed. Please try again.' },
              { status: 500 }
            );
          }
        }

        // Create transaction to ensure both user and employee are created
        console.log('Starting database transaction...');
        const result = await prisma.$transaction(async (tx) => {
          // Create user first
          console.log('Creating user...');
          const user = await tx.user.create({
            data: {
              email: data.email,
              password: encryptedPassword,
              firstName: data.firstName,
              lastName: data.lastName,
              role: UserRole.EMPLOYEE,
              status: data.status || 'ACTIVE',
              phone: data.phone,
              address: data.address,
              profileImage: data.profileImage || null
            }
          });
          console.log('User created with ID:', user.id);

        // Create employee record
        console.log('Creating employee...');
        const employee = await tx.employee.create({
          data: {
            userId: user.id,
            employeeId: data.employeeId,
            designation: data.designation,
            department: data.department,
            joiningDate: new Date(data.joiningDate),
            salary: parseFloat(data.salary),
            branchId: data.branchId,
            teamId: data.teamId || null,
            bankAccountNo: data.bankAccountNo,
            ifscCode: data.ifscCode,
            panCard: data.panCard,
            aadharCard: data.aadharCard
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true
              }
            }
          }
        });

        console.log('Employee created with ID:', employee.id);

        // Log activity
        console.log('Creating activity log...');
        await tx.activityLog.create({
          data: {
            userId: authResult.id,
            action: 'CREATE_EMPLOYEE',
            details: `Created employee: ${employee.employeeId} - ${user.firstName} ${user.lastName}`
          }
        });

        console.log('Transaction completed successfully');
        return employee;
      });

        return NextResponse.json({
          message: 'Employee created successfully',
          employee: result
        });
      } catch (error) {
        console.error('Error creating employee:', error);

        // Check for specific error types
        if (error instanceof Error) {
          if (error.message.includes('Unique constraint')) {
            if (error.message.includes('email')) {
              return NextResponse.json(
                { error: 'Email already in use' },
                { status: 400 }
              );
            }
            if (error.message.includes('employeeId')) {
              return NextResponse.json(
                { error: 'Employee ID already in use' },
                { status: 400 }
              );
            }
          }
        }

        return NextResponse.json(
          { error: 'Failed to create employee. Please try again.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
