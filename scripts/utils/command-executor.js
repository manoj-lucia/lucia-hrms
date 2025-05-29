/**
 * Command Executor Utility
 * 
 * This module provides utilities for executing shell commands with proper
 * buffer management to prevent "stdout maxBuffer length exceeded" errors.
 * 
 * The maxBuffer is set to 10MB to handle large outputs from git commands,
 * npm operations, and other processes that might generate extensive output.
 */

const { execSync, exec, spawn } = require('child_process');

// Default configuration for command execution
const DEFAULT_OPTIONS = {
  maxBuffer: 1024 * 1024 * 10, // 10MB buffer to prevent overflow
  stdio: 'inherit',
  encoding: 'utf8'
};

/**
 * Execute a command synchronously with increased buffer size
 * @param {string} command - The command to execute
 * @param {object} options - Additional options for execSync
 * @returns {Buffer|string} - Command output
 */
function executeCommandSync(command, options = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    console.log(`Executing: ${command}`);
    return execSync(command, mergedOptions);
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Execute a command asynchronously with increased buffer size
 * @param {string} command - The command to execute
 * @param {object} options - Additional options for exec
 * @returns {Promise} - Promise that resolves with command output
 */
function executeCommandAsync(command, options = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    console.log(`Executing async: ${command}`);
    
    exec(command, mergedOptions, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`);
        console.error(error.message);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`Warning from command: ${command}`);
        console.warn(stderr);
      }
      
      resolve(stdout);
    });
  });
}

/**
 * Execute a command using spawn for real-time output
 * @param {string} command - The command to execute
 * @param {array} args - Command arguments
 * @param {object} options - Additional options for spawn
 * @returns {Promise} - Promise that resolves when command completes
 */
function executeCommandSpawn(command, args = [], options = {}) {
  const mergedOptions = { 
    stdio: 'inherit',
    ...options 
  };
  
  return new Promise((resolve, reject) => {
    console.log(`Executing spawn: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, mergedOptions);
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error(`Error executing command: ${command}`);
      console.error(error.message);
      reject(error);
    });
  });
}

/**
 * Execute a git command with proper buffer handling
 * @param {string} gitCommand - The git command (without 'git' prefix)
 * @param {object} options - Additional options
 * @returns {string} - Git command output
 */
function executeGitCommand(gitCommand, options = {}) {
  const command = `git ${gitCommand}`;
  const gitOptions = {
    ...DEFAULT_OPTIONS,
    stdio: 'pipe', // Capture output for git commands
    ...options
  };
  
  try {
    console.log(`Executing git: ${command}`);
    const output = execSync(command, gitOptions);
    return output.toString().trim();
  } catch (error) {
    console.error(`Error executing git command: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Execute an npm command with proper buffer handling
 * @param {string} npmCommand - The npm command (without 'npm' prefix)
 * @param {object} options - Additional options
 * @returns {Buffer|string} - npm command output
 */
function executeNpmCommand(npmCommand, options = {}) {
  const command = `npm ${npmCommand}`;
  const npmOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  
  try {
    console.log(`Executing npm: ${command}`);
    return execSync(command, npmOptions);
  } catch (error) {
    console.error(`Error executing npm command: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Execute a Prisma command with proper buffer handling
 * @param {string} prismaCommand - The Prisma command (without 'npx prisma' prefix)
 * @param {object} options - Additional options
 * @returns {Buffer|string} - Prisma command output
 */
function executePrismaCommand(prismaCommand, options = {}) {
  const command = `npx prisma ${prismaCommand}`;
  const prismaOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  
  try {
    console.log(`Executing Prisma: ${command}`);
    return execSync(command, prismaOptions);
  } catch (error) {
    console.error(`Error executing Prisma command: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Safe command execution with error handling and logging
 * @param {string} command - The command to execute
 * @param {object} options - Additional options
 * @returns {boolean} - True if successful, false otherwise
 */
function safeExecuteCommand(command, options = {}) {
  try {
    executeCommandSync(command, options);
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

module.exports = {
  executeCommandSync,
  executeCommandAsync,
  executeCommandSpawn,
  executeGitCommand,
  executeNpmCommand,
  executePrismaCommand,
  safeExecuteCommand,
  DEFAULT_OPTIONS
};
