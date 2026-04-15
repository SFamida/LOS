const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL...');
    
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
    });
    
    console.log('✓ Connected to MySQL');
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL statements and execute them
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`\n📝 Executing ${statements.length} SQL statements...\n`);
    
    for (const statement of statements) {
      try {
        await connection.query(statement);
        const firstLine = statement.split('\n')[0].substring(0, 60);
        console.log(`✓ ${firstLine}...`);
      } catch (error) {
        console.error(`✗ Error executing statement: ${error.message}`);
      }
    }
    
    console.log('\n✓ Database setup completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('   - Database: los_db');
    console.log('   - Tables: applications, users, merchant_profiles, lender_users, application_details, project_details, financial_details');
    console.log('   - Sample users: 3 lender users created');
    
    // Verify tables
    const [tables] = await connection.query('SHOW TABLES FROM los_db');
    console.log(`\n📋 Created ${tables.length} tables:`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    // Show sample data
    const [users] = await connection.query('SELECT * FROM lender_users');
    console.log(`\n👥 Sample Lender Users (${users.length}):`);
    users.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - Level: ${user.level}, Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('✗ Database setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure MySQL is running');
    console.error('2. Check your credentials in .env.local:');
    console.error(`   - DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.error(`   - DB_USER: ${process.env.DB_USER || 'root'}`);
    console.error(`   - DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : 'not set'}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Connection closed');
    }
  }
}

// Run setup
setupDatabase();
