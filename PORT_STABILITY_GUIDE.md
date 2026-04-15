# LOS Platform - Port Stability Guide

## Current Port Configuration
- **API Server**: 3003 (nodemon with auto-restart)
- **Merchant Platform**: 3001 (Next.js)
- **Lender Platform**: 3000 (Next.js)

## Why Ports Change
Ports increment (3001→3002→3003, etc.) when:
1. **Node processes don't close cleanly** after crashes
2. **Port remains blocked** even after process exits
3. **Multiple restart attempts** by nodemon fail

## How to Keep Ports Stable

### ✅ Best Practice: Clean Startup
```powershell
# 1. Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Wait for ports to free up
Start-Sleep -Seconds 2

# 3. Verify ports are free
netstat -ano | findstr ":3003"

# 4. Start dev server
cd d:\LOS
npm run dev
```

### ⚠️ Avoid These Common Issues

**Issue 1: Making file changes too frequently**
- Edit code thoroughly before saving
- Test changes in one batch rather than incremental edits
- Reduces nodemon restart cycles

**Issue 2: Leaving TCP connections open**
- Close old terminal windows before starting new dev sessions
- Don't run multiple `npm run dev` commands in parallel

**Issue 3: Checking ports while dev server is restarting**
- Give the dev server 5-10 seconds to fully boot
- Use `netstat` after confirming "Ready" message appears in terminal

### 🔍 Monitor Port Status
```powershell
# Check if API port is in use
netstat -ano | findstr ":3003"

# Kill specific process if needed
taskkill /PID <ProcessID> /F

# Verify all three ports are available
@(3000, 3001, 3003) | ForEach-Object { 
  $result = netstat -ano | findstr ":$_"
  Write-Host "Port $_`: $($result -join ', ')"
}
```

## Address Fields - Status Summary

### Customer-Led Flow ✓
- Contractor enters: Name, Email, Phone, SSN, DOB, Amount
- Address fields in DB: **NULL** (as designed)
- Customer fills app details via email link later

### Contractor-Led Flow ✓
- Contractor enters: All personal + address details
- Address fields in DB: **POPULATED** with 4 components each
  - Project: Address Line, City, State, Zip Code
  - Applicant: Address Line, City, State, Zip Code
- Both project and applicant address saved separately

## Current Implementation
- **Location**: `/services/api/src/models/Application.js`
- **Method**: `createApplication()`
- **Properties**: 8 total address fields (4 per address)
- **Status**: ✓ Both flows working correctly
