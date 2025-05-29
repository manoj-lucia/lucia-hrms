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
        
        // Fetch all branches
        const branches = await prisma.branch.findMany({
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            country: true
          },
          orderBy: {
            name: 'asc'
          }
        });
        
        return NextResponse.json(branches);
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
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
