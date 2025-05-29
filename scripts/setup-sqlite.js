// This script sets up an SQLite database as a fallback when PostgreSQL is not available
const fs = require('fs');
const path = require('path');
const { executePrismaCommand } = require('./utils/command-executor');

// Function to update the .env file to use SQLite
function updateEnvFile() {
  console.log('Updating .env file to use SQLite...');

  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';

  try {
    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Replace PostgreSQL connection string with SQLite
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(
        /DATABASE_URL=.*$/m,
        'DATABASE_URL="file:./lucia-hrms.db"'
      );
    } else {
      // Add SQLite connection string if not present
      envContent += '\nDATABASE_URL="file:./lucia-hrms.db"\n';
    }

    // Write updated content back to .env file
    fs.writeFileSync(envPath, envContent);
    console.log('Successfully updated .env file to use SQLite');
  } catch (error) {
    console.error('Error updating .env file:', error);
    process.exit(1);
  }
}

// Function to update the Prisma schema to use SQLite
function updatePrismaSchema() {
  console.log('Updating Prisma schema to use SQLite...');

  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  let schemaContent = '';

  try {
    // Read existing schema file
    if (fs.existsSync(schemaPath)) {
      schemaContent = fs.readFileSync(schemaPath, 'utf8');
    } else {
      console.error('Prisma schema file not found at:', schemaPath);
      process.exit(1);
    }

    // Replace PostgreSQL provider with SQLite
    schemaContent = schemaContent.replace(
      /provider = "postgresql"/,
      'provider = "sqlite"'
    );

    // Write updated content back to schema file
    fs.writeFileSync(schemaPath, schemaContent);
    console.log('Successfully updated Prisma schema to use SQLite');
  } catch (error) {
    console.error('Error updating Prisma schema:', error);
    process.exit(1);
  }
}

// Function to generate Prisma client
function generatePrismaClient() {
  console.log('Generating Prisma client...');

  try {
    executePrismaCommand('generate');
    console.log('Successfully generated Prisma client');
  } catch (error) {
    console.error('Error generating Prisma client:', error);
    process.exit(1);
  }
}

// Function to push schema to database
function pushSchema() {
  console.log('Pushing schema to SQLite database...');

  try {
    executePrismaCommand('db push');
    console.log('Successfully pushed schema to SQLite database');
  } catch (error) {
    console.error('Error pushing schema to database:', error);
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log('Setting up SQLite database as fallback...');

  // Update .env file
  updateEnvFile();

  // Update Prisma schema
  updatePrismaSchema();

  // Generate Prisma client
  generatePrismaClient();

  // Push schema to database
  pushSchema();

  console.log('SQLite database setup completed successfully!');
  console.log('You can now start the application with: npm run dev');
}

// Run the main function
main().catch(error => {
  console.error('Database setup failed:', error);
  process.exit(1);
});
