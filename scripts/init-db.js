const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Initializing database...');
  
  // Check if SQLite database file exists
  const dbPath = './lucia-hrms.db';
  const fullPath = path.join(process.cwd(), dbPath);
  
  console.log(`Checking if SQLite database exists at: ${fullPath}`);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`SQLite database file not found. Creating directory if needed.`);
      const dbDir = path.dirname(fullPath);
      fs.mkdirSync(dbDir, { recursive: true });
      
      // Create an empty file to ensure the database can be connected to
      fs.writeFileSync(fullPath, '');
      console.log(`Created empty SQLite database file at: ${fullPath}`);
    } else {
      console.log(`SQLite database file already exists at: ${fullPath}`);
    }
    
    // Initialize Prisma client
    const prisma = new PrismaClient();
    
    try {
      // Test connection
      await prisma.$connect();
      console.log('Successfully connected to database');
      
      // Run a simple query to verify the connection
      const result = await prisma.$queryRaw`SELECT 1 as result`;
      console.log('Database query successful:', result);
      
      console.log('Database initialization complete');
    } catch (error) {
      console.error('Database connection error:', error);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

main()
  .then(() => {
    console.log('Database initialization script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization script failed:', error);
    process.exit(1);
  });
