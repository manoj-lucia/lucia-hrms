import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Run a simple query to verify the connection
    await prisma.$queryRaw`SELECT 1 as result`;
    
    return NextResponse.json({ 
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        database: 'disconnected',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  } finally {
    // Disconnect from the database to prevent connection leaks
    await prisma.$disconnect().catch(console.error);
  }
}
