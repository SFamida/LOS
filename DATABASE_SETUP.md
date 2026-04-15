# LOS Platform - Database Setup Guide

## Prerequisites

- MySQL 8.0 or higher installed and running
- Node.js 18+ installed

## Step 1: Create Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE los_db;
```

## Step 2: Run Migrations

Navigate to the database migrations directory and run the schema:

```bash
cd services/db
mysql -u root -p los_db < migrations/001_initial_schema.sql
```

When prompted, enter your MySQL password.

## Step 3: Configure Environment Variables

Update `services/api/.env.local` with your MySQL credentials:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=dev_secret_key_los_platform_2024

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=los_db

# Email Configuration
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_email_user
SMTP_PASS=your_email_password

# Platform URLs
MERCHANT_PLATFORM_URL=http://localhost:3000
LENDER_PLATFORM_URL=http://localhost:3002
API_URL=http://localhost:3001
```

## Step 4: Install Dependencies

```bash
# Install API dependencies
cd services/api
npm install

# Install frontend dependencies
cd ../../apps/merchant-platform
npm install

cd ../lender-platform
npm install
```

## Step 5: Start the Application

From the root directory:

```bash
npm run dev
```

This will start:
- Merchant Platform: http://localhost:3000
- Lender Platform: http://localhost:3002
- API Server: http://localhost:3001

## Database Tables

### lender_users
Stores lender platform user accounts with the following fields:
- `id` - Unique identifier
- `first_name` - User's first name
- `last_name` - User's last name
- `email` - User's email (unique)
- `level` - User level (L1, L2, L3)
- `role` - User role (Admin, Read-Only)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### applications
Stores loan applications with status tracking

### users
Stores platform users (merchants, lenders, admins)

### merchant_profiles
Stores merchant business information

## API Endpoints

### Users Management
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Applications
- `GET /applications` - Get all applications
- `POST /applications` - Create application
- `GET /applications/:token` - Get application by token
- `PATCH /applications/:id` - Update application status

## Troubleshooting

### MySQL Connection Error
- Ensure MySQL is running: `mysql -u root -p`
- Check credentials in `.env.local`
- Verify database exists: `SHOW DATABASES;`

### Port Already in Use
- Change PORT in `.env.local` if 3001 is in use
- Or kill the process using the port

### Dependencies Not Installed
- Run `npm install` in the API directory
- Run `npm install` in each app directory

## Testing the Setup

1. Start the application with `npm run dev`
2. Navigate to http://localhost:3002 (Lender Portal)
3. Click on "Manage Users" in the sidebar
4. Click "+ Create User" button
5. Fill in the form and submit
6. The user should be saved to the MySQL database

## Next Steps

1. Implement authentication/login
2. Add more API endpoints for applications
3. Implement email notifications
4. Add reporting and analytics
