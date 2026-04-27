import { executeQuery, executeSingleQuery, executeMutation } from '../db/database';

// Offline loan service
export const offlineLoanService = {
  // Create new loan
  createLoan: async (loanData) => {
    try {
      console.log('💰 Creating loan (Offline):', loanData);
      
      const { 
        borrower_name, 
        borrower_contact, 
        type, 
        principal_amount, 
        interest_rate = 0, 
        start_date, 
        due_date, 
        notes 
      } = loanData;
      
      // For demo, we'll use created_by = 1 (admin user)
      // In real implementation, get this from auth context
      const created_by = 1;
      
      // Insert loan
      await executeMutation(
        `INSERT INTO loans (
          created_by, borrower_name, borrower_contact, type, 
          principal_amount, interest_rate, start_date, due_date, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          created_by, 
          borrower_name, 
          borrower_contact, 
          type, 
          principal_amount, 
          interest_rate, 
          start_date, 
          due_date, 
          notes
        ]
      );
      
      // Get the inserted loan
      const insertedLoan = await executeSingleQuery(
        `SELECT * FROM loans 
        WHERE created_by = ? AND borrower_name = ? AND principal_amount = ?
        ORDER BY created_at DESC LIMIT 1`,
        [created_by, borrower_name, principal_amount]
      );
      
      return {
        data: {
          success: true,
          message: 'Loan created successfully (Offline Mode)',
          data: insertedLoan,
        },
      };
    } catch (error) {
      console.error('❌ Failed to create loan:', error);
      throw error;
    }
  },

  // Get all loans for user
  getLoans: async () => {
    try {
      console.log('💼 Getting loans (Offline)');
      
      // For demo, we'll use created_by = 1 (admin user)
      const created_by = 1;
      
      const loans = await executeQuery(
        `SELECT 
          l.*,
          COALESCE(SUM(p.amount), 0) AS paid_amount,
          (l.principal_amount - COALESCE(SUM(p.amount), 0)) AS remaining_amount
        FROM loans l
        LEFT JOIN loan_payments p ON p.loan_id = l.id
        WHERE l.created_by = ?
        GROUP BY l.id
        ORDER BY l.created_at DESC`,
        [created_by]
      );
      
      return {
        data: {
          success: true,
          data: loans,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get loans:', error);
      throw error;
    }
  },

  // Get single loan by ID
  getLoan: async (loanId) => {
    try {
      console.log('🔍 Getting loan by ID (Offline):', loanId);
      
      // For demo, we'll use created_by = 1 (admin user)
      const created_by = 1;
      
      const loan = await executeSingleQuery(
        `SELECT 
          l.*,
          COALESCE(SUM(p.amount), 0) AS paid_amount,
          (l.principal_amount - COALESCE(SUM(p.amount), 0)) AS remaining_amount
        FROM loans l
        LEFT JOIN loan_payments p ON p.loan_id = l.id
        WHERE l.id = ? AND l.created_by = ?
        GROUP BY l.id`,
        [loanId, created_by]
      );
      
      if (!loan) {
        throw {
          response: {
            status: 404,
            data: { message: 'Loan not found' },
          },
        };
      }
      
      return {
        data: {
          success: true,
          data: loan,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get loan:', error);
      throw error;
    }
  },

  // Update loan
  updateLoan: async (loanId, loanData) => {
    try {
      console.log('✏️ Updating loan (Offline):', loanId, loanData);
      
      const { 
        borrower_name, 
        borrower_contact, 
        interest_rate, 
        due_date, 
        notes, 
        status 
      } = loanData;
      
      // For demo, we'll use created_by = 1 (admin user)
      const created_by = 1;
      
      // Check if loan exists
      const existingLoan = await executeSingleQuery(
        'SELECT id FROM loans WHERE id = ? AND created_by = ?',
        [loanId, created_by]
      );
      
      if (!existingLoan) {
        throw {
          response: {
            status: 404,
            data: { message: 'Loan not found' },
          },
        };
      }
      
      // Update loan
      await executeMutation(
        `UPDATE loans SET 
          borrower_name = ?, borrower_contact = ?, interest_rate = ?, 
          due_date = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          borrower_name, 
          borrower_contact, 
          interest_rate, 
          due_date, 
          notes, 
          status, 
          loanId
        ]
      );
      
      // Get updated loan
      const updatedLoan = await executeSingleQuery(
        `SELECT 
          l.*,
          COALESCE(SUM(p.amount), 0) AS paid_amount,
          (l.principal_amount - COALESCE(SUM(p.amount), 0)) AS remaining_amount
        FROM loans l
        LEFT JOIN loan_payments p ON p.loan_id = l.id
        WHERE l.id = ?
        GROUP BY l.id`,
        [loanId]
      );
      
      return {
        data: {
          success: true,
          message: 'Loan updated successfully (Offline Mode)',
          data: updatedLoan,
        },
      };
    } catch (error) {
      console.error('❌ Failed to update loan:', error);
      throw error;
    }
  },

  // Delete loan
  deleteLoan: async (loanId) => {
    try {
      console.log('🗑️ Deleting loan (Offline):', loanId);
      
      // For demo, we'll use created_by = 1 (admin user)
      const created_by = 1;
      
      // Check if loan exists
      const existingLoan = await executeSingleQuery(
        'SELECT id FROM loans WHERE id = ? AND created_by = ?',
        [loanId, created_by]
      );
      
      if (!existingLoan) {
        throw {
          response: {
            status: 404,
            data: { message: 'Loan not found' },
          },
        };
      }
      
      // Delete loan (cascade will delete payments)
      await executeMutation(
        'DELETE FROM loans WHERE id = ? AND created_by = ?',
        [loanId, created_by]
      );
      
      return {
        data: {
          success: true,
          message: 'Loan deleted successfully (Offline Mode)',
        },
      };
    } catch (error) {
      console.error('❌ Failed to delete loan:', error);
      throw error;
    }
  },

  // Get loan summary
  getSummary: async () => {
    try {
      console.log('📊 Getting loan summary (Offline)');
      
      // For demo, we'll use created_by = 1 (admin user)
      const created_by = 1;
      
      const summary = await executeSingleQuery(
        `SELECT
          COUNT(*) AS total_loans,
          SUM(CASE WHEN type='given' THEN principal_amount ELSE 0 END) AS total_given,
          SUM(CASE WHEN type='taken' THEN principal_amount ELSE 0 END) AS total_taken,
          SUM(CASE WHEN type='given' THEN (principal_amount - COALESCE(paid,0)) ELSE 0 END) AS pending_receivable,
          SUM(CASE WHEN type='taken' THEN (principal_amount - COALESCE(paid,0)) ELSE 0 END) AS pending_payable,
          SUM(CASE WHEN status='overdue' THEN 1 ELSE 0 END) AS overdue_count
        FROM (
          SELECT l.id, l.type, l.principal_amount, l.status, COALESCE(SUM(p.amount),0) AS paid
          FROM loans l
          LEFT JOIN loan_payments p ON p.loan_id = l.id
          WHERE l.created_by = ?
          GROUP BY l.id
        ) sub`,
        [created_by]
      );
      
      // Auto-mark overdue loans
      await this.markOverdueLoans();
      
      return {
        data: {
          success: true,
          data: summary || {
            total_loans: 0,
            total_given: 0,
            total_taken: 0,
            pending_receivable: 0,
            pending_payable: 0,
            overdue_count: 0,
          },
        },
      };
    } catch (error) {
      console.error('❌ Failed to get loan summary:', error);
      throw error;
    }
  },

  // Add payment to loan
  addPayment: async (loanId, paymentData) => {
    try {
      console.log('💳 Adding payment (Offline):', loanId, paymentData);
      
      const { amount, payment_date, note } = paymentData;
      
      // Check if loan exists
      const existingLoan = await executeSingleQuery(
        'SELECT id, principal_amount FROM loans WHERE id = ?',
        [loanId]
      );
      
      if (!existingLoan) {
        throw {
          response: {
            status: 404,
            data: { message: 'Loan not found' },
          },
        };
      }
      
      // Check total paid amount
      const totalPaid = await executeSingleQuery(
        'SELECT COALESCE(SUM(amount), 0) AS total_paid FROM loan_payments WHERE loan_id = ?',
        [loanId]
      );
      
      const newTotalPaid = (totalPaid?.total_paid || 0) + amount;
      
      if (newTotalPaid > existingLoan.principal_amount) {
        throw {
          response: {
            status: 400,
            data: { message: 'Payment amount exceeds loan principal' },
          },
        };
      }
      
      // Add payment
      await executeMutation(
        'INSERT INTO loan_payments (loan_id, amount, payment_date, note) VALUES (?, ?, ?, ?)',
        [loanId, amount, payment_date, note]
      );
      
      // Check if loan is fully paid
      if (newTotalPaid >= existingLoan.principal_amount) {
        await executeMutation(
          'UPDATE loans SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['settled', loanId]
        );
      }
      
      // Get the inserted payment
      const insertedPayment = await executeSingleQuery(
        'SELECT * FROM loan_payments WHERE loan_id = ? ORDER BY created_at DESC LIMIT 1',
        [loanId]
      );
      
      return {
        data: {
          success: true,
          message: 'Payment added successfully (Offline Mode)',
          data: insertedPayment,
        },
      };
    } catch (error) {
      console.error('❌ Failed to add payment:', error);
      throw error;
    }
  },

  // Get payments for a loan
  getPayments: async (loanId) => {
    try {
      console.log('💳 Getting payments (Offline):', loanId);
      
      const payments = await executeQuery(
        'SELECT * FROM loan_payments WHERE loan_id = ? ORDER BY payment_date DESC',
        [loanId]
      );
      
      return {
        data: {
          success: true,
          data: payments,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get payments:', error);
      throw error;
    }
  },

  // Mark overdue loans
  markOverdueLoans: async () => {
    try {
      // For demo, we'll use created_by = 1 (admin user)
      const created_by = 1;
      
      const today = new Date().toISOString().split('T')[0];
      
      await executeMutation(
        `UPDATE loans SET status = 'overdue', updated_at = CURRENT_TIMESTAMP 
        WHERE created_by = ? AND due_date < ? AND status = 'active'`,
        [created_by, today]
      );
      
      console.log('✅ Overdue loans marked');
    } catch (error) {
      console.error('❌ Failed to mark overdue loans:', error);
    }
  },
};

export default offlineLoanService;
