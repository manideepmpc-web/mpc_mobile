import { executeQuery, executeSingleQuery, executeMutation } from '../db/database';

// Leave quota configuration (same as online config)
const LEAVE_QUOTA = {
  casual: 12,
  sick: 10,
  earned: 15,
  maternity: 180,
  paternity: 15,
  unpaid: 0,
};

// Offline leave service
export const offlineLeaveService = {
  // Apply for leave
  apply: async (leaveData) => {
    try {
      console.log('📝 Applying for leave (Offline):', leaveData);
      
      const { leave_type, from_date, to_date, total_days, reason } = leaveData;
      
      // For demo, we'll use employee_id = 1 (admin user)
      // In real implementation, get this from auth context
      const employee_id = 1;
      
      // Check for overlapping leaves
      const overlappingLeaves = await executeQuery(
        `SELECT * FROM leaves 
        WHERE employee_id = ? 
        AND status NOT IN ('rejected', 'cancelled')
        AND ((from_date <= ? AND to_date >= ?) OR (from_date <= ? AND to_date >= ?))`,
        [employee_id, from_date, from_date, to_date, to_date]
      );
      
      if (overlappingLeaves.length > 0) {
        throw {
          response: {
            status: 400,
            data: { message: 'Leave dates overlap with existing leave application' },
          },
        };
      }
      
      // Insert leave application
      await executeMutation(
        `INSERT INTO leaves (
          employee_id, leave_type, from_date, to_date, total_days, reason, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [employee_id, leave_type, from_date, to_date, total_days, reason]
      );
      
      // Get the inserted leave
      const insertedLeave = await executeSingleQuery(
        `SELECT * FROM leaves 
        WHERE employee_id = ? AND leave_type = ? AND from_date = ? AND to_date = ?
        ORDER BY created_at DESC LIMIT 1`,
        [employee_id, leave_type, from_date, to_date]
      );
      
      return {
        data: {
          success: true,
          message: 'Leave application submitted successfully (Offline Mode)',
          data: insertedLeave,
        },
      };
    } catch (error) {
      console.error('❌ Failed to apply for leave:', error);
      throw error;
    }
  },

  // Get employee's leaves
  getMyLeaves: async () => {
    try {
      console.log('📋 Getting my leaves (Offline)');
      
      // For demo, we'll use employee_id = 1 (admin user)
      const employee_id = 1;
      
      const leaves = await executeQuery(
        `SELECT * FROM leaves 
        WHERE employee_id = ? 
        ORDER BY created_at DESC`,
        [employee_id]
      );
      
      return {
        data: {
          success: true,
          data: leaves,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get my leaves:', error);
      throw error;
    }
  },

  // Get leave balance
  getBalance: async () => {
    try {
      console.log('⚖️ Getting leave balance (Offline)');
      
      // For demo, we'll use employee_id = 1 (admin user)
      const employee_id = 1;
      
      const currentYear = new Date().getFullYear();
      
      // Get used leaves for current year
      const usedLeaves = await executeQuery(
        `SELECT leave_type, SUM(total_days) AS used_days
        FROM leaves
        WHERE employee_id = ? AND strftime('%Y', from_date) = ? AND status = 'approved'
        GROUP BY leave_type`,
        [employee_id, currentYear.toString()]
      );
      
      // Calculate balance
      const balance = {};
      Object.keys(LEAVE_QUOTA).forEach(type => {
        const used = usedLeaves.find(leave => leave.leave_type === type);
        balance[type] = {
          total: LEAVE_QUOTA[type],
          used: used ? used.used_days : 0,
          remaining: LEAVE_QUOTA[type] - (used ? used.used_days : 0),
        };
      });
      
      return {
        data: {
          success: true,
          data: balance,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get leave balance:', error);
      throw error;
    }
  },

  // Get pending leaves (admin function)
  getPending: async () => {
    try {
      console.log('⏳ Getting pending leaves (Offline)');
      
      const pendingLeaves = await executeQuery(
        `SELECT 
          l.*, e.name AS employee_name, e.employee_id AS emp_code, e.designation
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        WHERE l.status = 'pending'
        ORDER BY l.created_at ASC`
      );
      
      return {
        data: {
          success: true,
          data: pendingLeaves,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get pending leaves:', error);
      throw error;
    }
  },

  // Update leave status (admin function)
  updateStatus: async (leaveId, status, rejectionReason = null) => {
    try {
      console.log('✏️ Updating leave status (Offline):', leaveId, status);
      
      // Get current user (admin)
      // For demo, we'll use employee_id = 1 (admin user)
      const approved_by = 1;
      
      // Check if leave exists
      const existingLeave = await executeSingleQuery(
        'SELECT * FROM leaves WHERE id = ?',
        [leaveId]
      );
      
      if (!existingLeave) {
        throw {
          response: {
            status: 404,
            data: { message: 'Leave application not found' },
          },
        };
      }
      
      // Update leave status
      await executeMutation(
        `UPDATE leaves SET 
          status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP, 
          rejection_reason = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [status, approved_by, rejectionReason, leaveId]
      );
      
      // Get updated leave
      const updatedLeave = await executeSingleQuery(
        `SELECT 
          l.*, e.name AS employee_name, e.employee_id AS emp_code
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        WHERE l.id = ?`,
        [leaveId]
      );
      
      return {
        data: {
          success: true,
          message: `Leave ${status} successfully (Offline Mode)`,
          data: updatedLeave,
        },
      };
    } catch (error) {
      console.error('❌ Failed to update leave status:', error);
      throw error;
    }
  },

  // Cancel leave
  cancel: async (leaveId) => {
    try {
      console.log('❌ Cancelling leave (Offline):', leaveId);
      
      // For demo, we'll use employee_id = 1 (admin user)
      const employee_id = 1;
      
      // Check if leave exists and belongs to user
      const existingLeave = await executeSingleQuery(
        'SELECT * FROM leaves WHERE id = ? AND employee_id = ?',
        [leaveId, employee_id]
      );
      
      if (!existingLeave) {
        throw {
          response: {
            status: 404,
            data: { message: 'Leave application not found' },
          },
        };
      }
      
      if (existingLeave.status !== 'pending') {
        throw {
          response: {
            status: 400,
            data: { message: 'Only pending leaves can be cancelled' },
          },
        };
      }
      
      // Update leave status
      await executeMutation(
        'UPDATE leaves SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['cancelled', leaveId]
      );
      
      return {
        data: {
          success: true,
          message: 'Leave cancelled successfully (Offline Mode)',
        },
      };
    } catch (error) {
      console.error('❌ Failed to cancel leave:', error);
      throw error;
    }
  },

  // Get leave by ID
  getById: async (leaveId) => {
    try {
      console.log('🔍 Getting leave by ID (Offline):', leaveId);
      
      const leave = await executeSingleQuery(
        `SELECT 
          l.*, e.name AS employee_name, e.employee_id AS emp_code, e.designation,
          approver.name AS approver_name
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        LEFT JOIN employees approver ON l.approved_by = approver.id
        WHERE l.id = ?`,
        [leaveId]
      );
      
      if (!leave) {
        throw {
          response: {
            status: 404,
            data: { message: 'Leave application not found' },
          },
        };
      }
      
      return {
        data: {
          success: true,
          data: leave,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get leave:', error);
      throw error;
    }
  },

  // Get all leaves (admin function)
  getAll: async (filters = {}) => {
    try {
      console.log('📋 Getting all leaves (Offline)');
      
      let query = `
        SELECT 
          l.*, e.name AS employee_name, e.employee_id AS emp_code, e.designation
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Add filters
      if (filters.status) {
        query += ' AND l.status = ?';
        params.push(filters.status);
      }
      
      if (filters.leave_type) {
        query += ' AND l.leave_type = ?';
        params.push(filters.leave_type);
      }
      
      if (filters.employee_id) {
        query += ' AND l.employee_id = ?';
        params.push(filters.employee_id);
      }
      
      if (filters.year) {
        query += " AND strftime('%Y', l.from_date) = ?";
        params.push(filters.year.toString());
      }
      
      query += ' ORDER BY l.created_at DESC';
      
      const leaves = await executeQuery(query, params);
      
      return {
        data: {
          success: true,
          data: leaves,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get all leaves:', error);
      throw error;
    }
  },
};

export default offlineLeaveService;
