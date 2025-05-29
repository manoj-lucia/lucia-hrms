import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Protect route - only authenticated users can access
    const authResult = await protectRoute(request);
    
    if (!(authResult instanceof NextResponse)) {
      try {
        // Test database connection
        await prisma.$connect();
        
        // Get branch filter from query params if present
        const { searchParams } = new URL(request.url);
        const branchId = searchParams.get('branchId');
        
        // Build where clause
        const where = branchId ? { branchId } : {};
        
        // Fetch teams
        const teams = await prisma.team.findMany({
          where,
          select: {
            id: true,
            name: true,
            branchId: true,
            branch: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        });
        
        // Format the response
        const formattedTeams = teams.map(team => ({
          id: team.id,
          name: team.name,
          branchId: team.branchId,
          branchName: team.branch.name
        }));
        
        return NextResponse.json(formattedTeams);
      } catch (dbError) {
        console.error('Database error:', dbError);
        
        return NextResponse.json(
          { error: 'Database connection error. Please make sure the database is properly set up.' },
          { status: 503 }
        );
      } finally {
        // Disconnect from the database to prevent connection leaks
        await prisma.$disconnect().catch(console.error);
      }
    }
    
    return authResult;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
