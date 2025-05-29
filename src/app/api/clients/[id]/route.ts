import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { encrypt } from '@/lib/encryption';

// GET: Fetch a single client by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Protect route - only authenticated users with specific roles can access
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR,
      UserRole.BRANCH_ADMIN
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        const { id } = params;

        // Fetch client with user data
        const client = await prisma.client.findUnique({
          where: { id },
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
                role: true
              }
            },
            branch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        if (!client) {
          return NextResponse.json(
            { error: 'Client not found' },
            { status: 404 }
          );
        }

        // Format the response
        const formattedClient = {
          id: client.id,
          userId: client.userId,
          clientId: client.clientId,
          firstName: client.user.firstName,
          lastName: client.user.lastName,
          email: client.user.email,
          companyName: client.companyName || '',
          industry: client.industry || '',
          status: client.user.status,
          branch: {
            id: client.branch.id,
            name: client.branch.name
          },
          phone: client.user.phone || '',
          address: client.user.address || '',
          gstNumber: client.gstNumber || ''
        };

        return NextResponse.json(formattedClient);
      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      } finally {
        await prisma.$disconnect().catch(console.error);
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update a client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Protect route - only admins can update clients
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR,
      UserRole.BRANCH_ADMIN
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        const { id } = params;
        const data = await request.json();

        // Validate required fields
        if (!data.firstName || !data.lastName || !data.email ||
            !data.clientId || !data.branchId) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        // Check if client exists
        const existingClient = await prisma.client.findUnique({
          where: { id },
          include: { user: true }
        });

        if (!existingClient) {
          return NextResponse.json(
            { error: 'Client not found' },
            { status: 404 }
          );
        }

        // Check if email is already taken by another user
        if (data.email !== existingClient.user.email) {
          const emailExists = await prisma.user.findUnique({
            where: { email: data.email }
          });

          if (emailExists) {
            return NextResponse.json(
              { error: 'Email is already in use' },
              { status: 400 }
            );
          }
        }

        // Check if clientId is already taken by another client
        if (data.clientId !== existingClient.clientId) {
          const clientIdExists = await prisma.client.findUnique({
            where: { clientId: data.clientId }
          });

          if (clientIdExists) {
            return NextResponse.json(
              { error: 'Client ID is already in use' },
              { status: 400 }
            );
          }
        }

        // Prepare user update data
        const userUpdateData: any = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          status: data.status || existingClient.user.status,
          phone: data.phone,
          address: data.address
        };

        // Hash password if provided
        if (data.password) {
          userUpdateData.password = await hash(data.password, 10);
        }

        // Update user and client in a transaction
        const updatedClient = await prisma.$transaction(async (tx) => {
          // Update user
          await tx.user.update({
            where: { id: existingClient.userId },
            data: userUpdateData
          });

          // Update client
          const client = await tx.client.update({
            where: { id },
            data: {
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
              },
              branch: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          });

          // Log activity
          await tx.activityLog.create({
            data: {
              userId: authResult.id,
              action: 'UPDATE_CLIENT',
              details: `Updated client: ${client.clientId} - ${client.companyName || `${client.user.firstName} ${client.user.lastName}`}`
            }
          });

          return client;
        });

        return NextResponse.json({
          message: 'Client updated successfully',
          client: updatedClient
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      } finally {
        await prisma.$disconnect().catch(console.error);
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Protect route - only admins can delete clients
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        const { id } = params;

        // Check if client exists
        const client = await prisma.client.findUnique({
          where: { id },
          include: { user: true }
        });

        if (!client) {
          return NextResponse.json(
            { error: 'Client not found' },
            { status: 404 }
          );
        }

        // Delete client and user in a transaction
        await prisma.$transaction(async (tx) => {
          // Delete client first (this will cascade to related records)
          await tx.client.delete({
            where: { id }
          });

          // Log activity
          await tx.activityLog.create({
            data: {
              userId: authResult.id,
              action: 'DELETE_CLIENT',
              details: `Deleted client: ${client.clientId} - ${client.companyName || `${client.user.firstName} ${client.user.lastName}`}`
            }
          });
        });

        return NextResponse.json({
          message: 'Client deleted successfully'
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      } finally {
        await prisma.$disconnect().catch(console.error);
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
