# 🚀 LOS Platform - SQL Server Setup Guide

## Prerequisites

- SQL Server 2019 or higher installed and running
- SQL Server Management Studio (SSMS) installed (optional but recommended)
- Node.js 18+ installed

## Step 1: Verify SQL Server is Running

### Windows
```bash
# Check if SQL Server service is running
sc query MSSQLSERVER

# Or start SQL Server if not running
net start MSSQLSERVER
```

### Verify Connection
```bash
# Test connection using sqlcmd
sqlcmd -S localhost -U sa -P Password123
```

If you see `1>` prompt, SQL Server is running ✓

## Step 2: Update Environment Variables

Edit `services/api/.env.local`:

```env
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=your_sql_server_password
DB_NAME=los_db
```

**Important:** Replace `Password123` with your actual SQL Server SA password.

## Step 3: Install Dependencies

```bash
cd d:\LOS\services\api
npm install
```

This will install the `mssql` driver for Node.js.

## Step 4: Setup Database

### Option 1: Automatic Setup (Recommended)

```bash
cd d:\LOS\services\api
npm run setup-db
```

You should see:
```
🔄 Connecting to SQL Server...
✓ Connected to SQL Server
📝 Executing 10 SQL statements...
✓ Database setup completed successfully!
```

### Option 2: Manual Setup with SQL Server Management Studio

1. Open SQL Server Management Studio (SSMS)
2. Connect to your SQL Server instance
3. Open `services/db/migrations/sqlserver_schema.sql`
4. Execute the script (F5)

### Option 3: Manual Setup with sqlcmd

```bash
cd d:\LOS\services\db\migrations
sqlcmd -S localhost -U sa -P Password123 -i sqlserver_schema.sql
```

## Step 5: Verify Database Setup

### Using SSMS
1. Open SQL Server Management Studio
2. Connect to your SQL Server
3. Expand "Databases"
4. You should see `los_db` database
5. Expand `los_db` → Tables
6. You should see 7 tables created

### Using sqlcmd
```bash
sqlcmd -S localhost -U sa -P Password123 -d los_db -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"
```

### Using Node.js
```bash
cd d:\LOS\services\api
node -e "
const sql = require('mssql');
const config = {
  server: 'localhost',
  authentication: {
    type: 'default',
    options: { userName: 'sa', password: 'Password123' }
  },
  options: { database: 'los_db', trustServerCertificate: true, encrypt: true }
};
new sql.ConnectionPool(config).connect().then(pool => {
  pool.query('SELECT * FROM lender_users').then(result => {
    console.log('Sample Users:', result.recordset);
    pool.close();
  });
});
"
```

## Step 6: Start the Application

```bash
cd d:\LOS
npm run dev
```

This will start:
- 🏪 Merchant Platform: http://localhost:3000
- 🏦 Lender Platform: http://localhost:3002
- 🔌 API Server: http://localhost:3001

## Step 7: Test the Setup

1. Open http://localhost:3002 (Lender Portal)
2. Navigate to "Manage Users" from the sidebar
3. You should see the 3 sample users
4. Try creating a new user - it should be saved to SQL Server

## Database Tables

| Table | Purpose |
|-------|---------|
| `lender_users` | Lender platform user management |
| `applications` | Loan applications |
| `application_details` | Basic application details |
| `project_details` | Project information |
| `financial_details` | Financial information |
| `users` | Platform users |
| `merchant_profiles` | Merchant business information |

## Sample Data

Three lender users are pre-loaded:

| Name | Email | Level | Role |
|------|-------|-------|------|
| John Doe | john.doe@example.com | L1 | Read-Only |
| Jane Smith | jane.smith@example.com | L2 | Admin |
| Bob Johnson | bob.johnson@example.com | L3 | Read-Only |

## Troubleshooting

### SQL Server Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** Ensure SQL Server is running
```bash
net start MSSQLSERVER
```

### Access Denied Error
```
Error: Login failed for user 'sa'
```
**Solution:** Check your password in `.env.local`

### Database Already Exists
```
Error: Database 'los_db' already exists
```
**Solution:** This is fine! The script uses `IF NOT EXISTS`

### Port Already in Use
```
Error: listen EADDRINUSE :::3001
```
**Solution:** Change PORT in `.env.local` or kill the process using port 3001

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

## SQL Server Connection String

For reference, the connection string used is:
```
Server=localhost;Database=los_db;User Id=sa;Password=Password123;Encrypt=true;TrustServerCertificate=true;
```

## Next Steps

1. ✅ SQL Server database is set up
2. ✅ API is connected to SQL Server
3. ✅ Manage Users page is working
4. 📝 Next: Implement authentication
5. 📝 Next: Connect applications to database
6. 📝 Next: Add more features

## Support

For issues or questions:
- Check SQL Server logs in Event Viewer
- Verify connection with SSMS
- Check API logs in console output
- Verify database with: `sqlcmd -S localhost -U sa -P Password123 -d los_db -Q "SELECT * FROM lender_users"`
