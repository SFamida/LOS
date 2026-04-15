const { getConnection } = require('../db/connection');
const { hashPassword } = require('../utils/passwordUtils');

// In-memory storage for development/testing when DB is not available
const userStorage = new Map();

// Pre-populate with sample users for testing
//userStorage.set('USER-1', {
 // id: 'USER-1',
 // first_name: 'John',
 // last_name: 'Doe',
 // email: 'john.doe@example.com',
 // level: 'L1',
 // role: 'Read-Only',
 // created_at: new Date(),
//});

//userStorage.set('USER-2', {
 // id: 'USER-2',
 // first_name: 'Jane',
 // last_name: 'Smith',
 // email: 'jane.smith@example.com',
 // level: 'L2',
 // role: 'Admin',
 // created_at: new Date(),
//});

class UserModel {
  static async getAllUsers() {
    try {
      try {
        const pool = await getConnection();
        const request = pool.request();
        const result = await request.query('SELECT id, first_name, last_name, email, level, role, created_at FROM lender_users ORDER BY created_at DESC');
        
        console.log('[USER] Database result:', JSON.stringify(result.recordset).substring(0, 100));
        console.log('[USER] Recordset length:', result?.recordset?.length);
        
        // If database returns results, use them
        if (result && result.recordset && result.recordset.length > 0) {
          console.log('[USER] Returning', result.recordset.length, 'records from database');
          return result.recordset;
        } else {
          console.log('[USER] Database returned empty recordset, using in-memory storage');
        }
      } catch (dbError) {
        console.warn('[USER] Database query failed:', dbError.message);
        console.warn('[USER] Using in-memory storage as fallback');
      }
      
      // Fall back to in-memory storage
      const inMemoryUsers = Array.from(userStorage.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      console.log('[USER] Returning', inMemoryUsers.length, 'records from in-memory storage');
      return inMemoryUsers;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  static async getUserById(id) {
    try {
      try {
        const pool = await getConnection();
        const request = pool.request();
        const result = await request.input('id', null, id)
          .query('SELECT id, first_name, last_name, email, level, role, created_at FROM lender_users WHERE id = @id');
        return result.recordset[0] || null;
      } catch (dbError) {
        return userStorage.get(id) || null;
      }
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  static async createUser(userData) {
    const { firstName, lastName, email, level, role, password } = userData;
    const id = `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const passwordHash = await hashPassword(password);

      let savedToDb = false;
      let dbError = null;

      try {
        const pool = await getConnection();
        const request = pool.request();
        
        // Insert into users table
        await request
          .input('id', null, id)
          .input('email', null, email)
          .input('passwordHash', null, passwordHash)
          .input('role', null, role)
          .query(
            'INSERT INTO users (id, email, password_hash, role) VALUES (@id, @email, @passwordHash, @role)'
          );

        // Insert into lender_users table
        const request2 = pool.request();
        await request2
          .input('id', null, id)
          .input('firstName', null, firstName)
          .input('lastName', null, lastName)
          .input('email', null, email)
          .input('level', null, level)
          .input('role', null, role)
          .query(
            'INSERT INTO lender_users (id, first_name, last_name, email, level, role) VALUES (@id, @firstName, @lastName, @email, @level, @role)'
          );

        savedToDb = true;
        console.log(`[USER] Created user ${id} in database`);
        
        // Also store in memory for retrieval
        userStorage.set(id, {
          id,
          first_name: firstName,
          last_name: lastName,
          email,
          level,
          role,
          password_hash: passwordHash,
          created_at: new Date(),
        });
      } catch (dbError_) {
        dbError = dbError_;
        console.warn(`[USER] Database save failed: ${dbError_.message}`);
        console.warn(`[USER] Falling back to in-memory storage for user ${id}`);
        
        // Fallback to in-memory storage
        userStorage.set(id, {
          id,
          first_name: firstName,
          last_name: lastName,
          email,
          level,
          role,
          password_hash: passwordHash,
          created_at: new Date(),
        });
      }

      return { 
        id, 
        firstName, 
        lastName, 
        email, 
        level, 
        role, 
        createdAt: new Date(),
        savedToDatabase: savedToDb,
        error: dbError ? dbError.message : null
      };
    } catch (error) {
      console.error(`[USER] Failed to create user: ${error.message}`);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async updateUser(id, userData) {
    try {
      const { firstName, lastName, email, level, role } = userData;

      try {
        const pool = await getConnection();
        const request = pool.request();

        await request
          .input('id', null, id)
          .input('firstName', null, firstName)
          .input('lastName', null, lastName)
          .input('email', null, email)
          .input('level', null, level)
          .input('role', null, role)
          .query(
            'UPDATE lender_users SET first_name = @firstName, last_name = @lastName, email = @email, level = @level, role = @role WHERE id = @id'
          );
      } catch (dbError) {
        console.warn('Database unavailable, updating user in in-memory storage');
        if (userStorage.has(id)) {
          const user = userStorage.get(id);
          userStorage.set(id, {
            ...user,
            first_name: firstName,
            last_name: lastName,
            email,
            level,
            role,
          });
        }
      }

      return { id, firstName, lastName, email, level, role };
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  static async deleteUser(id) {
    try {
      try {
        const pool = await getConnection();
        
        const request = pool.request();
        await request
          .input('id', null, id)
          .query('DELETE FROM lender_users WHERE id = @id');

        const request2 = pool.request();
        await request2
          .input('id', null, id)
          .query('DELETE FROM users WHERE id = @id');
      } catch (dbError) {
        console.warn('Database unavailable, deleting user from in-memory storage');
        userStorage.delete(id);
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

module.exports = UserModel;
