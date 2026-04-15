# SQL Server Database Setup Script
$serverName = "GDCIT-LAPT388\FAMEEDA"
$databaseName = "los_db"

Write-Host "`n=== SQL Server Database Setup ===" -ForegroundColor Cyan
Write-Host "Server: $serverName" -ForegroundColor Yellow
Write-Host "Database: $databaseName`n" -ForegroundColor Yellow

# Check if SQL Server is running
Write-Host "Checking SQL Server service..." -ForegroundColor Yellow
$service = Get-Service -Name "MSSQL`$FAMEEDA" -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq "Running") {
        Write-Host "✓ SQL Server service is running`n" -ForegroundColor Green
    } else {
        Write-Host "✗ SQL Server service is not running" -ForegroundColor Red
        Write-Host "Starting SQL Server service..."
        Start-Service -Name "MSSQL`$FAMEEDA"
        Start-Sleep -Seconds 3
        Write-Host "✓ SQL Server service started`n" -ForegroundColor Green
    }
} else {
    Write-Host "✗ SQL Server FAMEEDA instance not found" -ForegroundColor Red
    exit 1
}

# SQL Setup Script
$setupScript = @"
-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$databaseName')
BEGIN
    CREATE DATABASE [$databaseName];
    PRINT 'Database created';
END
ELSE
BEGIN
    PRINT 'Database already exists';
END
GO

-- Use the database
USE [$databaseName];
GO

-- Create users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
    CREATE INDEX idx_email ON users(email);
    CREATE INDEX idx_role ON users(role);
    PRINT 'users table created';
END
ELSE
BEGIN
    PRINT 'users table already exists';
END
GO

-- Create lender_users table  
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'lender_users')
BEGIN
    CREATE TABLE lender_users (
        id VARCHAR(255) PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        level VARCHAR(10) DEFAULT 'L1',
        role VARCHAR(50) DEFAULT 'Read-Only',
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
    CREATE INDEX idx_email ON lender_users(email);
    CREATE INDEX idx_level ON lender_users(level);
    CREATE INDEX idx_role ON lender_users(role);
    PRINT 'lender_users table created';
END
ELSE
BEGIN
    PRINT 'lender_users table already exists';
END
GO

-- Create applications table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'applications')
BEGIN
    CREATE TABLE applications (
        id VARCHAR(255) PRIMARY KEY,
        application_token VARCHAR(255) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        contractor_name VARCHAR(255),
        business_name VARCHAR(255),
        loan_amount DECIMAL(15, 2),
        loan_purpose VARCHAR(255),
        flow_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        phone_verified BIT DEFAULT 0,
        ssn_verified BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
    CREATE INDEX idx_customer_email ON applications(customer_email);
    CREATE INDEX idx_status ON applications(status);
    CREATE INDEX idx_application_token ON applications(application_token);
    PRINT 'applications table created';
END
ELSE
BEGIN
    PRINT 'applications table already exists';
END
GO

-- Verify tables
SELECT 'Table Summary:' as Status;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME;
GO

PRINT 'Database setup completed successfully!';
"@

Write-Host "Setting up database schema..." -ForegroundColor Yellow
Write-Host "SQL setup script:" -ForegroundColor Yellow

try {
    # Save script to temp file
    $scriptPath = "$env:TEMP\los_setup.sql"
    $setupScript | Out-File -FilePath $scriptPath -Encoding UTF8
    
    # Execute script with sqlcmd
    Write-Host "`nExecuting: sqlcmd -S '$serverName' -E -i '$scriptPath'" -ForegroundColor Gray
    
    $output = & sqlcmd -S "$serverName" -E -i "$scriptPath" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Database setup successful!`n" -ForegroundColor Green
        $output | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
    } else {
        Write-Host "`n✗ Database setup failed!`n" -ForegroundColor Red
        $output | ForEach-Object { Write-Host $_ -ForegroundColor Red }
        exit 1
    }
    
    # Cleanup
    Remove-Item -Path $scriptPath -Force -ErrorAction SilentlyContinue
    
    # Test connection and user insertion
    Write-Host "`nTesting user table..." -ForegroundColor Yellow
    
    $testQuery = "USE $databaseName; SELECT COUNT(*) as UserCount FROM users;"
    $testResult = & sqlcmd -S "$serverName" -E -Q $testQuery
    
    Write-Host $testResult -ForegroundColor Gray
    Write-Host "`n✓ Setup complete! Users table is ready." -ForegroundColor Green
    
} catch {
    Write-Host "`n✗ Error: $_" -ForegroundColor Red
    exit 1
}
