# 🚀 LOS Platform - SQL Server Setup (Windows Authentication)

## Your Configuration

- **Server:** GDCIT-LAPT388\FAMEEDA
- **Authentication:** Windows Authentication (NTLM)
- **Domain:** GDCIT
- **Database:** los_db

## Step 1: Verify SQL Server is Running

### Check SQL Server Service
```bash
# Open Services (services.msc)
# Look for: SQL Server (FAMEEDA)
# Status should be: Running
```

Or in Command Prompt:
```bash
sc query MSSQL$FAMEEDA
```

### Verify Connection with SSMS
1. Open SQL Server Management Studio
2. Server name: `GDCIT-LAPT388\FAMEEDA`
3. Authentication: Windows Authentication
4. Click Connect
5. If successful, you're good to go ✓

## Step 2: Environment Configuration

The `.env.local` file is already configured:

```env
DB_SERVER=GDCIT-LAPT388\FAMEEDA
DB_NAME=los_db
DB_DOMAIN=GDCIT
```

**No username/password needed** - Windows Authentication uses your current Windows login.

## Step 3: Install Dependencies

```bash
cd d:\LOS\services\api
npm install
```

This installs the `mssql` package with Windows Authentication support.

## Step 4: Create Database (First Time Only)

### Option 1: Automatic Setup (Recommended)

```bash
cd d:\LOS\services\api
npm run setup-db
```

You should see:
```
🔄 Connecting to SQL Server...
   Server: GDCIT-LAPT388\FAMEEDA
✓ Connected to SQL Server
📝 Executing 10 SQL statements...
✓ Database setup completed successfully!
```

### Option 2: Manual Setup with SSMS

1. Open SQL Server Management Studio
2. Connect to `GDCIT-LAPT388\FAMEEDA` with Windows Authentication
3. Open `services/db/migrations/sqlserver_schema.sql`
4. Execute (F5)

### Option 3: Manual Setup with sqlcmd

```bash
cd d:\LOS\services\db\migrations
sqlcmd -S GDCIT-LAPT388\FAMEEDA -E -i sqlserver_schema.sql
```

Note: `-E` flag uses Windows Authentication

## Step 5: Verify Database Setup

### Using SSMS
1. Open SQL Server Management Studio
2. Connect to `GDCIT-LAPT388\FAMEEDA`
3. Expand "Databases"
4. You should see `los_db`
5. Expand `los_db` → Tables
6. You should see 7 tables

### Using sqlcmd
```bash
sqlcmd -S GDCIT-LAPT388\FAMEEDA -E -d los_db -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"
```

### Using Node.js
```bash
cd d:\LOS\services\api
node -e "
const sql = require('mssql');
const config = {
  server: 'GDCIT-LAPT388\\\\FAMEEDA',
  authentication: { type: 'ntlm', options: { domain: 'GDCIT' } },
  options: { database: 'los_db', trustServerCertificate: true, encrypt: false }
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

### Connection Failed: "Login failed"
```
Error: Login failed for user 'GDCIT\username'
```
**Solution:** 
- Ensure you're logged in with a GDCIT domain account
- Verify SQL Server allows Windows Authentication
- Check SQL Server Configuration Manager

### Connection Failed: "Named Pipes Provider"
```
Error: Named Pipes Provider: Could not open a connection to SQL Server
```
**Solution:**
- Verify SQL Server is running: `sc query MSSQL$FAMEEDA`
- Check server name: `GDCIT-LAPT388\FAMEEDA`
- Verify Named Pipes is enabled in SQL Server Configuration Manager

### Database Not Created
- Run setup script: `npm run setup-db`
- Or manually run: `sqlcmd -S GDCIT-LAPT388\FAMEEDA -E -i services/db/migrations/sqlserver_schema.sql`

### npm install Failed
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

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
Server=GDCIT-LAPT388\FAMEEDA;Database=los_db;Integrated Security=true;Encrypt=false;TrustServerCertificate=true;
```

## Next Steps

1. ✅ SQL Server database is set up
2. ✅ API is connected to SQL Server
3. ✅ Manage Users page is working
4. 📝 Next: Implement authentication
5. 📝 Next: Connect applications to database
6. 📝 Next: Add more features

## Support

For SQL Server specific issues:
- Check SQL Server Configuration Manager
- Verify Windows Authentication is enabled
- Check SQL Server error logs
- Use SQL Server Management Studio for debugging
- Verify your Windows user has access to the SQL Server instance

---

**Setup complete!** Your LOS Platform is now connected to SQL Server with Windows Authentication. 🎉
