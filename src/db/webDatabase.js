// Mock database implementation for web platform
// Since expo-sqlite doesn't work on web, this provides mock functionality

import { Platform } from 'react-native';

// Mock storage for web platform (using in-memory storage)
let mockData = {
  employees: [
    {
      id: 1,
      employee_id: 'EMP001',
      name: 'MPC Admin',
      email: 'admin@mpc.com',
      password: '$2b$12$4Uuz0w2gIw4jjcNrwnjVuucezHvGXr1kff.l4GkFu2jZ/IYKYHw0S',
      phone: '9000000000',
      designation: 'HR Manager',
      role: 'admin',
      date_of_joining: '2026-04-01',
      gender: 'male',
      is_active: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      employee_id: 'EMP002',
      name: 'Test Employee',
      email: 'test@mpc.com',
      password: '$2b$12$4Uuz0w2gIw4jjcNrwnjVuucezHvGXr1kff.l4GkFu2jZ/IYKYHw0S',
      phone: '9999999999',
      designation: 'Software Developer',
      role: 'employee',
      date_of_joining: '2026-04-01',
      gender: 'male',
      is_active: 1,
      created_at: new Date().toISOString(),
    }
  ],
  attendance: [],
  leaves: [],
  loans: [],
  loan_payments: [],
  departments: [
    { id: 1, name: 'Administration', description: 'Admin and HR department', created_at: new Date().toISOString() },
    { id: 2, name: 'Engineering', description: 'Software and IT', created_at: new Date().toISOString() },
    { id: 3, name: 'Finance', description: 'Finance and Accounts', created_at: new Date().toISOString() },
    { id: 4, name: 'Operations', description: 'Field operations', created_at: new Date().toISOString() },
  ]
};

// Mock database functions
export const initDatabase = async () => {
  if (Platform.OS === 'web') {
    console.log('🌐 Web: Using mock database (SQLite not supported)');
    return Promise.resolve();
  }
  throw new Error('initDatabase should only be called on mobile platforms');
};

export const executeQuery = async (query, params = []) => {
  if (Platform.OS === 'web') {
    console.log('🌐 Web: Mock query execution:', query, params);
    
    // Simple mock query parser
    if (query.includes('SELECT') && query.includes('employees')) {
      if (query.includes('WHERE email =')) {
        const email = params[0];
        return mockData.employees.filter(emp => emp.email === email);
      }
      if (query.includes('WHERE id =')) {
        const id = params[0];
        return mockData.employees.filter(emp => emp.id == id);
      }
      return mockData.employees;
    }
    
    if (query.includes('SELECT') && query.includes('attendance')) {
      return mockData.attendance;
    }
    
    if (query.includes('SELECT') && query.includes('leaves')) {
      return mockData.leaves;
    }
    
    if (query.includes('SELECT') && query.includes('loans')) {
      return mockData.loans;
    }
    
    if (query.includes('SELECT') && query.includes('loan_payments')) {
      return mockData.loan_payments;
    }
    
    if (query.includes('SELECT') && query.includes('departments')) {
      return mockData.departments;
    }
    
    return [];
  }
  throw new Error('executeQuery should only be called on mobile platforms');
};

export const executeSingleQuery = async (query, params = []) => {
  if (Platform.OS === 'web') {
    const results = await executeQuery(query, params);
    return results.length > 0 ? results[0] : null;
  }
  throw new Error('executeSingleQuery should only be called on mobile platforms');
};

export const executeMutation = async (query, params = []) => {
  if (Platform.OS === 'web') {
    console.log('🌐 Web: Mock mutation execution:', query, params);
    
    // Simple mock mutation parser
    if (query.includes('INSERT INTO employees')) {
      const newEmployee = {
        id: mockData.employees.length + 1,
        employee_id: `EMP${String(mockData.employees.length + 1).padStart(3, '0')}`,
        name: params[1],
        email: params[2],
        password: params[3],
        phone: params[4],
        designation: params[5],
        role: params[6],
        date_of_joining: params[7],
        gender: params[8],
        date_of_birth: params[9],
        address: params[10],
        is_active: 1,
        created_at: new Date().toISOString(),
      };
      mockData.employees.push(newEmployee);
      return { insertId: newEmployee.id };
    }
    
    if (query.includes('INSERT INTO attendance')) {
      const newAttendance = {
        id: mockData.attendance.length + 1,
        employee_id: params[0],
        date: params[1],
        check_in: params[2],
        check_in_location: params[3],
        status: params[4] || 'present',
        created_at: new Date().toISOString(),
      };
      mockData.attendance.push(newAttendance);
      return { insertId: newAttendance.id };
    }
    
    if (query.includes('INSERT INTO leaves')) {
      const newLeave = {
        id: mockData.leaves.length + 1,
        employee_id: params[0],
        leave_type: params[1],
        from_date: params[2],
        to_date: params[3],
        total_days: params[4],
        reason: params[5],
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      mockData.leaves.push(newLeave);
      return { insertId: newLeave.id };
    }
    
    if (query.includes('INSERT INTO loans')) {
      const newLoan = {
        id: mockData.loans.length + 1,
        created_by: params[0],
        borrower_name: params[1],
        borrower_contact: params[2],
        type: params[3],
        principal_amount: params[4],
        interest_rate: params[5],
        start_date: params[6],
        due_date: params[7],
        notes: params[8],
        status: 'active',
        created_at: new Date().toISOString(),
      };
      mockData.loans.push(newLoan);
      return { insertId: newLoan.id };
    }
    
    return { insertId: 1 };
  }
  throw new Error('executeMutation should only be called on mobile platforms');
};

export const getLastInsertId = async () => {
  if (Platform.OS === 'web') {
    return Promise.resolve(1);
  }
  throw new Error('getLastInsertId should only be called on mobile platforms');
};

export const closeDatabase = async () => {
  if (Platform.OS === 'web') {
    console.log('🌐 Web: Mock database closed');
    return Promise.resolve();
  }
  throw new Error('closeDatabase should only be called on mobile platforms');
};

export const isDatabaseInitialized = () => {
  if (Platform.OS === 'web') {
    return true;
  }
  return false;
};

export const resetDatabase = async () => {
  if (Platform.OS === 'web') {
    console.log('🌐 Web: Mock database reset');
    mockData.attendance = [];
    mockData.leaves = [];
    mockData.loans = [];
    mockData.loan_payments = [];
    return Promise.resolve();
  }
  throw new Error('resetDatabase should only be called on mobile platforms');
};

export default {
  initDatabase,
  executeQuery,
  executeSingleQuery,
  executeMutation,
  getLastInsertId,
  closeDatabase,
  isDatabaseInitialized,
  resetDatabase,
};
