const sql = require('mssql');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('\n=== Database Connection Test ===\n');
  
  const config = {
    server: process.env.DB_SERVER || 'localhost',
    authentication: {
      type: 'default',
      options: {
        userName: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
    },
    options: {
      database: process.env.DB_NAME || 'los_db',
      trustServerCertificate: true,
      encrypt: false,
      connectionTimeout: 15000,
      requestTimeout: 30000,
    },
  };

  // Use Windows Authentication if no username/password provided
  if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
    config.authentication = {
      type: 'ntlm',
      options: {
        domain: process.env.DB_DOMAIN || 'GDCIT',
      },
    };
  }

  console.log('Configuration:');
  console.log(`  Server: ${config.server}`);
  console.log(`  Database: ${config.options.database}`);
  console.log(`  Authentication Type: ${config.authentication.type}`);
  if (config.authentication.type === 'ntlm') {
    console.log(`  Domain: ${config.authentication.options.domain}`);
  }
  console.log('');

  try {
    console.log('Attempting to connect...');
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✓ Connected successfully!');

    // Test query
    console.log('\nRunning test query...');
    const result = await pool.request().query('SELECT @@version AS Version');
    console.log('✓ Query executed successfully!');
    console.log(`  SQL Server Version: ${result.recordset[0].Version}`);

    // Check if tables exist
    console.log('\nChecking for tables...');
    const tables = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE='BASE TABLE' 
      ORDER BY TABLE_NAME
    `);
    
    if (tables.recordset.length > 0) {
      console.log(`✓ Found ${tables.recordset.length} tables:`);
      tables.recordset.forEach(row => {
        console.log(`  - ${row.TABLE_NAME}`);
      });
    } else {
      console.log('⚠ No tables found in the database');
    }

    // Check for specific tables we need
    console.log('\nChecking for required tables...');
    const requiredTables = ['users', 'lender_users', 'applications'];
    for (const table of requiredTables) {
      const check = await pool.request().query(`
        SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME='${table}'
      `);
      const exists = check.recordset[0].count > 0;
      console.log(`  ${exists ? '✓' : '✗'} ${table}`);
    }

    await pool.close();
    console.log('\n✓ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Connection failed:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Ensure SQL Server is installed and running');
    console.error('2. Check that the server name is correct');
    console.error('3. Verify the database exists');
    console.error('4. For Windows Auth, ensure you have proper permissions');
    console.error('5. Check firewall settings if connecting remotely');
    process.exit(1);
  }
}

testDatabaseConnection();
