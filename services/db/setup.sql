-- Create Database
CREATE DATABASE IF NOT EXISTS los_db;
USE los_db;

-- Create Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(255) PRIMARY KEY,
  application_token VARCHAR(255) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  contractor_name VARCHAR(255),
  business_name VARCHAR(255),
  loan_amount DECIMAL(15, 2),
  loan_purpose VARCHAR(255),
  flow_type ENUM('customer-led', 'contractor-led') NOT NULL,
  status ENUM('draft', 'pending', 'in-progress', 'approved', 'rejected') DEFAULT 'pending',
  phone_verified BOOLEAN DEFAULT FALSE,
  ssn_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_email (customer_email),
  INDEX idx_status (status),
  INDEX idx_application_token (application_token)
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('merchant', 'lender', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Create Merchant Profiles Table
CREATE TABLE IF NOT EXISTS merchant_profiles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  business_phone VARCHAR(20),
  business_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Create Lender Users Table (for managing lender platform users)
CREATE TABLE IF NOT EXISTS lender_users (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  level ENUM('L1', 'L2', 'L3') NOT NULL DEFAULT 'L1',
  role ENUM('Admin', 'Read-Only') NOT NULL DEFAULT 'Read-Only',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_level (level),
  INDEX idx_role (role)
);

-- Create Application Details Table (for storing basic details)
CREATE TABLE IF NOT EXISTS application_details (
  id VARCHAR(255) PRIMARY KEY,
  application_id VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  ssn VARCHAR(20),
  date_of_birth DATE,
  requested_amount DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  INDEX idx_application_id (application_id)
);

-- Create Project Details Table (for contractor-led flow)
CREATE TABLE IF NOT EXISTS project_details (
  id VARCHAR(255) PRIMARY KEY,
  application_id VARCHAR(255) NOT NULL,
  expected_financing_amount DECIMAL(15, 2),
  project_type VARCHAR(255),
  project_address TEXT,
  applicant_address TEXT,
  same_as_applicant_address BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  INDEX idx_application_id (application_id)
);

-- Create Financial Details Table (for contractor-led flow)
CREATE TABLE IF NOT EXISTS financial_details (
  id VARCHAR(255) PRIMARY KEY,
  application_id VARCHAR(255) NOT NULL,
  annual_income DECIMAL(15, 2),
  monthly_income DECIMAL(15, 2),
  has_special_income BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  INDEX idx_application_id (application_id)
);

-- Insert Sample Lender Users
INSERT INTO lender_users (id, first_name, last_name, email, level, role) VALUES
('USER-1', 'John', 'Doe', 'john.doe@example.com', 'L1', 'Read-Only'),
('USER-2', 'Jane', 'Smith', 'jane.smith@example.com', 'L2', 'Admin'),
('USER-3', 'Bob', 'Johnson', 'bob.johnson@example.com', 'L3', 'Read-Only');

-- Verify tables were created
SHOW TABLES;

-- Display table structures
DESCRIBE lender_users;
DESCRIBE applications;
DESCRIBE application_details;
DESCRIBE project_details;
DESCRIBE financial_details;
