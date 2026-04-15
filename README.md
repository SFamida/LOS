# LOS Platform - Loan Origination System

A comprehensive monorepo for the Loan Origination System with two platforms: Merchant and Lender.

## Project Overview

The LOS Platform enables contractors/merchants to create loan applications with two distinct workflows:
- **Customer Led Flow**: Contractor initiates, customer completes via email link
- **Contractor Led Flow**: Contractor fills entire application on behalf of customer

Lenders can review, manage, and process all applications through a centralized platform.

## Project Structure

```
los/
├── apps/
│   ├── merchant-platform/       # Next.js app for contractors
│   └── lender-platform/         # Next.js app for lenders
├── packages/
│   ├── ui/                      # Shared Bootstrap components
│   └── types/                   # Shared TypeScript types
├── services/
│   ├── api/                     # Node.js/Express backend API
│   └── db/                      # Database configuration & migrations
├── package.json                 # Root monorepo config
└── turbo.json                   # Turborepo configuration
```

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + Bootstrap 5
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Authentication**: JWT tokens
- **Monorepo**: Turborepo
- **Package Manager**: npm/yarn workspaces

## Prerequisites

- Node.js 18+ 
- npm or yarn
- MySQL 8.0+

## Installation

```bash
# Install dependencies for all workspaces
npm install

# Or use yarn
yarn install
```

## Development

### Start all applications in development mode:
```bash
npm run dev
```

This will start:
- Merchant Platform on `http://localhost:3000`
- Lender Platform on `http://localhost:3002`
- API Server on `http://localhost:3001`

### Individual services:

**Merchant Platform:**
```bash
cd apps/merchant-platform
npm run dev
```

**Lender Platform:**
```bash
cd apps/lender-platform
npm run dev
```

**API Server:**
```bash
cd services/api
npm run dev
```

## Building

Build all applications:
```bash
npm run build
```

## Project Files

### Merchant Platform 
- [apps/merchant-platform/app/page.tsx](apps/merchant-platform/app/page.tsx) - Main dashboard with Create Application button
- [apps/merchant-platform/components/ApplicationFlow.tsx](apps/merchant-platform/components/ApplicationFlow.tsx) - Application form for both flows

### Lender Platform
- [apps/lender-platform/app/page.tsx](apps/lender-platform/app/page.tsx) - Applications dashboard

### API Service
- [services/api/src/routes/applications.js](services/api/src/routes/applications.js) - Application endpoints

### Database
- [services/db/migrations/001_initial_schema.sql](services/db/migrations/001_initial_schema.sql) - Database schema

## Features

### Merchant Platform
✅ Dashboard with applications overview  
✅ Create Application button  
✅ Customer Led Flow - collect basic info, send link to customer  
✅ Contractor Led Flow - fill complete application  
✅ Application status tracking  

### Lender Platform
✅ View all applications  
✅ Track application status  
✅ Review applications  
✅ Application statistics  

### API
✅ Create applications  
✅ Retrieve applications  
✅ Update application status  
✅ Email notifications (configured)  

## Environment Configuration

Create `.env.local` files in each service based on `.env.example`:

**services/api/.env:**
```
PORT=3001
NODE_ENV=development
JWT_SECRET=your_secret_key_here
```

**Database:**
```
DATABASE_URL=mysql://username:password@localhost:3306/los_db
```

## Database Setup

1. Create database:
```bash
mysql -u root -p
CREATE DATABASE los_db;
```

2. Run migrations:
```bash
cd services/db
npm run migrate
```

## Shared Packages

### @los/types
TypeScript type definitions used across platforms:
- `Application` - Application data model
- `FlowType` - 'customer-led' or 'contractor-led'
- `ApplicationStatus` - pending, in-progress, approved, rejected
- `AuthPayload` - JWT authentication data

### @los/ui
Bootstrap components re-exported for consistent usage across platforms.

## Next Steps

1. **Database Setup**: Configure MySQL and run migrations
2. **Environment Variables**: Create `.env.local` files for each service
3. **API Integration**: Connect frontend to backend API endpoints
4. **Authentication**: Implement JWT token generation and validation
5. **Email Service**: Configure email sending for customer-led flow links

## Contributing

- Use TypeScript for type safety
- Follow the existing component structure
- Test changes locally before committing
- Keep shared types in `@los/types` package
- Use Bootstrap classes for styling consistency

## License

Proprietary - LOS Platform
