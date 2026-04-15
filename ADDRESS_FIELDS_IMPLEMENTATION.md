# Address Fields Implementation - Complete

## Changes Made

### 1. Database Schema Updates

**Added columns to `applications` table:**
```sql
ALTER TABLE applications ADD 
  project_address TEXT,
  applicant_address TEXT,
  same_as_applicant_address BIT DEFAULT 0;
```

**Migration file updated:** `/services/db/migrations/sqlserver_schema.sql`
- Added three new columns to applications table schema
- project_address: Stores the project/property address
- applicant_address: Stores the applicant/contractor address  
- same_as_applicant_address: Boolean flag indicating if addresses are the same

### 2. Database Model Updates

**File: `/services/api/src/models/Application.js`**

**Updated `createApplication()` method:**
- Now accepts `projectDetails` containing address information
- Saves address fields to `applications` table in addition to `project_details` table
- INSERT statement now includes:
  - `@projectAddress` - from projectDetails.projectAddress
  - `@applicantAddress` - from projectDetails.applicantAddress
  - `@sameAsApplicantAddress` - from projectDetails.sameAsApplicantAddress (converted to BIT)

**Updated `getApplicationByToken()` method:**
- Now returns address fields in response:
  - `projectAddress`: app.project_address
  - `applicantAddress`: app.applicant_address
  - `sameAsApplicantAddress`: Boolean (converts BIT 0/1 to true/false)

**Updated `getAllApplications()` method:**
- SELECT query now includes address fields for all applications
- Returns list with:
  - phoneVerified (boolean)
  - ssnVerified (boolean)
  - projectAddress
  - applicantAddress
  - createdAt and updatedAt timestamps

### 3. Merchant Platform Updates

**File: `/apps/merchant-platform/app/applications/page.tsx`**

**Updated Application interface:**
```typescript
interface Application {
  id: string;
  applicationToken: string;
  customerName: string;
  customerEmail: string;
  loanAmount: string;
  flowType: string;
  status: string;
  phoneVerified?: boolean;
  ssnVerified?: boolean;
  projectAddress?: string;
  applicantAddress?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Updated `fetchApplications()` function:**
- Now properly extracts data from API response: `response.data.success && response.data.data`
- Added error handling and loading states
- Catches and displays errors in UI

**Enhanced table display:**
- Displays customer email
- Shows verification status (Phone ✓, SSN ✓) with badges
- Shows project or applicant address
- Updated row to use app.id instead of app.applicationToken for navigation
- Added loading state: "Loading applications..."
- Added error state display

### 4. Lender Platform Updates

**File: `/apps/lender-platform/app/applications/page.tsx`**

**Updated Application interface:**
- Same enhanced interface as merchant platform
- Includes all address and verification fields

**Updated `fetchApplications()` function:**
- Properly handles API response structure
- Added loading and error state management
- Improves user feedback

**Enhanced table display:**
- Added Email column
- Shows phone and SSN verification status with badges
- Displays address information
- Improved date formatting
- Navigation uses app.id instead of application token

### 5. API Response Structure

**GET /applications endpoint now returns:**
```json
{
  "success": true,
  "data": [
    {
      "id": "APP-xxx",
      "applicationToken": "APP-xxx",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "loanAmount": "50000.00",
      "flowType": "customer-led|contractor-led",
      "status": "draft|pending|submitted|approved|rejected",
      "phoneVerified": true|false,
      "ssnVerified": true|false,
      "projectAddress": "123 Main St, City, State 12345" (or NULL for customer-led),
      "applicantAddress": "456 Oak Ave, Town, State 67890" (or NULL for customer-led),
      "createdAt": "2026-04-15 17:18:15.483",
      "updatedAt": "2026-04-15 17:20:26.897"
    }
  ]
}
```

## Testing

### API Endpoint Test
```powershell
Invoke-WebRequest -Uri "http://localhost:3003/applications" -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Result:** ✅ Address fields are properly returned in API response

### Merchant Platform
- **URL:** http://localhost:3002/applications (or auto-assigned port)
- **Features:** Displays all applications with address fields and verification status
- **Status:** ✅ Updated with new Application interface and enhanced table

### Lender Platform  
- **URL:** http://localhost:3004/applications (or auto-assigned port)
- **Features:** Displays all applications with address fields and verification status
- **Status:** ✅ Updated with new Application interface and enhanced table

## Application Data Flow

### Contractor-Led Flow
1. Merchant fills form with addresses (project_address, applicant_address)
2. POST /applications saves to both:
   - `applications` table (address columns)
   - `project_details` table (full project data)
3. GET /applications returns address fields from applications table
4. Platforms display address for quick reference

### Customer-Led Flow
1. Merchant creates application without complete details
2. Customer completes verification steps (phone, SSN)
3. Address fields stored as NULL in applications table
4. Platforms show "—" or NULL for address until contractor-led details filled

## Database Schema

**Applications Table Structure:**
```
id (PK)
application_token (UNIQUE)
customer_name
customer_email
contractor_name
business_name
loan_amount
loan_purpose
flow_type
status
phone_verified (BIT) ← For quick DB queries
ssn_verified (BIT) ← For quick DB queries
project_address (TEXT) ← NEW
applicant_address (TEXT) ← NEW
same_as_applicant_address (BIT) ← NEW
created_at
updated_at
```

## Performance Optimizations

1. **Address fields saved in applications table** - Enables faster queries without JOIN to project_details
2. **Boolean fields cached in applications table** - phone_verified, ssn_verified available for quick filtering
3. **Simple SELECT queries** - No complex JOINs needed for most operations
4. **Indexed on status** - Existing index helps filter non-draft applications

## Migration Path

For existing installations:
```sql
-- Add new columns if they don't exist
IF NOT EXISTS (
  SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'applications' AND COLUMN_NAME = 'project_address'
)
BEGIN
  ALTER TABLE applications ADD  
    project_address TEXT,
    applicant_address TEXT,
    same_as_applicant_address BIT DEFAULT 0;
END
```

## Summary

✅ Address fields are now:
- Stored in applications table for quick access
- Returned in all API responses
- Displayed in merchant platform applications list
- Displayed in lender platform applications list
- Properly formatted with verification status
- Supporting both customer-led and contractor-led flows
