// SQLite Database Schema
// Converted from PostgreSQL schema for local offline storage

export const SQLITE_SCHEMA = `
-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT,
  designation TEXT,
  role TEXT DEFAULT 'employee', -- ENUM: admin, manager, employee
  date_of_joining TEXT,
  date_of_birth TEXT,
  gender TEXT, -- ENUM: male, female, other
  address TEXT,
  profile_photo TEXT,
  is_active INTEGER DEFAULT 1, -- BOOLEAN
  otp_code TEXT,
  otp_expiry DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  check_in DATETIME,
  check_out DATETIME,
  check_in_location TEXT,
  check_out_location TEXT,
  status TEXT DEFAULT 'present', -- ENUM: present, absent, half_day, leave
  work_hours REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(employee_id, date)
);

-- Leaves table
CREATE TABLE IF NOT EXISTS leaves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  leave_type TEXT NOT NULL, -- ENUM: casual, sick, earned, maternity, paternity, unpaid
  from_date TEXT NOT NULL,
  to_date TEXT NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- ENUM: pending, approved, rejected, cancelled
  approved_by INTEGER,
  approved_at DATETIME,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- Employee location table
CREATE TABLE IF NOT EXISTS employee_location (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  accuracy REAL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by INTEGER NOT NULL,
  borrower_name TEXT NOT NULL,
  borrower_contact TEXT,
  type TEXT NOT NULL, -- ENUM: given, taken
  principal_amount REAL NOT NULL,
  interest_rate REAL DEFAULT 0.00,
  start_date TEXT NOT NULL,
  due_date TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active', -- ENUM: active, settled, overdue
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE CASCADE
);

-- Loan payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  loan_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payment_date TEXT NOT NULL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
);

-- Triggers for updated_at columns
CREATE TRIGGER IF NOT EXISTS update_employees_updated_at
  AFTER UPDATE ON employees
  FOR EACH ROW
  BEGIN
    UPDATE employees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_leaves_updated_at
  AFTER UPDATE ON leaves
  FOR EACH ROW
  BEGIN
    UPDATE leaves SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_loans_updated_at
  AFTER UPDATE ON loans
  FOR EACH ROW
  BEGIN
    UPDATE loans SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`;

// Seed data for offline mode
export const SEED_DATA = `
-- Insert default departments
INSERT OR IGNORE INTO departments (name, description) VALUES 
  ('Administration', 'Admin and HR department'),
  ('Engineering', 'Software and IT'),
  ('Finance', 'Finance and Accounts'),
  ('Operations', 'Field operations');

-- Insert demo admin user (password: Admin@123)
INSERT OR IGNORE INTO employees 
  (employee_id, name, email, password, phone, designation, role, date_of_joining, gender)
VALUES (
  'EMP001',
  'MPC Admin',
  'admin@mpc.com',
  '$2b$12$4Uuz0w2gIw4jjcNrwnjVuucezHvGXr1kff.l4GkFu2jZ/IYKYHw0S',
  '9000000000',
  'HR Manager',
  'admin',
  date('now'),
  'male'
);

-- Insert demo employee for testing
INSERT OR IGNORE INTO employees 
  (employee_id, name, email, password, phone, designation, role, date_of_joining, gender)
VALUES (
  'EMP002',
  'Test Employee',
  'test@mpc.com',
  '$2b$12$4Uuz0w2gIw4jjcNrwnjVuucezHvGXr1kff.l4GkFu2jZ/IYKYHw0S',
  '9999999999',
  'Software Developer',
  'employee',
  date('now'),
  'male'
);
`;
