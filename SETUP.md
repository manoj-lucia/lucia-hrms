# Lucia HRMS Setup Guide

This guide will help you set up the Lucia HRMS application with a PostgreSQL database.

## Prerequisites

1. **PostgreSQL Database Server**
   - Install PostgreSQL on your machine or use a cloud-hosted PostgreSQL service
   - Create a new database named `lucia_hrms`

2. **Node.js and npm**
   - Make sure you have Node.js 18+ and npm installed

## Step 1: Configure the Database Connection

1. Open the `.env` file in the root directory
2. Update the `DATABASE_URL` with your PostgreSQL connection details:

```
DATABASE_URL="postgresql://username:password@localhost:5432/lucia_hrms?schema=public"
```

Replace `username`, `password`, and `localhost:5432` with your actual PostgreSQL credentials and host.

## Step 2: Generate Prisma Client

Run the following command to generate the Prisma client:

```bash
npm run db:generate
```

This will create the necessary TypeScript types and client code for interacting with your database.

## Step 3: Push the Database Schema

Run the following command to create the database schema:

```bash
npm run db:push
```

This will create all the tables defined in the `prisma/schema.prisma` file in your PostgreSQL database.

## Step 4: Seed the Database with Initial Data

Run the following command to populate the database with initial data:

```bash
npm run db:seed
```

This will create:
- A branch
- Super admin user (email: admin@luciafinserv.com, password: admin123)
- Branch manager user (email: manager@luciafinserv.com, password: manager123)
- Sample employees with attendance records

## Step 5: Start the Application

Run the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Step 6: Log in to the Application

1. Open http://localhost:3000 in your browser
2. You will be redirected to the login page
3. Use the following credentials to log in:
   - Email: admin@luciafinserv.com
   - Password: admin123

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify that your PostgreSQL server is running
2. Check that the connection string in `.env` is correct
3. Ensure that the database `lucia_hrms` exists
4. Make sure your PostgreSQL user has the necessary permissions

### Prisma Client Generation Errors

If you encounter errors during Prisma client generation:

1. Delete the `node_modules/.prisma` directory
2. Run `npm install` to reinstall dependencies
3. Run `npm run db:generate` again

### Seeding Errors

If you encounter errors during database seeding:

1. Check the PostgreSQL logs for any error messages
2. Ensure that your PostgreSQL user has permission to create tables and insert data
3. Try running `npm run db:push` again before seeding

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
