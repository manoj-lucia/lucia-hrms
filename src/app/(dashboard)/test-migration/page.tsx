'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TestMigrationPage() {
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [encryptionTest, setEncryptionTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runMigration = async () => {
    setLoading(true);
    try {
      console.log('🔄 Starting password migration...');
      const response = await axios.post('/api/admin/migrate-passwords');
      console.log('✅ Migration completed:', response.data);
      setMigrationResult(response.data);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      setMigrationResult({ 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const testEncryption = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing encryption system...');
      const response = await axios.get('/api/admin/test-encryption');
      console.log('✅ Encryption test completed:', response.data);
      setEncryptionTest(response.data);
    } catch (error) {
      console.error('❌ Encryption test failed:', error);
      setEncryptionTest({ 
        error: 'Encryption test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Password System Migration</h1>
      
      <div className="space-y-6">
        {/* Encryption Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Test Encryption System</h2>
          <p className="text-gray-600 mb-4">
            First, let's verify that the encryption system is working correctly.
          </p>
          
          <button
            onClick={testEncryption}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mb-4"
          >
            {loading ? 'Testing...' : 'Test Encryption System'}
          </button>

          {encryptionTest && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">
                {encryptionTest.success ? '✅ Encryption Test Results' : '❌ Encryption Test Failed'}
              </h3>
              <pre className="text-sm overflow-auto max-h-64">
                {JSON.stringify(encryptionTest, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Migration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Run Password Migration</h2>
          <p className="text-gray-600 mb-4">
            This will convert all bcrypt passwords to encrypted format with a default password.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <h4 className="font-semibold text-yellow-800">⚠️ Important:</h4>
            <ul className="text-yellow-700 text-sm mt-2 space-y-1">
              <li>• All existing bcrypt passwords will be replaced with: <code className="bg-yellow-100 px-1 rounded">TempPass123!</code></li>
              <li>• This password will be encrypted and can be decrypted later</li>
              <li>• Users will need to update their passwords after migration</li>
              <li>• New employees will use the encryption system automatically</li>
            </ul>
          </div>
          
          <button
            onClick={runMigration}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Migrating...' : 'Run Password Migration'}
          </button>

          {migrationResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">
                {migrationResult.success ? '✅ Migration Results' : '❌ Migration Failed'}
              </h3>
              
              {migrationResult.success ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Total Users:</strong> {migrationResult.total}</div>
                  <div><strong>Migrated:</strong> {migrationResult.migrated}</div>
                  <div><strong>Failed:</strong> {migrationResult.failed}</div>
                  <div><strong>Default Password:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">{migrationResult.defaultPassword}</code></div>
                  
                  {migrationResult.migratedUsers?.length > 0 && (
                    <div className="mt-4">
                      <strong>Migrated Users:</strong>
                      <ul className="list-disc list-inside ml-4 mt-2">
                        {migrationResult.migratedUsers.map((user: string, index: number) => (
                          <li key={index} className="text-xs">{user}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <strong>Error:</strong> {migrationResult.error}
                  {migrationResult.details && (
                    <div className="mt-2 text-sm">
                      <strong>Details:</strong> {migrationResult.details}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Next Steps After Migration:</h3>
          <ol className="text-blue-700 text-sm space-y-2">
            <li>1. <strong>Test new employee creation:</strong> Create a new employee and verify password encryption works</li>
            <li>2. <strong>Test password show/hide:</strong> Edit an employee and verify you can see the decrypted password</li>
            <li>3. <strong>Test login:</strong> Verify that login still works with both old and new password formats</li>
            <li>4. <strong>Update passwords:</strong> Have users update their passwords from the default</li>
            <li>5. <strong>Remove migration access:</strong> Secure the migration endpoint for production</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
