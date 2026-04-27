import { executeQuery, executeSingleQuery, executeMutation } from '../db/database';

// Offline attendance service
export const offlineAttendanceService = {
  // Check in employee
  checkIn: async (location) => {
    try {
      console.log('📍 Checking in (Offline):', location);
      
      // Get current user from AsyncStorage (we'll need to pass employee_id)
      // For now, we'll assume employee_id is passed or we get it from context
      // This is a simplified implementation
      
      // Parse location if it's a string
      let locationString = location;
      if (typeof location === 'object') {
        locationString = `${location.latitude}, ${location.longitude}`;
      }
      
      // Get current date
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      // For demo, we'll use employee_id = 1 (admin user)
      // In real implementation, get this from auth context
      const employee_id = 1;
      
      // Check if already checked in today
      const existingAttendance = await executeSingleQuery(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
        [employee_id, today]
      );
      
      if (existingAttendance && existingAttendance.check_in) {
        throw {
          response: {
            status: 400,
            data: { message: 'Already checked in today' },
          },
        };
      }
      
      if (existingAttendance) {
        // Update existing record
        await executeMutation(
          'UPDATE attendance SET check_in = ?, check_in_location = ?, status = ? WHERE id = ?',
          [now, locationString, 'present', existingAttendance.id]
        );
      } else {
        // Insert new record
        await executeMutation(
          'INSERT INTO attendance (employee_id, date, check_in, check_in_location, status) VALUES (?, ?, ?, ?, ?)',
          [employee_id, today, now, locationString, 'present']
        );
      }
      
      // Get updated attendance record
      const attendance = await executeSingleQuery(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
        [employee_id, today]
      );
      
      return {
        data: {
          success: true,
          message: 'Check-in successful (Offline Mode)',
          data: attendance,
        },
      };
    } catch (error) {
      console.error('❌ Failed to check in:', error);
      throw error;
    }
  },

  // Check out employee
  checkOut: async (location) => {
    try {
      console.log('📍 Checking out (Offline):', location);
      
      // Parse location if it's a string
      let locationString = location;
      if (typeof location === 'object') {
        locationString = `${location.latitude}, ${location.longitude}`;
      }
      
      // Get current date and time
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      // For demo, we'll use employee_id = 1 (admin user)
      const employee_id = 1;
      
      // Get today's attendance
      const attendance = await executeSingleQuery(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
        [employee_id, today]
      );
      
      if (!attendance || !attendance.check_in) {
        throw {
          response: {
            status: 400,
            data: { message: 'No check-in record found for today' },
          },
        };
      }
      
      if (attendance.check_out) {
        throw {
          response: {
            status: 400,
            data: { message: 'Already checked out today' },
          },
        };
      }
      
      // Calculate work hours
      const checkInTime = new Date(attendance.check_in);
      const checkOutTime = new Date(now);
      const workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours
      
      // Update attendance
      await executeMutation(
        'UPDATE attendance SET check_out = ?, check_out_location = ?, work_hours = ? WHERE id = ?',
        [now, locationString, workHours.toFixed(2), attendance.id]
      );
      
      // Get updated attendance record
      const updatedAttendance = await executeSingleQuery(
        'SELECT * FROM attendance WHERE id = ?',
        [attendance.id]
      );
      
      return {
        data: {
          success: true,
          message: 'Check-out successful (Offline Mode)',
          data: updatedAttendance,
        },
      };
    } catch (error) {
      console.error('❌ Failed to check out:', error);
      throw error;
    }
  },

  // Get today's attendance status
  getTodayStatus: async () => {
    try {
      console.log('📅 Getting today\'s attendance status (Offline)');
      
      const today = new Date().toISOString().split('T')[0];
      
      // For demo, we'll use employee_id = 1 (admin user)
      const employee_id = 1;
      
      const attendance = await executeSingleQuery(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
        [employee_id, today]
      );
      
      return {
        data: {
          success: true,
          data: attendance || null,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get today\'s attendance:', error);
      throw error;
    }
  },

  // Get attendance history
  getHistory: async (limit = 30) => {
    try {
      console.log('📜 Getting attendance history (Offline)');
      
      // For demo, we'll use employee_id = 1 (admin user)
      const employee_id = 1;
      
      const history = await executeQuery(
        'SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT ?',
        [employee_id, limit]
      );
      
      return {
        data: {
          success: true,
          data: history,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get attendance history:', error);
      throw error;
    }
  },

  // Get monthly statistics
  getStats: async (year, month) => {
    try {
      console.log('📊 Getting attendance stats (Offline):', year, month);
      
      // For demo, we'll use employee_id = 1 (admin user)
      const employee_id = 1;
      
      const stats = await executeSingleQuery(
        `SELECT 
          COUNT(*) AS total_days,
          SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) AS present_days,
          SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) AS absent_days,
          SUM(CASE WHEN status='half_day' THEN 1 ELSE 0 END) AS half_days,
          ROUND(SUM(work_hours), 2) AS total_hours
        FROM attendance 
        WHERE employee_id = ? AND strftime('%Y', date) = ? AND strftime('%m', date) = ?`,
        [employee_id, year.toString(), month.toString().padStart(2, '0')]
      );
      
      return {
        data: {
          success: true,
          data: stats || {
            total_days: 0,
            present_days: 0,
            absent_days: 0,
            half_days: 0,
            total_hours: 0,
          },
        },
      };
    } catch (error) {
      console.error('❌ Failed to get attendance stats:', error);
      throw error;
    }
  },

  // Get all employees' attendance for today (admin function)
  getAllToday: async () => {
    try {
      console.log('👥 Getting all today\'s attendance (Offline)');
      
      const today = new Date().toISOString().split('T')[0];
      
      const attendance = await executeQuery(
        `SELECT 
          a.*, e.name, e.employee_id AS emp_code
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.date = ?
        ORDER BY a.check_in DESC`,
        [today]
      );
      
      return {
        data: {
          success: true,
          data: attendance,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get all today\'s attendance:', error);
      throw error;
    }
  },

  // Mark attendance manually (admin function)
  markAttendance: async (employee_id, date, status, notes = null) => {
    try {
      console.log('✏️ Marking attendance (Offline):', employee_id, date, status);
      
      // Check if attendance already exists
      const existingAttendance = await executeSingleQuery(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
        [employee_id, date]
      );
      
      if (existingAttendance) {
        // Update existing record
        await executeMutation(
          'UPDATE attendance SET status = ?, notes = ? WHERE id = ?',
          [status, notes, existingAttendance.id]
        );
      } else {
        // Insert new record
        await executeMutation(
          'INSERT INTO attendance (employee_id, date, status, notes) VALUES (?, ?, ?, ?)',
          [employee_id, date, status, notes]
        );
      }
      
      return {
        data: {
          success: true,
          message: 'Attendance marked successfully (Offline Mode)',
        },
      };
    } catch (error) {
      console.error('❌ Failed to mark attendance:', error);
      throw error;
    }
  },
};

export default offlineAttendanceService;
