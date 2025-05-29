const fs = require('fs');
const path = require('path');
const { safeExecuteCommand, executePrismaCommand } = require('./utils/command-executor');

// Function to execute shell commands with increased buffer size
function executeCommand(command) {
  return safeExecuteCommand(command);
}

// Main function to set up the database
async function setupDatabase() {
  console.log('Setting up Lucia HRMS database...');

  // Create the database directory if it doesn't exist
  const dbDir = path.join(__dirname, '..', 'prisma');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Generate Prisma client
  console.log('Generating Prisma client...');
  try {
    executePrismaCommand('generate');
  } catch (error) {
    console.error('Failed to generate Prisma client');
    process.exit(1);
  }

  // Create database and apply migrations
  console.log('Creating database and applying migrations...');
  try {
    executePrismaCommand('db push');
  } catch (error) {
    console.error('Failed to push database schema');
    process.exit(1);
  }

  console.log('Database setup completed successfully!');
}

// Run the setup
setupDatabase().catch(error => {
  console.error('Database setup failed:', error);
  process.exit(1);
});
