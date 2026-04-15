const sql = require('mssql');

async function testDirectPipe() {
  const config = {
    server: '.',
    instanceName: 'FAMEEDA',
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
    console.log('Testing connection with dot notation...');
    
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✓ Connection successful!');
    
    const result = await pool.query('SELECT @@VERSION as version');
    console.log('SQL Server Version:', result.recordset[0].version.substring(0, 60));
    
    await pool.close();
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
  }
}

testDirectPipe();
