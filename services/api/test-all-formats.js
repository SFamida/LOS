const sql = require('mssql');

async function test() {
  const configs = [
    { server: 'GDCIT-LAPT388\\FAMEEDA', name: 'Full machine name' },
    { server: 'localhost\\FAMEEDA', name: 'localhost' },
    { server: '127.0.0.1\\FAMEEDA', name: '127.0.0.1' },
    { server: '.\\FAMEEDA', name: 'dot notation' },
  ];

  for (const cfg of configs) {
    try {
      console.log(`\nTrying: ${cfg.name} (${cfg.server})`);
      const pool = new sql.ConnectionPool({
        server: cfg.server,
        authentication: {
          type: 'ntlm',
          options: { domain: 'GDCIT' },
        },
        options: {
          database: 'master',
          trustServerCertificate: true,
          encrypt: false,
          connectionTimeout: 5000,
        },
      });
      
      await pool.connect();
      console.log('✓ SUCCESS!');
      const result = await pool.query('SELECT @@VERSION as v');
      console.log('Version:', result.recordset[0].v.substring(0, 50));
      await pool.close();
      break;
    } catch (e) {
      console.log('✗ Failed:', e.message);
    }
  }
}

test();
