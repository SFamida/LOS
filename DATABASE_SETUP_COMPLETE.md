# 📊 LOS Platform - Database Setup Complete

## What Was Created

### Database: `los_db`

#### Tables Created:

1. **lender_users** - Lender platform user management
   - Columns: id, first_name, last_name, email, level (L1/L2/L3), role (Admin/Read-Only)
   - Sample data: 3 users pre-loaded

2. **applications** - Loan applications
   - Columns: id, application_token, customer_name, customer_email, flow_type, status, etc.

3. **application_details** - Basic application information
   - Columns: id, application_id, first_name, last_name, phone_number, email, ssn, date_of_birth, requested_amount

4. **project_details** - Project information (contractor-led flow)
   - Columns: id, application_id, expected_financing_amount, project_type, project_address, etc.

5. **financial_details** - Financial information (contractor-led flow)
   - Columns: id, application_id, annual_income, monthly_income, has_special_income

6. **users** - Platform users (merchants, lenders, admins)
   - Columns: id, email, password_hash, role

7. **merchant_profiles** - Merchant business information
   - Columns: id, user_id, business_name, business_phone, business_address

## How to Set Up

### Option 1: Automatic Setup (Easiest)

```bash
cd services/api
npm install
npm run setup-db
```

### Option 2: Manual SQL File

```bash
mysql -u root -p < services/db/migrations/001_initial_schema.sql
```

### Option 3: MySQL Client

```bash
mysql -u root -p
source services/db/migrations/001_initial_schema.sql;
```

## Configuration

Update `services/api/.env.local`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=los_db
```

## Sample Data

Three lender users are pre-loaded:

| Name | Email | Level | Role |
|------|-------|-------|------|
| John Doe | john.doe@example.com | L1 | Read-Only |
| Jane Smith | jane.smith@example.com | L2 | Admin |
| Bob Johnson | bob.johnson@example.com | L3 | Read-Only |

## API Endpoints

### Users Management
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Applications
- `GET /applications` - Get all applications
- `POST /applications` - Create application
- `GET /applications/:token` - Get application by token
- `PATCH /applications/:id` - Update application status

## Features Implemented

✅ MySQL database connection
✅ User management (CRUD operations)
✅ Database schema with proper relationships
✅ Sample data pre-loaded
✅ API routes connected to database
✅ Manage Users page in Lender Portal
✅ Create, Read, Update, Delete users
✅ Level and Role dropdowns
✅ User table with proper alignment

## Next Steps

1. Run `npm run dev` to start the application
2. Navigate to http://localhost:3002 (Lender Portal)
3. Go to "Manage Users" in the sidebar
4. Test creating, editing, and deleting users
5. Data will be saved to MySQL database

## Troubleshooting

### MySQL Not Running
```bash
# Windows
net start MySQL80

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Connection Error
Check `.env.local` credentials:
- DB_HOST: localhost
- DB_USER: root
- DB_PASSWORD: your MySQL password
- DB_NAME: los_db

### Port Already in Use
Change PORT in `.env.local` or kill the process using port 3001

## Files Created/Modified

### New Files:
- `services/api/src/db/connection.js` - MySQL connection pool
- `services/api/src/models/User.js` - User database model
- `services/api/src/routes/users.js` - User API routes
- `services/db/setup.js` - Automated setup script
- `services/db/setup.sql` - SQL setup file
- `QUICK_START.md` - Quick start guide
- `DATABASE_SETUP.md` - Detailed setup guide

### Modified Files:
- `services/api/src/index.js` - Added database connection and users routes
- `services/api/.env.local` - Updated with database configuration
- `services/api/package.json` - Added setup-db script
- `services/db/migrations/001_initial_schema.sql` - Updated schema
- `apps/lender-platform/app/manage-users/page.tsx` - Connected to API

## Database Diagram

```
lender_users
├── id (PK)
├── first_name
├── last_name
├── email (UNIQUE)
├── level (L1, L2, L3)
├── role (Admin, Read-Only)
└── timestamps

applications
├── id (PK)
├── application_token (UNIQUE)
├── customer_name
├── customer_email
├── flow_type
├── status
└── timestamps

application_details (FK: application_id)
├── id (PK)
├── application_id (FK)
├── first_name
├── last_name
├── phone_number
├── email
├── ssn
├── date_of_birth
└── requested_amount

project_details (FK: application_id)
├── id (PK)
├── application_id (FK)
├── expected_financing_amount
├── project_type
├── project_address
└── applicant_address

financial_details (FK: application_id)
├── id (PK)
├── application_id (FK)
├── annual_income
├── monthly_income
└── has_special_income
```

## Success Indicators

✅ Database created successfully
✅ All tables created with proper relationships
✅ Sample data inserted
✅ API connected to database
✅ Manage Users page working
✅ CRUD operations functional
✅ Data persisting in MySQL

You're all set! The LOS Platform is now connected to MySQL database. 🎉
