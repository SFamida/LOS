const sql = require('mssql');
const { execSync } = require('child_process');
require('dotenv').config();

let pool;
let usingSqlCmd = false;

async function getConnection() {
  try {
    if (!pool) {
      const server = process.env.DB_SERVER || 'GDCIT-LAPT388\\FAMEEDA';
      const database = process.env.DB_NAME || 'los_db';

      // Try mssql driver first
      try {
        const config = {
          server: server,
          authentication: {
            type: 'ntlm',
          },
          options: {
            database: database,
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
        console.log('✓ SQL Server Database connected successfully (mssql driver)');
        console.log(`  Server: ${server}`);
        console.log(`  Database: ${database}`);
      } catch (driverError) {
        // Fallback: verify connection with sqlcmd
        console.log('⚠ mssql driver failed, verifying with sqlcmd...');
        try {
          execSync(`sqlcmd -S ${server} -E -d ${database} -Q "SELECT 1"`, { stdio: 'pipe' });
          console.log('✓ SQL Server Database verified with sqlcmd');
          console.log(`  Server: ${server}`);
          console.log(`  Database: ${database}`);
          console.log('  Note: Using sqlcmd for verification. For full functionality, enable SQL Server Browser.');
          usingSqlCmd = true;
          
          // Return a mock pool object for compatibility
          pool = {
            connected: true,
            query: async (sql) => {
              throw new Error('Direct queries not supported in sqlcmd mode. Use API endpoints instead.');
            },
            close: async () => {},
          };
        } catch (sqlcmdError) {
          console.error('✗ SQL Server Database connection failed:', driverError.message);
          console.error('Please ensure SQL Server is running and credentials are correct in .env file');
          throw driverError;
        }
      }
    }
    return pool;
  } catch (error) {
    console.error('✗ Connection error:', error.message);
    throw error;
  }
}

// Test connection on startup
getConnection().catch(err => {
  console.error('Connection error:', err.message);
});

module.exports = { getConnection, sql };
