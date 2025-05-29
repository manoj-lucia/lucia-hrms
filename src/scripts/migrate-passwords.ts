/**
 * Password Migration Script
 * 
 * This script migrates existing bcrypt hashed passwords to our new encryption system.
 * Since bcrypt is one-way, we'll reset passwords to a default encrypted password
 * and notify administrators to update employee passwords.
 */

import { PrismaClient } from '@prisma/client';
import { encrypt, isBcryptHash, validateEncryption } from '../lib/encryption';

const prisma = new PrismaClient();

// Default password for migrated accounts (will be encrypted)
const DEFAULT_PASSWORD = 'TempPass123!';

async function migratePasswords() {
  console.log('🔄 Starting password migration...');
  
  // Validate encryption system first
  if (!validateEncryption()) {
    console.error('❌ Encryption system validation failed. Aborting migration.');
    process.exit(1);
  }
  console.log('✅ Encryption system validated successfully');

  try {
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

    console.log(`📊 Found ${users.length} users to check`);

    const bcryptUsers = users.filter(user => isBcryptHash(user.password));
    console.log(`🔍 Found ${bcryptUsers.length} users with bcrypt passwords`);

    if (bcryptUsers.length === 0) {
      console.log('✅ No bcrypt passwords found. Migration not needed.');
      return;
    }

    // Encrypt the default password
    const encryptedDefaultPassword = encrypt(DEFAULT_PASSWORD);
    console.log('🔐 Default password encrypted successfully');

    // Update each user with bcrypt password
    let migratedCount = 0;
    const failedMigrations: string[] = [];

    for (const user of bcryptUsers) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { password: encryptedDefaultPassword }
        });

        console.log(`✅ Migrated: ${user.firstName} ${user.lastName} (${user.email})`);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Failed to migrate ${user.email}:`, error);
        failedMigrations.push(user.email);
      }
    }

    // Summary
    console.log('\n📋 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} users`);
    console.log(`❌ Failed migrations: ${failedMigrations.length} users`);
    
    if (failedMigrations.length > 0) {
      console.log('Failed users:', failedMigrations.join(', '));
    }

    // Important notice
    console.log('\n⚠️  IMPORTANT NOTICE:');
    console.log(`🔑 All migrated users now have the temporary password: "${DEFAULT_PASSWORD}"`);
    console.log('📧 Please notify administrators to update employee passwords');
    console.log('🔒 New passwords will be properly encrypted and decryptable');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migratePasswords()
    .then(() => {
      console.log('🎉 Password migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export { migratePasswords };
