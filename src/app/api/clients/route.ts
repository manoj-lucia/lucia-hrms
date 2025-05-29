import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { encrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    // Protect route - only authenticated users with specific roles can access
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR,
      UserRole.BRANCH_ADMIN
    ]);

    if (!(authResult instanceof NextResponse)) {
      // Get search query from URL if present
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q')?.toLowerCase() || '';
      const branchId = searchParams.get('branchId');
      const industryFilter = searchParams.get('industry');
      const statusFilter = searchParams.get('status');

      // Build the where clause for filtering
      const where: any = {};

      // Add branch filter if provided
      if (branchId) {
        where.branchId = branchId;
      }

      // Add industry filter if provided
      if (industryFilter) {
        where.industry = industryFilter;
      }

      // Add status filter if provided (status is in the User model)
      if (statusFilter) {
        where.user = {
          status: statusFilter
        };
      }

      // Add search query if provided
      if (query) {
        where.OR = [
          {
            user: {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
              ]
            }
          },
          { companyName: { contains: query, mode: 'insensitive' } },
          { clientId: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } }
        ];
      }

      // Fetch clients with their user data
      const clients = await prisma.client.findMany({
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
              address: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true
            }
          },
          projects: {
            select: {
              id: true,
              name: true,
              status: true
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
      const formattedClients = clients.map(client => ({
        id: client.id,
        clientId: client.clientId,
        name: `${client.user.firstName} ${client.user.lastName}`,
        email: client.user.email,
        companyName: client.companyName || '',
        industry: client.industry || '',
        status: client.user.status,
        branch: client.branch.name,
        phone: client.user.phone || '',
        address: client.user.address || '',
        gstNumber: client.gstNumber || '',
        projectCount: client.projects.length,
        activeProjects: client.projects.filter(p => p.status === 'Active').length
      }));

      return NextResponse.json(formattedClients);
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Protect route - only admins and managers can create clients
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.BRANCH_ADMIN
    ]);

    if (!(authResult instanceof NextResponse)) {
      const data = await request.json();

      // Hash the password
      const hashedPassword = await hash(data.password, 10);

      // Create transaction to ensure both user and client are created
      const result = await prisma.$transaction(async (tx) => {
        // Create user first
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            role: UserRole.CLIENT,
            status: data.status || 'ACTIVE',
            phone: data.phone,
            address: data.address
          }
        });

        // Create client record
        const client = await tx.client.create({
          data: {
            userId: user.id,
            clientId: data.clientId,
            companyName: data.companyName,
            industry: data.industry,
            gstNumber: data.gstNumber,
            branchId: data.branchId
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

        // Log activity
        await tx.activityLog.create({
          data: {
            userId: authResult.id,
            action: 'CREATE_CLIENT',
            details: `Created client: ${client.clientId} - ${data.companyName || `${user.firstName} ${user.lastName}`}`
          }
        });

        return client;
      });

      return NextResponse.json({
        message: 'Client created successfully',
        client: result
      });
    }

    return authResult;
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
