import { NextRequest, NextResponse } from 'next/server';
import { encrypt, decrypt, validateEncryption, isEncrypted, isBcryptHash } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Running encryption diagnostics...');

    // Test basic encryption/decryption
    const testPassword = 'DiagnosticTest123!';
    
    console.log('1. Testing basic encryption...');
    const encrypted = encrypt(testPassword);
    console.log('✅ Encryption successful');
    
    console.log('2. Testing decryption...');
    const decrypted = decrypt(encrypted);
    console.log('✅ Decryption successful');
    
    console.log('3. Validating round-trip...');
    const roundTripSuccess = testPassword === decrypted;
    console.log(roundTripSuccess ? '✅ Round-trip successful' : '❌ Round-trip failed');
    
    console.log('4. Testing format detection...');
    const isEncryptedFormat = isEncrypted(encrypted);
    console.log(isEncryptedFormat ? '✅ Format detection works' : '❌ Format detection failed');
    
    console.log('5. Testing system validation...');
    const systemValid = validateEncryption();
    console.log(systemValid ? '✅ System validation passed' : '❌ System validation failed');

    // Test bcrypt detection
    const bcryptExample = '$2b$10$example.hash.here';
    const isBcrypt = isBcryptHash(bcryptExample);
    
    return NextResponse.json({
      success: roundTripSuccess && isEncryptedFormat && systemValid,
      tests: {
        encryption: {
          input: testPassword,
          encrypted: encrypted.substring(0, 50) + '...',
          decrypted: decrypted,
          success: true
        },
        roundTrip: {
          matches: roundTripSuccess,
          success: roundTripSuccess
        },
        formatDetection: {
          isEncryptedFormat,
          isBcryptDetection: isBcrypt,
          success: isEncryptedFormat && isBcrypt
        },
        systemValidation: {
          valid: systemValid,
          success: systemValid
        }
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        cryptoAvailable: !!require('crypto')
      },
      message: 'Encryption diagnostics completed'
    });

  } catch (error) {
    console.error('💥 Encryption diagnostics failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      message: 'Encryption diagnostics failed'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing custom password:', password.substring(0, 5) + '...');

    // Encrypt
    const encrypted = encrypt(password);
    console.log('✅ Custom password encrypted');

    // Decrypt
    const decrypted = decrypt(encrypted);
    console.log('✅ Custom password decrypted');

    // Validate
    const matches = password === decrypted;
    const isValidFormat = isEncrypted(encrypted);

    return NextResponse.json({
      success: matches && isValidFormat,
      original: password,
      encrypted: encrypted,
      decrypted: decrypted,
      matches,
      isValidFormat,
      encryptedLength: encrypted.length,
      parts: encrypted.split(':').length,
      message: matches && isValidFormat ? 'Custom test successful' : 'Custom test failed'
    });

  } catch (error) {
    console.error('💥 Custom encryption test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Custom encryption test failed'
    }, { status: 500 });
  }
}
