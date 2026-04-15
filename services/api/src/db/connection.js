const { execSync } = require('child_process');
require('dotenv').config();

let connectionTested = false;

async function getConnection() {
  if (!connectionTested) {
    const dbServer = process.env.DB_SERVER || 'GDCIT-LAPT388\\FAMEEDA';
    const dbName = process.env.DB_NAME || 'los_db';
    try {
      execSync(`sqlcmd -S "${dbServer}" -E -d "${dbName}" -Q "SELECT 1"`, {
        stdio: 'pipe',
        encoding: 'utf8'
      });
      console.log('[DB] Connected to SQL Server via sqlcmd');
      connectionTested = true;
    } catch (error) {
      console.error('[DB] Connection failed:', error.message);
      throw error;
    }
  }

  // Return a pool-like object that mimics mssql behavior
  return {
    request: function() {
      return new Request();
    }
  };
}

class Request {
  constructor() {
    this.params = {};
  }

  input(paramName, sqlType, value) {
    this.params[paramName] = value;
    return this;
  }

  async query(sql) {
    const dbServer = process.env.DB_SERVER || 'GDCIT-LAPT388\\FAMEEDA';
    const dbName = process.env.DB_NAME || 'los_db';
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    // Replace parameter placeholders with actual values
    let finalSql = sql;
    for (const [key, value] of Object.entries(this.params)) {
      const placeholder = '@' + key;
      let replacement;
      if (value === null || value === undefined) {
        replacement = 'NULL';
      } else if (typeof value === 'string') {
        replacement = "'" + value.replace(/'/g, "''") + "'";
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        replacement = String(value);
      } else {
        replacement = "'" + String(value).replace(/'/g, "''") + "'";
      }
      finalSql = finalSql.replace(new RegExp(placeholder, 'g'), replacement);
    }

    const isSelect = finalSql.trim().toUpperCase().startsWith('SELECT');

    try {
      // Write query to temp file to avoid shell escaping issues
      const tempDir = os.tmpdir();
      const tempFile = path.join(tempDir, `sqlquery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.sql`);
      fs.writeFileSync(tempFile, finalSql, 'utf8');

      try {
        if (isSelect) {
          // For SELECT queries, output as CSV with pipe delimiter
          const output = execSync(
            `sqlcmd -S "${dbServer}" -E -d "${dbName}" -i "${tempFile}" -s "|"`,
            {
              encoding: 'utf8',
              stdio: 'pipe',
              maxBuffer: 10 * 1024 * 1024
            }
          );
          return this._parseCsvOutput(output);
        } else {
          // For INSERT/UPDATE/DELETE
          console.log('[DB] Executing query:', finalSql);
          const result = execSync(`sqlcmd -S "${dbServer}" -E -d "${dbName}" -i "${tempFile}"`, {
            stdio: 'pipe',
            encoding: 'utf8'
          });
          console.log('[DB] Query successful');
          return { recordset: [] };
        }
      } finally {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    } catch (error) {
      console.error('[DB] Query error:', error.message);
      throw error;
    }
  }

  _parseCsvOutput(output) {
    const lines = output.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return { recordset: [] };
    }

    // Check if there are results or just the "n rows affected" message
    if (lines[0].includes('rows affected')) {
      return { recordset: [] };
    }

    // First, find the header row and data rows
    let headerFound = false;
    let dataRows = [];
    let headers = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines and the "rows affected" line
      if (!line.trim() || line.includes('rows affected')) {
        continue;
      }

      // Skip the separator line (all dashes and pipes)
      if (/^[\s\|\-]+$/.test(line)) {
        continue;
      }

      // The first non-empty, non-separator line should be headers
      if (!headerFound) {
        headers = line.split('|').map(h => h.trim());
        headerFound = true;
      } else {
        // These are data rows
        dataRows.push(line);
      }
    }

    // Parse data rows
    const recordset = [];
    for (const row of dataRows) {
      const values = row.split('|');
      const record = {};

      headers.forEach((header, index) => {
        const value = values[index] ? values[index].trim() : '';
        record[header] = value || null;
      });

      recordset.push(record);
    }

    console.log(`[DB] SELECT returned ${recordset.length} records`);
    return { recordset };
  }
}

module.exports = { getConnection };
