# PostgreSQL Database Setup Guide

This guide will help you set up the PostgreSQL database for the Lucia HRMS application.

## Prerequisites

- PostgreSQL 12 or higher installed on your system or a remote PostgreSQL server
- Basic knowledge of PostgreSQL administration

## Step 1: Install PostgreSQL

### Windows

1. Download the PostgreSQL installer from the [official website](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the installation wizard
3. Remember the password you set for the `postgres` user
4. Complete the installation with the default options

### macOS

Using Homebrew:
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Create a Database

1. Open a terminal or command prompt
2. Connect to PostgreSQL as the postgres user:

   **Windows**:
   ```
   psql -U postgres
   ```

   **macOS/Linux**:
   ```
   sudo -u postgres psql
   ```

3. Create a new database for the application:
   ```sql
   CREATE DATABASE lucia_hrms;
   ```

4. Create a user for the application (optional but recommended):
   ```sql
   CREATE USER lucia_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE lucia_hrms TO lucia_user;
   ```

5. Exit the PostgreSQL prompt:
   ```
   \q
   ```

## Step 3: Update Environment Variables

1. Open the `.env` file in the root directory of the application
2. Update the `DATABASE_URL` with your PostgreSQL connection details:

```
DATABASE_URL="postgresql://username:password@localhost:5432/lucia_hrms?schema=public"
```

Replace:
- `username` with your PostgreSQL username (e.g., `postgres` or `lucia_user`)
- `password` with your PostgreSQL password
- `localhost:5432` with your PostgreSQL host and port if different

## Step 4: Generate Prisma Client

Run the following command to generate the Prisma client:

```bash
npm run db:generate
```

## Step 5: Push the Database Schema

Run the following command to create the database schema:

```bash
npm run db:push
```

## Step 6: Seed the Database with Initial Data

Run the following command to populate the database with initial data:

```bash
npm run db:seed
```

## Troubleshooting

### Connection Refused Error

If you see an error like "connection refused", check:
1. PostgreSQL service is running
2. The port in your connection string matches the PostgreSQL port (default is 5432)
3. Firewall settings allow connections to PostgreSQL

### Authentication Failed Error

If you see an authentication error:
1. Verify the username and password in your connection string
2. Check that the user has appropriate permissions

### Database Does Not Exist Error

If the database doesn't exist:
1. Connect to PostgreSQL and create the database manually:
   ```sql
   CREATE DATABASE lucia_hrms;
   ```

### Schema Migration Issues

If you encounter issues with schema migrations:
1. Try resetting the database (warning: this will delete all data):
   ```bash
   npx prisma migrate reset
   ```

## Verifying the Connection

To verify that your application can connect to the database:

1. Start the application:
   ```bash
   npm run dev
   ```

2. Try logging in with the default credentials:
   - Email: admin@luciafinserv.com
   - Password: admin123

If you can log in successfully, your database connection is working properly.

## Database Management Tools

For easier database management, you can use:

1. **Prisma Studio**: A visual database editor
   ```bash
   npm run db:studio
   ```

2. **pgAdmin**: A comprehensive PostgreSQL administration tool
   - Download from [pgAdmin website](https://www.pgadmin.org/download/)

3. **DBeaver**: A universal database tool
   - Download from [DBeaver website](https://dbeaver.io/download/)
