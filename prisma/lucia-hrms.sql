-- Lucia HRMS Database Initialization Script

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'EMPLOYEE', 'TEAM_LEADER', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'HR', 'SUPER_ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_LEAVE');
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "LeaveType" AS ENUM ('CASUAL', 'SICK', 'ANNUAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER');

-- Create tables
CREATE TABLE "Branch" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "pincode" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT
);

CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "profileImage" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "SuperAdmin" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "TeamLeader" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Team" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "teamLeaderId" UUID NOT NULL REFERENCES "TeamLeader"("id"),
  "branchId" UUID NOT NULL REFERENCES "Branch"("id")
);

CREATE INDEX "Team_teamLeaderId_idx" ON "Team"("teamLeaderId");
CREATE INDEX "Team_branchId_idx" ON "Team"("branchId");

CREATE TABLE "BranchAdmin" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "branchId" UUID NOT NULL REFERENCES "Branch"("id")
);

CREATE INDEX "BranchAdmin_branchId_idx" ON "BranchAdmin"("branchId");

CREATE TABLE "BranchManager" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "branchId" UUID NOT NULL REFERENCES "Branch"("id")
);

CREATE INDEX "BranchManager_branchId_idx" ON "BranchManager"("branchId");

CREATE TABLE "Employee" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "employeeId" TEXT UNIQUE NOT NULL,
  "designation" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "joiningDate" TIMESTAMP NOT NULL,
  "salary" FLOAT NOT NULL,
  "bankAccountNo" TEXT,
  "panCard" TEXT,
  "aadharCard" TEXT,
  "teamId" UUID REFERENCES "Team"("id"),
  "branchId" UUID NOT NULL REFERENCES "Branch"("id")
);

CREATE INDEX "Employee_teamId_idx" ON "Employee"("teamId");
CREATE INDEX "Employee_branchId_idx" ON "Employee"("branchId");

CREATE TABLE "Client" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "clientId" TEXT UNIQUE NOT NULL,
  "companyName" TEXT,
  "industry" TEXT,
  "gstNumber" TEXT,
  "branchId" UUID NOT NULL REFERENCES "Branch"("id")
);

CREATE INDEX "Client_branchId_idx" ON "Client"("branchId");

CREATE TABLE "Project" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP,
  "status" TEXT NOT NULL, -- Active, Completed, On Hold, Cancelled
  "clientId" UUID NOT NULL REFERENCES "Client"("id"),
  "teamId" UUID NOT NULL REFERENCES "Team"("id")
);

CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");
CREATE INDEX "Project_teamId_idx" ON "Project"("teamId");

CREATE TABLE "Task" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL, -- To Do, In Progress, Review, Done
  "priority" TEXT NOT NULL, -- Low, Medium, High
  "dueDate" TIMESTAMP,
  "projectId" UUID NOT NULL REFERENCES "Project"("id"),
  "assigneeId" UUID NOT NULL REFERENCES "Employee"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

CREATE TABLE "Attendance" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "employeeId" UUID NOT NULL REFERENCES "Employee"("id"),
  "date" TIMESTAMP NOT NULL DEFAULT NOW(),
  "checkIn" TIMESTAMP NOT NULL,
  "checkOut" TIMESTAMP,
  "status" TEXT NOT NULL, -- Present, Absent, Half Day, Late
  "workHours" FLOAT,
  "note" TEXT,
  UNIQUE("employeeId", "date")
);

CREATE INDEX "Attendance_employeeId_idx" ON "Attendance"("employeeId");

CREATE TABLE "LeaveRequest" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "leaveType" "LeaveType" NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
  "approverId" UUID REFERENCES "User"("id"),
  "approvedAt" TIMESTAMP,
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "LeaveRequest_userId_idx" ON "LeaveRequest"("userId");
CREATE INDEX "LeaveRequest_approverId_idx" ON "LeaveRequest"("approverId");

CREATE TABLE "Payroll" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "employeeId" UUID NOT NULL REFERENCES "Employee"("id"),
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "basicSalary" FLOAT NOT NULL,
  "allowances" FLOAT NOT NULL,
  "deductions" FLOAT NOT NULL,
  "netSalary" FLOAT NOT NULL,
  "paymentDate" TIMESTAMP,
  "paymentStatus" TEXT NOT NULL, -- Pending, Paid, Failed
  "paymentMethod" TEXT, -- Bank Transfer, Cash, Cheque
  "transactionId" TEXT,
  UNIQUE("employeeId", "month", "year")
);

CREATE INDEX "Payroll_employeeId_idx" ON "Payroll"("employeeId");

CREATE TABLE "Document" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "employeeId" UUID NOT NULL REFERENCES "Employee"("id"),
  "documentType" TEXT NOT NULL, -- Resume, ID Proof, Address Proof, etc.
  "documentName" TEXT NOT NULL,
  "documentUrl" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Document_employeeId_idx" ON "Document"("employeeId");

CREATE TABLE "ActivityLog" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "action" TEXT NOT NULL,
  "details" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "timestamp" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

CREATE TABLE "Notification" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- Insert initial data: Branch
INSERT INTO "Branch" ("id", "name", "address", "city", "state", "country", "pincode", "phone", "email")
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Lucia Finserv HQ',
  '123 Main Street',
  'Mumbai',
  'Maharashtra',
  'India',
  '400001',
  '+91 22 12345678',
  'hq@luciafinserv.com'
);

-- Insert initial data: Super Admin
INSERT INTO "User" (
  "id", "email", "password", "role", "status", "firstName", "lastName", "phone", "address"
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin@luciafinserv.com',
  '$2a$10$kPJ5aJX9C5f.c0/hh3sFzOyx9mX.YBXZbCE6hZiwzQBQ7uJyZ4z.e', -- hashed 'admin123'
  'SUPER_ADMIN',
  'ACTIVE',
  'Super',
  'Admin',
  '+91 9876543210',
  'Mumbai, Maharashtra'
);

INSERT INTO "SuperAdmin" ("userId")
VALUES ('22222222-2222-2222-2222-222222222222');

-- Insert initial data: Branch Manager
INSERT INTO "User" (
  "id", "email", "password", "role", "status", "firstName", "lastName", "phone"
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'manager@luciafinserv.com',
  '$2a$10$kPJ5aJX9C5f.c0/hh3sFzOyx9mX.YBXZbCE6hZiwzQBQ7uJyZ4z.e', -- hashed 'manager123'
  'BRANCH_MANAGER',
  'ACTIVE',
  'Branch',
  'Manager',
  '+91 9876543211'
);

INSERT INTO "BranchManager" ("userId", "branchId")
VALUES ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_timestamp
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_task_timestamp
BEFORE UPDATE ON "Task"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_leave_request_timestamp
BEFORE UPDATE ON "LeaveRequest"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
