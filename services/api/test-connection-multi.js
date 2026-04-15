const sql = require('mssql');
require('dotenv').config();

// Try multiple connection approaches
const configs = [
  // Approach 1: Named instance with NTLM
  {
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
    },
  },
  // Approach 2: Using localhost with instance
  {
    server: 'localhost',
    instanceName: 'FAMEEDA',
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
    },
  },
  // Approach 3: Direct IP with port
  {
    server: '127.0.0.1',
    port: 1433,
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
    },
  },
];

async function testConnections() {
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    console.log(`\n[Attempt ${i + 1}] Testing connection...`);
    console.log('Config:', JSON.stringify(config, null, 2));
    
    try {
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log('✓ Connection successful!');
      
      const result = await pool.query('SELECT @@VERSION as version');
      console.log('SQL Server Version:', result.recordset[0].version.substring(0, 50));
      
      await pool.close();
      return config;
    } catch (error) {
      console.error('✗ Failed:', error.message);
    }
  }
  
  console.log('\n✗ All connection attempts failed');
}

testConnections();
