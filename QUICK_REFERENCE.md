# ⚡ Quick Start - Windows Authentication

## Your SQL Server Details
```
Server: GDCIT-LAPT388\FAMEEDA
Authentication: Windows (NTLM)
Domain: GDCIT
Database: los_db
```

## 3-Step Setup

### Step 1: Install Dependencies
```bash
cd d:\LOS\services\api
npm install
```

### Step 2: Create Database
```bash
npm run setup-db
```

### Step 3: Start Application
```bash
cd d:\LOS
npm run dev
```

## ✅ Success Indicators

You should see:
```
✓ Connected to SQL Server
✓ Database setup completed successfully!
👥 Sample Lender Users (3):
   - John Doe (john.doe@example.com) - Level: L1, Role: Read-Only
   - Jane Smith (jane.smith@example.com) - Level: L2, Role: Admin
   - Bob Johnson (bob.johnson@example.com) - Level: L3, Role: Read-Only
```

## 🌐 Access Application

- Merchant Portal: http://localhost:3000
- Lender Portal: http://localhost:3002
- API Server: http://localhost:3001

## 🧪 Test It

1. Go to http://localhost:3002
2. Click "Manage Users" in sidebar
3. You should see 3 sample users
4. Try creating a new user
5. Data saves to SQL Server ✓

## ❌ Troubleshooting

### SQL Server Not Found
```bash
# Verify SQL Server is running
sc query MSSQL$FAMEEDA

# Should show: STATE : 4 RUNNING
```

### Connection Failed
- Ensure you're logged in with GDCIT domain account
- Verify SQL Server allows Windows Authentication
- Check server name: `GDCIT-LAPT388\FAMEEDA`

### Port Already in Use
Edit `.env.local` and change `PORT=3001` to another port

## 📁 Configuration Files

- `.env.local` - Already configured ✓
- `src/db/connection.js` - Windows Auth enabled ✓
- `src/db/setup.js` - Ready to run ✓

## 🎯 Next Steps

1. ✅ Database setup complete
2. ✅ API connected to SQL Server
3. ✅ Manage Users working
4. 📝 Add authentication
5. 📝 Connect applications
6. 📝 Deploy to production

---

**Everything is ready!** Just run the 3 steps above. 🚀
