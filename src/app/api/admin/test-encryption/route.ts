import { NextRequest, NextResponse } from 'next/server';
import { encrypt, decrypt, validateEncryption, isEncrypted, ENCRYPTION_CONFIG } from '@/lib/encryption';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Only admins can test encryption
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_ADMIN
    ]);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    console.log('🧪 Testing encryption system...');

    // Test data
    const testPasswords = [
      'SimplePass123!',
      'ComplexP@ssw0rd#2024',
      'AnotherTest!@#$%^&*()',
      'LuciaHRMS-SecurePassword-2024!',
      'Short1!',
      'VeryLongPasswordWithManyCharacters123!@#$%^&*()'
    ];

    const results = [];
    let allTestsPassed = true;

    // Test each password
    for (const testPassword of testPasswords) {
      try {
        console.log(`Testing password: ${testPassword.substring(0, 8)}...`);
        
        // Encrypt
        const encrypted = encrypt(testPassword);
        console.log(`Encrypted length: ${encrypted.length}`);
        
        // Verify format
        const isValidFormat = isEncrypted(encrypted);
        console.log(`Valid format: ${isValidFormat}`);
        
        // Decrypt
        const decrypted = decrypt(encrypted);
        console.log(`Decrypted: ${decrypted.substring(0, 8)}...`);
        
        // Verify match
        const matches = testPassword === decrypted;
        console.log(`Matches original: ${matches}`);
        
        const testResult = {
          original: testPassword,
          encrypted: encrypted.substring(0, 50) + '...', // Truncate for display
          decrypted: decrypted,
          matches,
          isValidFormat,
          success: matches && isValidFormat
        };
        
        results.push(testResult);
        
        if (!testResult.success) {
          allTestsPassed = false;
        }
        
      } catch (error) {
        console.error(`Test failed for password: ${testPassword}`, error);
        results.push({
          original: testPassword,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
        allTestsPassed = false;
      }
    }

    // Overall validation
    const systemValidation = validateEncryption();

    // Performance test
    const performanceTest = () => {
      const start = Date.now();
      const testData = 'PerformanceTest123!';
      
      for (let i = 0; i < 100; i++) {
        const encrypted = encrypt(testData);
        decrypt(encrypted);
      }
      
      return Date.now() - start;
    };

    const performanceMs = performanceTest();

    return NextResponse.json({
      success: allTestsPassed && systemValidation,
      systemValidation,
      config: ENCRYPTION_CONFIG,
      performance: {
        time100Operations: `${performanceMs}ms`,
        averagePerOperation: `${(performanceMs / 100).toFixed(2)}ms`
      },
      testResults: results,
      summary: {
        totalTests: testPasswords.length,
        passed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      },
      message: allTestsPassed && systemValidation 
        ? '✅ All encryption tests passed successfully!' 
        : '❌ Some encryption tests failed. Check the results.'
    });

  } catch (error) {
    console.error('Encryption test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admins can test encryption
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_ADMIN
    ]);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { password } = await request.json();
    
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required and must be a string' },
        { status: 400 }
      );
    }

    try {
      // Encrypt the provided password
      const encrypted = encrypt(password);
      
      // Decrypt it back
      const decrypted = decrypt(encrypted);
      
      // Verify
      const matches = password === decrypted;
      const isValidFormat = isEncrypted(encrypted);
      
      return NextResponse.json({
        success: matches && isValidFormat,
        original: password,
        encrypted,
        decrypted,
        matches,
        isValidFormat,
        encryptedLength: encrypted.length,
        message: matches && isValidFormat 
          ? '✅ Encryption/decryption successful!' 
          : '❌ Encryption/decryption failed!'
      });
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Encryption failed',
        original: password
      });
    }

  } catch (error) {
    console.error('Custom encryption test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
