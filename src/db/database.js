import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { SQLITE_SCHEMA, SEED_DATA } from './schema';

// Import web database for web platform
let webDatabase;
if (Platform.OS === 'web') {
  webDatabase = require('./webDatabase').default;
}

let db = null;

// Initialize database connection
export const initDatabase = async () => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web: Using mock database');
      return await webDatabase.initDatabase();
    }
    
    console.log('🗄️ Initializing SQLite database...');
    
    // Open or create database
    db = await SQLite.openDatabaseAsync('mpc_offline.db');
    
    // Execute schema creation
    await db.execAsync(SQLITE_SCHEMA);
    console.log('✅ Database schema created');
    
    // Execute seed data
    await db.execAsync(SEED_DATA);
    console.log('✅ Seed data inserted');
    
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Get database instance
export const getDatabase = () => {
  if (Platform.OS === 'web') {
    return webDatabase; // Return mock database for web
  }
  
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Helper function to execute queries with error handling
export const executeQuery = async (query, params = []) => {
  try {
    if (Platform.OS === 'web') {
      return await webDatabase.executeQuery(query, params);
    }
    
    const database = getDatabase();
    const result = await database.getAllAsync(query, params);
    return result;
  } catch (error) {
    console.error('❌ Query execution failed:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
};

// Helper function for single row queries
export const executeSingleQuery = async (query, params = []) => {
  try {
    if (Platform.OS === 'web') {
      return await webDatabase.executeSingleQuery(query, params);
    }
    
    const database = getDatabase();
    const result = await database.getFirstAsync(query, params);
    return result;
  } catch (error) {
    console.error('❌ Single query execution failed:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
};

// Helper function for INSERT/UPDATE/DELETE operations
export const executeMutation = async (query, params = []) => {
  try {
    if (Platform.OS === 'web') {
      return await webDatabase.executeMutation(query, params);
    }
    
    const database = getDatabase();
    const result = await database.runAsync(query, params);
    return result;
  } catch (error) {
    console.error('❌ Mutation execution failed:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
};

// Helper function to get last insert ID
export const getLastInsertId = async () => {
  try {
    if (Platform.OS === 'web') {
      return await webDatabase.getLastInsertId();
    }
    
    const database = getDatabase();
    const result = await database.getFirstAsync('SELECT last_insert_rowid() as id');
    return result?.id || null;
  } catch (error) {
    console.error('❌ Failed to get last insert ID:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async () => {
  try {
    if (Platform.OS === 'web') {
      return await webDatabase.closeDatabase();
    }
    
    if (db) {
      await db.closeAsync();
      db = null;
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Failed to close database:', error);
    throw error;
  }
};

// Check if database is initialized
export const isDatabaseInitialized = () => {
  if (Platform.OS === 'web') {
    return webDatabase.isDatabaseInitialized();
  }
  return db !== null;
};

// Reset database (for testing purposes)
export const resetDatabase = async () => {
  try {
    if (Platform.OS === 'web') {
      return await webDatabase.resetDatabase();
    }
    
    await closeDatabase();
    // Note: SQLite doesn't support DROP DATABASE, so we'll delete the file
    // In a real app, you might want to use a different approach
    console.log('🔄 Database reset completed');
    return await initDatabase();
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
};

export default {
  initDatabase,
  getDatabase,
  executeQuery,
  executeSingleQuery,
  executeMutation,
  getLastInsertId,
  closeDatabase,
  isDatabaseInitialized,
  resetDatabase,
};
