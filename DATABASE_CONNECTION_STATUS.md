# Database Connection Diagnostic Report

## Current Status
❌ **SQL Server Not Available** - Cannot connect to localhost:1433

## Issue
The LOS platform is currently running with **in-memory data storage** (development mode) because SQL Server is not accessible.

## Database Requirements
- **Server**: SQL Server 2016 or later
- **Database**: los_db
- **Port**: 1433 (default)
- **Authentication**: Windows Authentication (NTLM) or SQL Authentication

## To Enable Database Connectivity

### Option 1: Install SQL Server Locally
1. Download SQL Server from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Run the installer and select "Developer Edition" (free for development)
3. Create a database named `los_db`
4. Run the schema setup: `npm run setup-db` from the LOS root directory

### Option 2: Use Existing SQL Server Instance
If you have SQL Server already installed, update the `.env` file in `services/api/.env`:

```env
DB_SERVER=<YOUR_SERVER_NAME>
DB_NAME=los_db
DB_USER=<username>
DB_PASSWORD=<password>
DB_DOMAIN=<DOMAIN>
```

### Option 3: Connect to Remote SQL Server
Update the `.env` file with your remote server details:

```env
DB_SERVER=<IP_ADDRESS_OR_HOSTNAME>
DB_NAME=los_db
DB_USER=sa
DB_PASSWORD=<YOUR_PASSWORD>
```

## Current Configuration
```
Server: localhost
Database: los_db
Port: 1433
Authentication: Windows (NTLM)
Domain: GDCIT
```

## Current Setup Status

### ✓ Working (In-Memory Storage)
- Create User: ✓
- Update User: ✓
- Delete User: ✓
- Fetch Users: ✓
- Applications: ✓

Sample data available:
- John Doe (john.doe@example.com) - L1, Read-Only
- Jane Smith (jane.smith@example.com) - L2, Admin

### ✗ Requires Database
- Persistent data storage
- Multi-user concurrent access
- Data backup and recovery

## Test Results
```
Configuration: ✓ Correct
Connection Test: ✗ Failed (localhost:1433 not responding)
Reason: SQL Server service not running
```

## To Test Connection Again

1. Ensure SQL Server is running
2. Run: `node services/api/test-connection.js`

## Files
- Connection config: `services/api/src/db/connection.js`
- Test script: `services/api/test-connection.js`
- User model (in-memory fallback): `services/api/src/models/User.js`
- Database schema: `services/db/migrations/sqlserver_schema.sql`

## API Endpoints Status
- ✓ Create User: POST /users (working with in-memory storage)
- ✓ Get Users: GET /users (working with in-memory storage)
- ✓ Update User: PATCH /users/:id (working with in-memory storage)
- ✓ Delete User: DELETE /users/:id (working with in-memory storage)

## Next Steps
1. Install/Configure SQL Server
2. Create los_db database
3. Run schema setup: `npm run setup-db`
4. Test connection: `node services/api/test-connection.js`
5. All data will automatically persist to database
