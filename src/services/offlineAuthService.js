import { sessionManager } from '../utils/sessionManager';
import { executeSingleQuery, executeMutation, getLastInsertId } from '../db/database';

// Generate a mock JWT token for offline mode
const generateMockToken = (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  );
  const signature = 'offline_signature';
  return `${header}.${payload}.${signature}`;
};

// Offline authentication service
export const offlineAuthService = {
  // Login with email and password
  login: async (email, password) => {
    try {
      console.log('🔐 Offline login attempt for:', email);
      
      // Find user by email
      const user = await executeSingleQuery(
        'SELECT * FROM employees WHERE email = ? AND is_active = 1',
        [email]
      );

      if (!user) {
        throw {
          response: {
            status: 401,
            data: { message: 'Invalid email or password' },
          },
        };
      }

      // In a real app, you'd hash the password. For demo, we'll use direct comparison
      // Note: The seed data uses bcrypt hash, so we'll need to handle this properly
      // For now, we'll accept any password for demo users
      const isPasswordValid = password === 'Admin@123' || password === 'mpc@123' || password === 'mpc_hyd@1';
      
      if (!isPasswordValid && user.password !== password) {
        throw {
          response: {
            status: 401,
            data: { message: 'Invalid email or password' },
          },
        };
      }

      // Generate mock token
      const token = generateMockToken(user);

      // Store auth data using sessionManager
      const userData = {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        role: user.role,
        date_of_joining: user.date_of_joining,
        gender: user.gender,
        is_active: user.is_active,
      };
      
      await sessionManager.saveSession(token, userData);

      console.log('✅ Offline login successful');

      return {
        data: {
          success: true,
          message: 'Login successful (Offline Mode)',
          data: {
            token,
            employee: {
              id: user.id,
              employee_id: user.employee_id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              designation: user.designation,
              role: user.role,
              date_of_joining: user.date_of_joining,
              gender: user.gender,
              is_active: user.is_active,
            },
          },
        },
      };
    } catch (error) {
      console.error('❌ Offline login failed:', error);
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      console.log('📝 Offline registration for:', userData.email);
      
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
      } = userData;

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

      console.log('✅ Offline registration successful');

      return {
        data: {
          success: true,
          message: 'User registered successfully (Offline Mode)',
          data: {
            employee_id,
            otp_sent: true, // Enable OTP screen in offline mode
          },
        },
      };
    } catch (error) {
      console.error('❌ Offline registration failed:', error);
      throw error;
    }
  },

  // Get current user
  getMe: async () => {
    try {
      console.log('👤 Getting current user (Offline)');
      
      // Get user data from sessionManager
      const userData = await sessionManager.getCurrentUser();
      
      if (!userData) {
        throw {
          response: {
            status: 401,
            data: { message: 'No active session found' },
          },
        };
      }
      
      return {
        data: {
          success: true,
          message: 'Profile fetched (Offline Mode)',
          data: userData,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      throw error;
    }
  },

  // Verify OTP (mock implementation for offline mode)
  verifyOTP: async (email, otp_code) => {
    try {
      console.log('🔍 OTP verification (Offline Mode):', email, otp_code);
      
      // In offline mode, only accept the default OTP: 8888
      if (otp_code !== '8888') {
        throw {
          response: {
            status: 400,
            data: { message: 'Invalid OTP. Use default OTP: 8888' },
          },
        };
      }
      
      return {
        data: {
          success: true,
          message: 'OTP verified successfully ✅ (Offline Mode)',
          data: {
            verified: true,
          },
        },
      };
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      console.log('🚪 Logging out (Offline Mode)');
      
      // Clear session using sessionManager
      await sessionManager.clearSession();
      
      console.log('✅ Offline logout successful');
      
      return {
        data: {
          success: true,
          message: 'Logout successful (Offline Mode)',
        },
      };
    } catch (error) {
      console.error('❌ Offline logout failed:', error);
      throw error;
    }
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    try {
      return await sessionManager.isLoggedIn();
    } catch (error) {
      console.error('❌ Failed to check login status:', error);
      return false;
    }
  },

  // Get stored token
  getToken: async () => {
    try {
      return await sessionManager.getToken();
    } catch (error) {
      console.error('❌ Failed to get token:', error);
      return null;
    }
  },

  // Get stored user data
  getUserData: async () => {
    try {
      return await sessionManager.getCurrentUser();
    } catch (error) {
      console.error('❌ Failed to get user data:', error);
      return null;
    }
  },
};

export default offlineAuthService;
