import { executeQuery, executeSingleQuery, executeMutation } from '../db/database';

// Offline employee service
export const offlineEmployeeService = {
  // Get all employees
  getAll: async () => {
    try {
      console.log('👥 Getting all employees (Offline)');
      
      const employees = await executeQuery(
        `SELECT 
          e.id, e.employee_id, e.name, e.email, e.phone, e.designation, e.role,
          e.date_of_joining, e.is_active, e.profile_photo, e.created_at
        FROM employees e 
        WHERE e.is_active = 1 
        ORDER BY e.name ASC`
      );

      return {
        data: {
          success: true,
          data: employees,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get employees:', error);
      throw error;
    }
  },

  // Get employee by ID
  getById: async (id) => {
    try {
      console.log('👤 Getting employee by ID (Offline):', id);
      
      const employee = await executeSingleQuery(
        `SELECT 
          e.id, e.employee_id, e.name, e.email, e.phone, e.designation, e.role,
          e.date_of_joining, e.is_active, e.profile_photo, e.created_at,
          e.date_of_birth, e.gender, e.address
        FROM employees e 
        WHERE e.id = ? AND e.is_active = 1`,
        [id]
      );

      if (!employee) {
        throw {
          response: {
            status: 404,
            data: { message: 'Employee not found' },
          },
        };
      }

      return {
        data: {
          success: true,
          data: employee,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get employee:', error);
      throw error;
    }
  },

  // Update employee
  update: async (id, data) => {
    try {
      console.log('✏️ Updating employee (Offline):', id);
      
      const { name, phone, designation, address, date_of_birth, gender, profile_photo } = data;
      
      // Check if employee exists
      const existingEmployee = await executeSingleQuery(
        'SELECT id FROM employees WHERE id = ? AND is_active = 1',
        [id]
      );

      if (!existingEmployee) {
        throw {
          response: {
            status: 404,
            data: { message: 'Employee not found' },
          },
        };
      }

      // Update employee
      await executeMutation(
        `UPDATE employees SET 
          name = ?, phone = ?, designation = ?, address = ?, 
          date_of_birth = ?, gender = ?, profile_photo = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [name, phone, designation, address, date_of_birth, gender, profile_photo, id]
      );

      // Get updated employee
      const updatedEmployee = await executeSingleQuery(
        'SELECT * FROM employees WHERE id = ?',
        [id]
      );

      return {
        data: {
          success: true,
          message: 'Employee updated successfully (Offline Mode)',
          data: updatedEmployee,
        },
      };
    } catch (error) {
      console.error('❌ Failed to update employee:', error);
      throw error;
    }
  },

  // Create new employee (similar to register but for admin use)
  create: async (data) => {
    try {
      console.log('➕ Creating new employee (Offline)');
      
      const {
        name,
        email,
        password,
        phone,
        designation,
        role = 'employee',
        date_of_joining,
        gender,
        date_of_birth,
        address,
      } = data;

      // Check if email already exists
      const existingUser = await executeSingleQuery(
        'SELECT id FROM employees WHERE email = ?',
        [email]
      );

      if (existingUser) {
        throw {
          response: {
            status: 400,
            data: { message: 'Email already registered' },
          },
        };
      }

      // Generate employee ID
      const employeeCount = await executeSingleQuery(
        'SELECT COUNT(*) as count FROM employees'
      );
      const count = (employeeCount?.count || 0) + 1;
      const employee_id = `EMP${String(count).padStart(3, '0')}`;

      // Insert new employee
      await executeMutation(
        `INSERT INTO employees (
          employee_id, name, email, password, phone, designation, role, 
          date_of_joining, gender, date_of_birth, address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee_id,
          name,
          email,
          password, // In production, hash this password
          phone,
          designation,
          role,
          date_of_joining,
          gender,
          date_of_birth,
          address,
        ]
      );

      // Get created employee
      const createdEmployee = await executeSingleQuery(
        'SELECT * FROM employees WHERE employee_id = ?',
        [employee_id]
      );

      return {
        data: {
          success: true,
          message: 'Employee created successfully (Offline Mode)',
          data: createdEmployee,
        },
      };
    } catch (error) {
      console.error('❌ Failed to create employee:', error);
      throw error;
    }
  },

  // Delete employee (soft delete by setting is_active = 0)
  delete: async (id) => {
    try {
      console.log('🗑️ Deleting employee (Offline):', id);
      
      // Check if employee exists
      const existingEmployee = await executeSingleQuery(
        'SELECT id FROM employees WHERE id = ? AND is_active = 1',
        [id]
      );

      if (!existingEmployee) {
        throw {
          response: {
            status: 404,
            data: { message: 'Employee not found' },
          },
        };
      }

      // Soft delete employee
      await executeMutation(
        'UPDATE employees SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      return {
        data: {
          success: true,
          message: 'Employee deleted successfully (Offline Mode)',
        },
      };
    } catch (error) {
      console.error('❌ Failed to delete employee:', error);
      throw error;
    }
  },

  // Get employees by department
  getByDepartment: async (departmentId) => {
    try {
      console.log('🏢 Getting employees by department (Offline):', departmentId);
      
      const employees = await executeQuery(
        `SELECT 
          e.id, e.employee_id, e.name, e.email, e.phone, e.designation, e.role,
          e.date_of_joining, e.is_active, e.profile_photo
        FROM employees e 
        WHERE e.is_active = 1 
        ORDER BY e.name ASC`
      );

      // Note: In offline mode, we don't have department relationships
      // This is a simplified version that returns all active employees
      
      return {
        data: {
          success: true,
          data: employees,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get employees by department:', error);
      throw error;
    }
  },

  // Search employees by name or email
  search: async (query) => {
    try {
      console.log('🔍 Searching employees (Offline):', query);
      
      const employees = await executeQuery(
        `SELECT 
          e.id, e.employee_id, e.name, e.email, e.phone, e.designation, e.role,
          e.date_of_joining, e.is_active, e.profile_photo
        FROM employees e 
        WHERE e.is_active = 1 
        AND (e.name LIKE ? OR e.email LIKE ? OR e.employee_id LIKE ?)
        ORDER BY e.name ASC`,
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );

      return {
        data: {
          success: true,
          data: employees,
        },
      };
    } catch (error) {
      console.error('❌ Failed to search employees:', error);
      throw error;
    }
  },
};

export default offlineEmployeeService;
