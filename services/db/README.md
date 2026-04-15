# Database Setup

This service contains database configuration and migrations for the LOS Platform.

## Setup

1. Create a MySQL database:
```sql
CREATE DATABASE los_db;
```

2. Run migrations:
```bash
npm run migrate
```

## Migrations

- `001_initial_schema.sql` - Initial database schema with applications, users, and merchant profiles

## Database Schema

### Applications
- Stores loan applications from both flows
- Links to merchant and customer information

### Users
- Merchant and lender user accounts
- Stores email, hashed passwords, and roles

### Merchant Profiles
- Additional merchant information
- Linked to user accounts
