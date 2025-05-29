/**
 * Command Executor Usage Examples
 * 
 * This file demonstrates how to use the command executor utility
 * to prevent maxBuffer overflow errors in various scenarios.
 */

const {
  executeCommandSync,
  executeCommandAsync,
  executeCommandSpawn,
  executeGitCommand,
  executeNpmCommand,
  executePrismaCommand,
  safeExecuteCommand
} = require('../utils/command-executor');

console.log('=== Command Executor Usage Examples ===\n');

// Example 1: Basic synchronous command execution
console.log('Example 1: Basic synchronous command execution');
try {
  const result = executeCommandSync('echo "Hello from command executor!"', { stdio: 'pipe' });
  console.log(`Output: ${result.toString().trim()}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
}
console.log('');

// Example 2: Safe command execution (won't throw on failure)
console.log('Example 2: Safe command execution');
const success = safeExecuteCommand('echo "This is a safe command"', { stdio: 'pipe' });
console.log(`Command succeeded: ${success}`);
console.log('');

// Example 3: Asynchronous command execution
console.log('Example 3: Asynchronous command execution');
executeCommandAsync('echo "Async command execution"', { stdio: 'pipe' })
  .then(output => {
    console.log(`Async output: ${output.trim()}`);
    continueExamples();
  })
  .catch(error => {
    console.error(`Async error: ${error.message}`);
    continueExamples();
  });

function continueExamples() {
  // Example 4: Git command execution
  console.log('\nExample 4: Git command execution');
  try {
    const gitStatus = executeGitCommand('status --porcelain');
    if (gitStatus.trim()) {
      console.log('Git repository has changes:');
      console.log(gitStatus);
    } else {
      console.log('Git repository is clean');
    }
  } catch (error) {
    console.log('Git not available or not in a git repository');
  }
  console.log('');

  // Example 5: NPM command execution
  console.log('Example 5: NPM command execution');
  try {
    const npmVersion = executeCommandSync('npm --version', { stdio: 'pipe' });
    console.log(`NPM Version: ${npmVersion.toString().trim()}`);
  } catch (error) {
    console.error(`NPM error: ${error.message}`);
  }
  console.log('');

  // Example 6: Prisma command execution
  console.log('Example 6: Prisma command execution');
  try {
    // This will likely fail if Prisma isn't set up, which is fine for demonstration
    executePrismaCommand('--version');
    console.log('Prisma is available');
  } catch (error) {
    console.log('Prisma not available (this is expected in most cases)');
  }
  console.log('');

  // Example 7: Handling large outputs
  console.log('Example 7: Handling large outputs');
  try {
    // This command typically produces substantial output
    const packageList = executeCommandSync('npm list --depth=0', { stdio: 'pipe' });
    const outputSize = packageList.toString().length;
    console.log(`Package list size: ${outputSize} characters`);
    console.log('Large output handled successfully without buffer overflow!');
  } catch (error) {
    console.log(`Large output test failed: ${error.message}`);
  }
  console.log('');

  // Example 8: Error handling patterns
  console.log('Example 8: Error handling patterns');
  
  // Pattern 1: Try-catch for critical commands
  try {
    executeCommandSync('critical-command-that-must-succeed');
    console.log('Critical command succeeded');
  } catch (error) {
    console.log('Critical command failed, stopping execution');
    // In real code, you might process.exit(1) here
  }

  // Pattern 2: Safe execution for optional commands
  if (safeExecuteCommand('optional-command', { stdio: 'pipe' })) {
    console.log('Optional command succeeded');
  } else {
    console.log('Optional command failed, continuing...');
  }
  console.log('');

  // Example 9: Custom options
  console.log('Example 9: Custom options');
  try {
    const result = executeCommandSync('echo "Custom options test"', {
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 5000, // 5 second timeout
      maxBuffer: 1024 * 1024 * 20 // 20MB buffer for this specific command
    });
    console.log(`Custom options result: ${result.trim()}`);
  } catch (error) {
    console.error(`Custom options error: ${error.message}`);
  }
  console.log('');

  // Example 10: Spawn for real-time output
  console.log('Example 10: Spawn for real-time output');
  executeCommandSpawn('echo', ['Real-time output test'])
    .then(() => {
      console.log('Spawn command completed successfully');
      finalExample();
    })
    .catch(error => {
      console.error(`Spawn error: ${error.message}`);
      finalExample();
    });
}

function finalExample() {
  console.log('\nExample 11: Practical usage in scripts');
  console.log('// In your scripts, replace this:');
  console.log('// execSync("npx prisma generate", { stdio: "inherit" });');
  console.log('//');
  console.log('// With this:');
  console.log('// executePrismaCommand("generate");');
  console.log('//');
  console.log('// Benefits:');
  console.log('// - Automatic maxBuffer handling (10MB vs 1MB default)');
  console.log('// - Consistent error handling');
  console.log('// - Better logging');
  console.log('// - Specialized functions for different command types');

  console.log('\n=== Examples Complete ===');
  console.log('\nKey Benefits of the Command Executor:');
  console.log('✅ Prevents "stdout maxBuffer length exceeded" errors');
  console.log('✅ Provides consistent error handling across all scripts');
  console.log('✅ Offers specialized functions for git, npm, and Prisma');
  console.log('✅ Supports both synchronous and asynchronous execution');
  console.log('✅ Maintains backward compatibility with existing code');
  console.log('✅ Centralized configuration for easy maintenance');

  console.log('\nTo use in your own scripts:');
  console.log('const { executePrismaCommand } = require("./utils/command-executor");');
  console.log('executePrismaCommand("generate");');
}
