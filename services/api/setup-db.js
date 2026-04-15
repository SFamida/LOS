const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('\n=== Database Setup and Diagnostic ===\n');
  
  const config = {
    server: process.env.DB_SERVER || 'GDCIT-LAPT388\\FAMEEDA',
    options: {
      trustServerCertificate: true,
      encrypt: true,
    },
    authentication: {
      type: 'ntlm',
      options: {
        domain: process.env.DB_DOMAIN || 'GDCIT',
      },
    },
  };

  console.log('Configuration:');
  console.log(`  Server: ${config.server}`);
  console.log(`  Enable Encryption: ${config.options.encrypt}`);
  console.log(`  Trust Server Cert: ${config.options.trustServerCertificate}`);
  console.log(`  Auth Type: ${config.authentication.type}`);
  console.log('');

  try {
    console.log('Step 1: Testing connection to SQL Server...');
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✓ Connected successfully!\n');

    // Step 2: Create database
    console.log('Step 2: Verifying/Creating database...');
    const checkDbResult = await pool.request()
      .query(`SELECT name FROM sys.databases WHERE name = 'los_db'`);
    
    if (checkDbResult.recordset.length === 0) {
      console.log('  Creating los_db database...');
      await pool.request().query('CREATE DATABASE los_db');
      console.log('  ✓ Database created');
    } else {
      console.log('  ✓ Database already exists');
    }

    // Step 3: Use the database
    console.log('\nStep 3: Switching to los_db database...');
    await pool.request().query('USE los_db');
    console.log('  ✓ Switched to los_db\n');

    // Step 4: Create tables
    console.log('Step 4: Creating tables...');
    
    // Users table
    console.log('  Creating users table...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
      BEGIN
        CREATE TABLE users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE()
        );
        CREATE INDEX idx_email ON users(email);
        CREATE INDEX idx_role ON users(role);
      END
    `);
    console.log('    ✓ users table created/verified');

    // Lender Users table
    console.log('  Creating lender_users table...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'lender_users')
      BEGIN
        CREATE TABLE lender_users (
          id VARCHAR(255) PRIMARY KEY,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          level VARCHAR(10) DEFAULT 'L1',
          role VARCHAR(50) DEFAULT 'Read-Only',
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE()
        );
        CREATE INDEX idx_email ON lender_users(email);
        CREATE INDEX idx_level ON lender_users(level);
        CREATE INDEX idx_role ON lender_users(role);
      END
    `);
    console.log('    ✓ lender_users table created/verified');

    // Applications table
    console.log('  Creating applications table...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'applications')
      BEGIN
        CREATE TABLE applications (
          id VARCHAR(255) PRIMARY KEY,
          application_token VARCHAR(255) UNIQUE NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          contractor_name VARCHAR(255),
          business_name VARCHAR(255),
          loan_amount DECIMAL(15, 2),
          loan_purpose VARCHAR(255),
          flow_type VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          phone_verified BIT DEFAULT 0,
          ssn_verified BIT DEFAULT 0,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE()
        );
        CREATE INDEX idx_customer_email ON applications(customer_email);
        CREATE INDEX idx_status ON applications(status);
        CREATE INDEX idx_application_token ON applications(application_token);
      END
    `);
    console.log('    ✓ applications table created/verified\n');

    // Step 5: Verify tables
    console.log('Step 5: Verifying tables...');
    const tables = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE='BASE TABLE' 
      ORDER BY TABLE_NAME
    `);
    
    console.log(`  Found ${tables.recordset.length} tables:`);
    tables.recordset.forEach(row => {
      console.log(`    ✓ ${row.TABLE_NAME}`);
    });

    // Step 6: Check table structure
    console.log('\nStep 6: Verifying users table columns...');
    const columns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='users'
      ORDER BY ORDINAL_POSITION
    `);
    
    if (columns.recordset.length > 0) {
      console.log('  users table columns:');
      columns.recordset.forEach(col => {
        console.log(`    ✓ ${col.COLUMN_NAME} (${col.DATA_TYPE}, ${col.IS_NULLABLE === 'YES' ? 'nullable' : 'NOT NULL'})`);
      });
    } else {
      console.log('  ✗ users table not found or empty');
    }

    // Step 7: Test insert
    console.log('\nStep 7: Testing INSERT into users table...');
    const testId = `TEST-${Date.now()}`;
    try {
      await pool.request()
        .input('id', sql.VarChar, testId)
        .input('email', sql.VarChar, 'test@example.com')
        .input('passwordHash', sql.VarChar, 'hashedpassword')
        .input('role', sql.VarChar, 'admin')
        .query('INSERT INTO users (id, email, password_hash, role) VALUES (@id, @email, @passwordHash, @role)');
      
      console.log('  ✓ INSERT successful');
      
      // Verify insert
      const checkInsert = await pool.request()
        .input('id', sql.VarChar, testId)
        .query('SELECT * FROM users WHERE id = @id');
      
      if (checkInsert.recordset.length > 0) {
        console.log('  ✓ Verification: Record found in users table');
        console.log(`    ID: ${checkInsert.recordset[0].id}`);
        console.log(`    Email: ${checkInsert.recordset[0].email}`);
        console.log(`    Role: ${checkInsert.recordset[0].role}`);
      }
    } catch (insertError) {
      console.error('  ✗ INSERT failed:', insertError.message);
    }

    await pool.close();
    console.log('\n✓ Database setup and verification completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Setup failed:', error.message);
    console.error('\nStack:', error.stack);
    console.error('\nTroubleshooting:');
    console.error('1. Check SQL Server is running: Get-Service MSSQL$FAMEEDA');
    console.error('2. Verify connection string in .env.local');
    console.error('3. Ensure database permissions are correct');
    process.exit(1);
  }
}

setupDatabase();
