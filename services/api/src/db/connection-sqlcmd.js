const { execSync } = require('child_process');
const sql = require('mssql');
require('dotenv').config();

// Since SQL Server Browser isn't available, we'll use sqlcmd for initial connection
// and then try to establish a pool connection

let pool;

async function getConnection() {
  try {
    if (!pool) {
      // First, verify connection works with sqlcmd
      try {
        const server = process.env.DB_SERVER || 'GDCIT-LAPT388\\FAMEEDA';
        const testCmd = `sqlcmd -S ${server} -E -Q "SELECT 1"`;
        execSync(testCmd, { stdio: 'pipe' });
        console.log('✓ SQL Server verified with sqlcmd');
      } catch (err) {
        console.error('✗ SQL Server not accessible via sqlcmd:', err.message);
        throw err;
      }

      // Now try to create a pool connection
      // Use a configuration that works with Named Pipes
      const config = {
        server: process.env.DB_SERVER || 'GDCIT-LAPT388\\FAMEEDA',
        authentication: {
          type: 'ntlm',
          options: {
            domain: process.env.DB_DOMAIN || 'GDCIT',
          },
        },
        options: {
          database: process.env.DB_NAME || 'los_db',
          trustServerCertificate: true,
          encrypt: false,
          connectionTimeout: 15000,
          requestTimeout: 30000,
          useUTC: false,
          enableArithAbort: true,
        },
      };

      pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log('✓ SQL Server Database connected successfully');
      console.log(`  Server: ${process.env.DB_SERVER || 'GDCIT-LAPT388\\FAMEEDA'}`);
      console.log(`  Database: ${process.env.DB_NAME || 'los_db'}`);
    }
    return pool;
  } catch (error) {
    console.error('✗ SQL Server Database connection failed:', error.message);
    console.error('Please ensure SQL Server is running and credentials are correct in .env file');
    throw error;
  }
}

// Test connection on startup
getConnection().catch(err => {
  console.error('Connection error:', err.message);
});

module.exports = { getConnection, sql };
