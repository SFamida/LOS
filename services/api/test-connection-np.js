const sql = require('mssql');
require('dotenv').config();

async function testNamedPipes() {
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
      enableArithAbort: true,
    },
  };

  try {
    console.log('Testing Named Pipes connection...');
    console.log('Server:', config.server);
    
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✓ Connection successful!');
    
    const result = await pool.query('SELECT @@VERSION as version, DB_NAME() as database');
    console.log('SQL Server Version:', result.recordset[0].version.substring(0, 60));
    console.log('Current Database:', result.recordset[0].database);
    
    await pool.close();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testNamedPipes();
