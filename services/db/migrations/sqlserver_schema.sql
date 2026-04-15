-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'los_db')
BEGIN
    CREATE DATABASE los_db;
END
GO

USE los_db;
GO

-- Create Applications Table
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
        project_address_line VARCHAR(255),
        project_city VARCHAR(100),
        project_state VARCHAR(50),
        project_zip_code VARCHAR(10),
        applicant_address_line VARCHAR(255),
        applicant_city VARCHAR(100),
        applicant_state VARCHAR(50),
        applicant_zip_code VARCHAR(10),
        same_as_applicant_address BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
    CREATE INDEX idx_customer_email ON applications(customer_email);
    CREATE INDEX idx_status ON applications(status);
    CREATE INDEX idx_application_token ON applications(application_token);
END
GO

-- Create Users Table
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
END
GO

-- Create Merchant Profiles Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'merchant_profiles')
BEGIN
    CREATE TABLE merchant_profiles (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        business_name VARCHAR(255),
        business_phone VARCHAR(20),
        business_address TEXT,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_user_id ON merchant_profiles(user_id);
END
GO

-- Create Lender Users Table
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
END
GO

-- Create Application Details Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'application_details')
BEGIN
    CREATE TABLE application_details (
        id VARCHAR(255) PRIMARY KEY,
        application_id VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        phone_number VARCHAR(20),
        email VARCHAR(255),
        ssn VARCHAR(20),
        date_of_birth DATE,
        requested_amount DECIMAL(15, 2),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_application_id ON application_details(application_id);
END
GO

-- Create Project Details Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'project_details')
BEGIN
    CREATE TABLE project_details (
        id VARCHAR(255) PRIMARY KEY,
        application_id VARCHAR(255) NOT NULL,
        expected_financing_amount DECIMAL(15, 2),
        project_type VARCHAR(255),
        project_address TEXT,
        applicant_address TEXT,
        same_as_applicant_address BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_application_id ON project_details(application_id);
END
GO

-- Create Financial Details Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'financial_details')
BEGIN
    CREATE TABLE financial_details (
        id VARCHAR(255) PRIMARY KEY,
        application_id VARCHAR(255) NOT NULL,
        annual_income DECIMAL(15, 2),
        monthly_income DECIMAL(15, 2),
        has_special_income BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_application_id ON financial_details(application_id);
END
GO

-- Insert Sample Lender Users
IF NOT EXISTS (SELECT * FROM lender_users WHERE email = 'john.doe@example.com')
BEGIN
    INSERT INTO lender_users (id, first_name, last_name, email, level, role) VALUES
    ('USER-1', 'John', 'Doe', 'john.doe@example.com', 'L1', 'Read-Only'),
    ('USER-2', 'Jane', 'Smith', 'jane.smith@example.com', 'L2', 'Admin'),
    ('USER-3', 'Bob', 'Johnson', 'bob.johnson@example.com', 'L3', 'Read-Only');
END
GO

-- Verify tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';
GO

-- Display sample data
SELECT * FROM lender_users;
GO
