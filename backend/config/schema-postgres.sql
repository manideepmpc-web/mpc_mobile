-- MPC HRMS Database Schema - PostgreSQL
-- Run: psql -U postgres -d money_tracker -f schema-postgres.sql

-- Create ENUM types
CREATE TYPE role_enum AS ENUM ('admin', 'manager', 'employee');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
CREATE TYPE status_enum AS ENUM ('present', 'absent', 'half_day', 'leave');
CREATE TYPE leave_type_enum AS ENUM ('casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid');
CREATE TYPE leave_status_enum AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE loan_type_enum AS ENUM ('given', 'taken');
CREATE TYPE loan_status_enum AS ENUM ('active', 'settled', 'overdue');

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  designation VARCHAR(100),
  role role_enum DEFAULT 'employee',
  date_of_joining DATE,
  date_of_birth DATE,
  gender gender_enum,
  address TEXT,
  profile_photo VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  otp_code VARCHAR(10),
  otp_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  check_in_location VARCHAR(255),
  check_out_location VARCHAR(255),
  status status_enum DEFAULT 'present',
  work_hours DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, date)
);

-- Leaves table
CREATE TABLE IF NOT EXISTS leaves (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type leave_type_enum NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status leave_status_enum DEFAULT 'pending',
  approved_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_leaves_updated_at
    BEFORE UPDATE ON leaves
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Live location table
CREATE TABLE IF NOT EXISTS employee_location (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy FLOAT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  created_by INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  borrower_name VARCHAR(150) NOT NULL,
  borrower_contact VARCHAR(20),
  type loan_type_enum NOT NULL,
  principal_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) DEFAULT 0.00,
  start_date DATE NOT NULL,
  due_date DATE,
  notes TEXT,
  status loan_status_enum DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_loans_updated_at
    BEFORE UPDATE ON loans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Loan payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed: Default departments
INSERT INTO departments (name, description) VALUES 
  ('Administration', 'Admin and HR department'),
  ('Engineering', 'Software and IT'),
  ('Finance', 'Finance and Accounts'),
  ('Operations', 'Field operations')
ON CONFLICT (name) DO NOTHING;

-- Seed: Admin user (password: Admin@123)
INSERT INTO employees 
  (employee_id, name, email, password, phone, designation, role, date_of_joining, gender)
VALUES (
  'EMP001',
  'MPC Admin',
  'admin@mpc.com',
  '$2b$12$4Uuz0w2gIw4jjcNrwnjVuucezHvGXr1kff.l4GkFu2jZ/IYKYHw0S',
  '9000000000',
  'HR Manager',
  'admin',
  CURRENT_DATE,
  'male'
)
ON CONFLICT (email) DO NOTHING;
