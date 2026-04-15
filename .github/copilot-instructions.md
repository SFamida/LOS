# LOS Platform - Copilot Instructions

This is a monorepo for the Loan Origination System (LOS) with two platforms: Merchant and Lender.

## Project Structure
- **apps/merchant-platform**: Next.js app for contractors/merchants
- **apps/lender-platform**: Next.js app for lenders
- **packages/ui**: Shared Bootstrap UI components
- **packages/types**: Shared TypeScript types
- **services/api**: Node.js/Express backend API
- **services/db**: Database configuration and migrations

## Tech Stack
- **Monorepo**: Turborepo
- **Frontend**: Next.js with Bootstrap
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Authentication**: JWT tokens
- **Package Manager**: npm/yarn workspaces

## Key Features
1. Merchant Platform with Create Application button
   - Customer Led Flow: Contractor fills basic details, customer completes form via email link
   - Contractor Led Flow: Contractor fills all details and submits
2. Lender Platform for loan management
3. Shared components and types across platforms
4. JWT-based authentication

## Development Workflow
- Run `npm install` in root to install all dependencies
- Run `npm run dev` to start all apps in development mode
- Run `npm run build` to build all apps
