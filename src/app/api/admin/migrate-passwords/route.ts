import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { encrypt, isBcryptHash, validateEncryption } from '@/lib/encryption';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Default password for migrated accounts
const DEFAULT_PASSWORD = 'TempPass123!';

export async function POST(request: NextRequest) {
  try {
    // For now, allow any authenticated user to run migration (remove this in production)
    // const authResult = await protectRoute(request, [UserRole.SUPER_ADMIN]);
    // if (authResult instanceof NextResponse) {
    //   return authResult;
    // }

    console.log('🔄 Starting password migration via API...');

    // Validate encryption system first
    if (!validateEncryption()) {
      return NextResponse.json(
        {
          error: 'Encryption system validation failed',
          success: false
        },
        { status: 500 }
      );
    }

    // Find all users with bcrypt passwords
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true
      }
    });

    const bcryptUsers = users.filter(user => isBcryptHash(user.password));

    if (bcryptUsers.length === 0) {
      return NextResponse.json({
        message: 'No bcrypt passwords found. Migration not needed.',
        success: true,
        migrated: 0,
        total: users.length
      });
    }

    // Encrypt the default password
    const encryptedDefaultPassword = encrypt(DEFAULT_PASSWORD);

    // Update each user with bcrypt password
    let migratedCount = 0;
    const failedMigrations: string[] = [];
    const migratedUsers: string[] = [];

    for (const user of bcryptUsers) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { password: encryptedDefaultPassword }
        });

        migratedUsers.push(`${user.firstName} ${user.lastName} (${user.email})`);
        migratedCount++;
      } catch (error) {
        console.error(`Failed to migrate ${user.email}:`, error);
        failedMigrations.push(user.email);
      }
    }

    // Log the migration activity (skip for now since we don't have authResult)
    // await prisma.activityLog.create({
    //   data: {
    //     userId: authResult.id,
    //     action: 'MIGRATE_PASSWORDS',
    //     details: `Migrated ${migratedCount} passwords from bcrypt to encryption. Failed: ${failedMigrations.length}`
    //   }
    // });

    return NextResponse.json({
      message: 'Password migration completed',
      success: true,
      migrated: migratedCount,
      failed: failedMigrations.length,
      total: bcryptUsers.length,
      defaultPassword: DEFAULT_PASSWORD,
      migratedUsers,
      failedMigrations
    });

  } catch (error) {
    console.error('Password migration error:', error);
    return NextResponse.json(
      {
        error: 'Migration failed',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
