# 🚀 LOS Platform - Quick Start Guide

## Prerequisites
- MySQL 8.0+ installed and running
- Node.js 18+ installed
- npm or yarn

## Step 1: Verify MySQL is Running

### Windows
```bash
# Check if MySQL service is running
sc query MySQL80

# Or start MySQL if not running
net start MySQL80
```

### Mac
```bash
# Check if MySQL is running
brew services list

# Start MySQL if not running
brew services start mysql
```

### Linux
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql
```

## Step 2: Verify MySQL Connection

```bash
# Connect to MySQL
mysql -u root -p

# You should see the MySQL prompt: mysql>
# Type 'exit' to quit
```

## Step 3: Setup Database (Choose One Method)

### Method 1: Automatic Setup (Recommended)

```bash
# Navigate to the API directory
cd services/api

# Install dependencies if not already done
npm install

# Run the setup script
npm run setup-db
```

### Method 2: Manual Setup with SQL File

```bash
# Navigate to database directory
cd services/db

# Run the SQL file
mysql -u root -p < migrations/001_initial_schema.sql

# When prompted, enter your MySQL password
```

### Method 3: Manual Setup in MySQL Client

```bash
# Open MySQL client
mysql -u root -p

# Paste the contents of services/db/migrations/001_initial_schema.sql
# Or run:
source services/db/migrations/001_initial_schema.sql;
```

## Step 4: Verify Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Select the database
USE los_db;

# Show all tables
SHOW TABLES;

# Check lender_users table
SELECT * FROM lender_users;

# Exit
EXIT;
```

You should see 3 sample users:
- John Doe (john.doe@example.com) - L1, Read-Only
- Jane Smith (jane.smith@example.com) - L2, Admin
- Bob Johnson (bob.johnson@example.com) - L3, Read-Only

## Step 5: Configure API Environment

Edit `services/api/.env.local`:

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

## Step 6: Install Dependencies

```bash
# From root directory
npm install

# Or install individually:
cd services/api && npm install
cd ../../apps/merchant-platform && npm install
cd ../lender-platform && npm install
```

## Step 7: Start the Application

```bash
# From root directory
npm run dev
```

This will start:
- 🏪 Merchant Platform: http://localhost:3000
- 🏦 Lender Platform: http://localhost:3002
- 🔌 API Server: http://localhost:3001

## Step 8: Test the Setup

1. Open http://localhost:3002 (Lender Portal)
2. Navigate to "Manage Users" from the sidebar
3. You should see the 3 sample users
4. Try creating a new user - it should be saved to the database

## Database Tables

| Table | Purpose |
|-------|---------|
| `lender_users` | Lender platform user accounts |
| `applications` | Loan applications |
| `application_details` | Basic application details |
| `project_details` | Project information (contractor-led) |
| `financial_details` | Financial information (contractor-led) |
| `users` | Platform users (merchants, lenders, admins) |
| `merchant_profiles` | Merchant business information |

## Troubleshooting

### MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Ensure MySQL is running. Start it with:
- Windows: `net start MySQL80`
- Mac: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

### Access Denied Error
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** Check your MySQL password in `.env.local`

### Database Already Exists
```
Error: Database 'los_db' already exists
```
**Solution:** This is fine! The script uses `CREATE DATABASE IF NOT EXISTS`

### Port Already in Use
```
Error: listen EADDRINUSE :::3001
```
**Solution:** Change PORT in `.env.local` or kill the process using port 3001

## Next Steps

1. ✅ Database is set up
2. ✅ API is connected to MySQL
3. ✅ Manage Users page is working
4. 📝 Next: Implement authentication
5. 📝 Next: Connect applications to database
6. 📝 Next: Add more features

## Support

For issues or questions, check:
- MySQL logs: `mysql -u root -p -e "SHOW ENGINE INNODB STATUS;"`
- API logs: Check console output when running `npm run dev`
- Database: `mysql -u root -p -e "USE los_db; SHOW TABLES;"`
