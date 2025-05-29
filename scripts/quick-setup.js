// This script performs a quick setup of the application with SQLite
const { safeExecuteCommand, executePrismaCommand, executeNpmCommand } = require('./utils/command-executor');

// Function to execute shell commands with increased buffer size
function executeCommand(command) {
  return safeExecuteCommand(command);
}

// Main function to set up the application
async function setupApplication() {
  console.log('Setting up Lucia HRMS application with SQLite...');

  // Step 1: Set up SQLite database
  console.log('\n--- Step 1: Setting up SQLite database ---');
  if (!executeCommand('npm run db:setup:sqlite')) {
    console.error('Failed to set up SQLite database');
    process.exit(1);
  }

  // Step 2: Seed the database with initial data
  console.log('\n--- Step 2: Seeding the database with initial data ---');
  if (!executeCommand('npm run db:seed:sqlite')) {
    console.error('Failed to seed the database');
    process.exit(1);
  }

  console.log('\n--- Setup completed successfully! ---');
  console.log('You can now start the application with: npm run dev');
  console.log('\nDefault login credentials:');
  console.log('- Email: admin@luciafinserv.com');
  console.log('- Password: admin123');
}

// Run the setup
setupApplication().catch(error => {
  console.error('Application setup failed:', error);
  process.exit(1);
});
