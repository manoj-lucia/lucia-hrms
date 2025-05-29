'use client';

import { useState } from 'react';
import axios from 'axios';

export default function EncryptionTestPage() {
  const [testPassword, setTestPassword] = useState('TestPassword123!');
  const [testResult, setTestResult] = useState<any>(null);
  const [systemTest, setSystemTest] = useState<any>(null);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSystemTest = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/test-encryption');
      setSystemTest(response.data);
    } catch (error) {
      console.error('System test failed:', error);
      setSystemTest({ error: 'System test failed' });
    } finally {
      setLoading(false);
    }
  };

  const testCustomPassword = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/test-encryption', {
        password: testPassword
      });
      setTestResult(response.data);
    } catch (error) {
      console.error('Custom test failed:', error);
      setTestResult({ error: 'Custom test failed' });
    } finally {
      setLoading(false);
    }
  };

  const runPasswordMigration = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/migrate-passwords');
      setMigrationResult(response.data);
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationResult({ error: 'Migration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">🔐 Encryption System Management</h1>
      
      {/* System Test Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Validation Test</h2>
        <p className="text-gray-600 mb-4">
          Run comprehensive tests to validate the encryption system is working correctly.
        </p>
        
        <button
          onClick={runSystemTest}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run System Test'}
        </button>

        {systemTest && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">
              {systemTest.success ? '✅ System Test Results' : '❌ System Test Results'}
            </h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(systemTest, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Custom Password Test */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Custom Password Test</h2>
        <p className="text-gray-600 mb-4">
          Test encryption/decryption with a custom password.
        </p>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            placeholder="Enter password to test"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={testCustomPassword}
            disabled={loading || !testPassword}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Password'}
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">
              {testResult.success ? '✅ Test Results' : '❌ Test Results'}
            </h3>
            <div className="space-y-2 text-sm">
              <div><strong>Original:</strong> {testResult.original}</div>
              <div><strong>Encrypted:</strong> {testResult.encrypted?.substring(0, 100)}...</div>
              <div><strong>Decrypted:</strong> {testResult.decrypted}</div>
              <div><strong>Matches:</strong> {testResult.matches ? '✅' : '❌'}</div>
              <div><strong>Valid Format:</strong> {testResult.isValidFormat ? '✅' : '❌'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Password Migration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Password Migration</h2>
        <p className="text-gray-600 mb-4">
          Migrate existing bcrypt passwords to the new encryption system. 
          <strong className="text-red-600"> Warning: This will reset all bcrypt passwords to a default password.</strong>
        </p>
        
        <button
          onClick={runPasswordMigration}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Migrating...' : 'Run Password Migration'}
        </button>

        {migrationResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">
              {migrationResult.success ? '✅ Migration Results' : '❌ Migration Results'}
            </h3>
            
            {migrationResult.success && (
              <div className="space-y-2 text-sm">
                <div><strong>Total Users:</strong> {migrationResult.total}</div>
                <div><strong>Migrated:</strong> {migrationResult.migrated}</div>
                <div><strong>Failed:</strong> {migrationResult.failed}</div>
                <div><strong>Default Password:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">{migrationResult.defaultPassword}</code></div>
                
                {migrationResult.migratedUsers?.length > 0 && (
                  <div>
                    <strong>Migrated Users:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {migrationResult.migratedUsers.map((user: string, index: number) => (
                        <li key={index}>{user}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {migrationResult.error && (
              <div className="text-red-600">
                <strong>Error:</strong> {migrationResult.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
