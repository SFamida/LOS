const sql = require('mssql');
require('dotenv').config();

async function testConnection() {
  const config = {
    server: 'GDCIT-LAPT388\\FAMEEDA',
    authentication: {
      type: 'ntlm',
      options: {
        domain: 'GDCIT',
      },
    },
    options: {
      database: 'master',
      trustServerCertificate: true,
      encrypt: false,
      connectionTimeout: 15000,
    },
  };

  try {
    console.log('Attempting to connect to:', config.server);
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✓ Connection successful!');
    
    const result = await pool.query('SELECT @@VERSION as version');
    console.log('SQL Server Version:', result.recordset[0].version);
    
    await pool.close();
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testConnection();
