# LOS Platform - Getting Started Guide

## Quick Start

### 1. Installation (Already Done ✓)
Dependencies have been installed in the root monorepo.

### 2. Environment Setup

Ensure `.env.local` files exist in:
- `services/api/.env.local` ✓
- `apps/merchant-platform/.env.local` ✓
- `apps/lender-platform/.env.local` ✓

### 3. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE los_db;

# Run migrations
cd services/db
npm run migrate
```

### 4. Start Development Servers

**Option A: Start All Services**
```bash
npm run dev
```

This starts:
- 🛍️ Merchant Platform: `http://localhost:3000`
- 👨‍💼 Lender Platform: `http://localhost:3002`
- 🔌 API Server: `http://localhost:3001`

**Option B: Start Individual Services**

Terminal 1 - Merchant Platform:
```bash
cd apps/merchant-platform
npm run dev
```

Terminal 2 - Lender Platform:
```bash
cd apps/lender-platform
npm run dev
```

Terminal 3 - API Server:
```bash
cd services/api
npm run dev
```

## Key URLs

| Platform | URL | Description |
|----------|-----|-------------|
| Merchant Platform | `http://localhost:3000` | Create applications |
| Lender Platform | `http://localhost:3002` | Review applications |
| API Server | `http://localhost:3001` | Backend API |
| API Health Check | `http://localhost:3001/health` | API status |

## Using the Merchant Platform

1. Open `http://localhost:3000` in your browser
2. Click "Create Application" button
3. Choose one of two flows:
   - **Customer Led Flow**: Fill basic details, customer completes via email
   - **Contractor Led Flow**: Fill all details on behalf of customer
4. Complete the form and submit

## Using the Lender Platform

1. Open `http://localhost:3002` in your browser
2. View all applications in the dashboard
3. See statistics:
   - Total Applications
   - Pending Review
   - Approved Applications
4. Click "Review" to open application details

## File Structure Overview

```
los/
├── apps/
│   ├── merchant-platform/    # Next.js app at port 3000
│   │   ├── app/              # Pages (page.tsx = dashboard)
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities (api.ts)
│   │   └── public/           # Static files
│   └── lender-platform/      # Next.js app at port 3002
│       └── (same structure)
├── packages/
│   ├── ui/                   # Shared Bootstrap components
│   └── types/                # Shared TypeScript types
└── services/
    ├── api/                  # Express.js backend (port 3001)
    │   └── src/
    │       ├── routes/       # API endpoints
    │       └── index.js      # Server entry point
    └── db/                   # Database config & migrations
```

## Key Features Implemented

### Merchant Platform ✓
- ✅ Dashboard with Create Application button
- ✅ Customer Led Flow section
  - Basic contractor/business info
  - Customer name & email
  - Email summary showing customer link
- ✅ Contractor Led Flow section
  - Full application form
  - Loan amount & purpose
  - Direct submission
- ✅ Error handling & loading states

### Lender Platform ✓
- ✅ Dashboard with application overview
- ✅ Statistics cards (Total, Pending, Approved)
- ✅ Applications table with:
  - Customer name
  - Business name
  - Loan amount
  - Flow type badge
  - Status badge
  - Review button

### API Backend ✓
- ✅ Express.js server
- ✅ Application creation endpoint
- ✅ Application retrieval endpoints
- ✅ Status update endpoint
- ✅ CORS configured
- ✅ Error handling

### Shared Code ✓
- ✅ @los/types package with TypeScript definitions
- ✅ @los/ui package with Bootstrap component exports
- ✅ API client with axios interceptors for auth

## Next Steps for Production

1. **Authentication**: Implement JWT login/register
2. **Database**: Replace mock data with real MySQL queries
3. **Email**: Configure email service for customer-led flow links
4. **Validation**: Add server-side input validation
5. **Testing**: Add unit and integration tests
6. **Deployment**: Set up CI/CD and hosting

## Troubleshooting

### Port Already in Use
If ports 3000, 3001, or 3002 are already in use:
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux
lsof -i :3000
kill -9 [PID]
```

### API Connection Error
- Check API server is running on `http://localhost:3001`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Development Commands

```bash
# Build all apps
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Run specific app
cd apps/merchant-platform && npm run dev
```

## Support

For questions or issues:
1. Check this guide
2. Review README.md for architecture details
3. Check individual service READMEs
4. Review error messages in browser console and terminal

---

**Happy building! 🚀**
