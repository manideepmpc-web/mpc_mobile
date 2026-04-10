-- MPC HRMS Database Schema
-- Run: mysql -u root -pPassword@1 mpc < schema.sql

USE mpc;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  department_id INT,
  designation VARCHAR(100),
  role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
  date_of_joining DATE,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  address TEXT,
  profile_photo VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  check_in DATETIME,
  check_out DATETIME,
  check_in_location VARCHAR(255),
  check_out_location VARCHAR(255),
  status ENUM('present', 'absent', 'half_day', 'leave') DEFAULT 'present',
  work_hours DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_date (employee_id, date)
);

-- Leaves table
CREATE TABLE IF NOT EXISTS leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type ENUM('casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid') NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days INT NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  approved_by INT,
  approved_at DATETIME,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- Live location table
CREATE TABLE IF NOT EXISTS employee_location (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy FLOAT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_by INT NOT NULL,
  borrower_name VARCHAR(150) NOT NULL,
  borrower_contact VARCHAR(20),
  type ENUM('given','taken') NOT NULL,
  principal_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) DEFAULT 0.00,
  start_date DATE NOT NULL,
  due_date DATE,
  notes TEXT,
  status ENUM('active','settled','overdue') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE CASCADE
);

-- Loan payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
);

-- Seed: Default department
INSERT IGNORE INTO departments (name, description) VALUES 
  ('Administration', 'Admin and HR department'),
  ('Engineering', 'Software and IT'),
  ('Finance', 'Finance and Accounts'),
  ('Operations', 'Field operations');

-- Seed: Admin user (password: Admin@123)
INSERT IGNORE INTO employees 
  (employee_id, name, email, password, phone, department_id, designation, role, date_of_joining, gender)
VALUES (
  'EMP001',
  'MPC Admin',
  'admin@mpc.com',
  '$2b$12$4Uuz0w2gIw4jjcNrwnjVuucezHvGXr1kff.l4GkFu2jZ/IYKYHw0S',
  '9000000000',
  1,
  'HR Manager',
  'admin',
  CURDATE(),
  'male'
);
