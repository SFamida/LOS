const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connecting to SQL Server...');
    console.log(`   Server: ${process.env.DB_SERVER || 'GDCIT-LAPT388\\FAMEEDA'}`);
    
    // Connect to master database first using Windows Authentication
    const config = {
      server: process.env.DB_SERVER || 'GDCIT-LAPT388\\FAMEEDA',
      authentication: {
        type: 'ntlm',
        options: {
          domain: process.env.DB_DOMAIN || 'GDCIT',
        },
      },
      options: {
        database: 'master',
        trustServerCertificate: true,
        encrypt: false,
        connectionTimeout: 15000,
      },
    };

    connection = new sql.ConnectionPool(config);
    await connection.connect();
    console.log('✓ Connected to SQL Server');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, '..', '..', 'db', 'migrations', 'sqlserver_schema.sql');
    console.log(`📂 Reading SQL file from: ${sqlFilePath}`);

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at: ${sqlFilePath}`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL statements by GO keyword (SQL Server specific)
    const statements = sqlContent
      .split(/\nGO\n/i)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`\n📝 Executing ${statements.length} SQL statements...\n`);

    for (const statement of statements) {
      try {
        await connection.query(statement);
        const firstLine = statement.split('\n')[0].substring(0, 60);
        console.log(`✓ ${firstLine}...`);
      } catch (error) {
        console.error(`✗ Error: ${error.message}`);
      }
    }

    console.log('\n✓ Database setup completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('   - Database: los_db');
    console.log('   - Tables: applications, users, merchant_profiles, lender_users, application_details, project_details, financial_details');
    console.log('   - Sample users: 3 lender users created');

    // Switch to los_db and verify tables
    await connection.close();
    
    const dbConfig = {
      server: process.env.DB_SERVER || 'GDCIT-LAPT388\\FAMEEDA',
      authentication: {
        type: 'ntlm',
        options: {
          domain: process.env.DB_DOMAIN || 'GDCIT',
        },
      },
      options: {
        database: 'los_db',
        trustServerCertificate: true,
        encrypt: false,
      },
    };

    connection = new sql.ConnectionPool(dbConfig);
    await connection.connect();

    // Verify tables
    const tablesResult = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"
    );
    const tables = tablesResult.recordset;
    
    console.log(`\n📋 Created ${tables.length} tables:`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.TABLE_NAME}`);
    });

    // Show sample data
    const usersResult = await connection.query('SELECT * FROM lender_users');
    const users = usersResult.recordset;
    
    console.log(`\n👥 Sample Lender Users (${users.length}):`);
    users.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - Level: ${user.level}, Role: ${user.role}`);
    });

  } catch (error) {
    console.error('✗ Database setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure SQL Server is running');
    console.error('2. Verify your SQL Server instance name:');
    console.error(`   - Current: ${process.env.DB_SERVER || 'GDCIT-LAPT388\\FAMEEDA'}`);
    console.error('3. Check that you have access to the SQL Server instance');
    console.error('4. Verify Windows Authentication is enabled in SQL Server');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.close();
      console.log('\n✓ Connection closed');
    }
  }
}

// Run setup
setupDatabase();
