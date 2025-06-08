const { poolPromise, sql } = require('../database/dbConfig');

/**
 * Lấy tất cả người dùng
 */
exports.getAllUsers = async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM [Users]');
        return result.recordset;
    } catch (err) {
        console.error('Error querying all users:', err);
        throw err;
    }
};

/**
 * Lấy thông tin 1 user theo ID
 */
exports.getUserById = async (userId) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query('SELECT * FROM [Users] WHERE UserID = @UserID');
        return result.recordset[0];
    } catch (err) {
        console.error(`Error querying user ${userId}:`, err);
        throw err;
    }
};

/**
 * Thêm mới 1 user
 * @param {{ fullName: string, username: string, passwordHash: string, email: string }} user
 */
exports.createUser = async ({ fullName, username, passwordHash, email }) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('FullName', sql.NVarChar(200), fullName)
            .input('Username', sql.NVarChar(100), username)
            .input('PasswordHash', sql.NVarChar(512), passwordHash)
            .input('Email', sql.NVarChar(200), email)
            // chèn và trả về UserID mới
            .query(`
                INSERT INTO [Users] (FullName, Username, PasswordHash, Email)
                VALUES (@FullName, @Username, @PasswordHash, @Email);
                SELECT SCOPE_IDENTITY() AS UserID;
            `);
        return { userId: result.recordset[0].UserID };
    } catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
};

/**
 * Cập nhật 1 user
 * @param {number} userId 
 * @param {{ fullName?: string, username?: string, passwordHash?: string, email?: string }} fields 
 */
exports.updateUser = async (userId, fields) => {
    try {
        const pool = await poolPromise;
        const request = pool.request().input('UserID', sql.Int, userId);

        // build dynamic SET clause
        const setClauses = [];
        if (fields.fullName !== undefined) {
            request.input('FullName', sql.NVarChar(200), fields.fullName);
            setClauses.push('FullName = @FullName');
        }
        if (fields.username !== undefined) {
            request.input('Username', sql.NVarChar(100), fields.username);
            setClauses.push('Username = @Username');
        }
        if (fields.passwordHash !== undefined) {
            request.input('PasswordHash', sql.NVarChar(512), fields.passwordHash);
            setClauses.push('PasswordHash = @PasswordHash');
        }
        if (fields.email !== undefined) {
            request.input('Email', sql.NVarChar(200), fields.email);
            setClauses.push('Email = @Email');
        }

        if (setClauses.length === 0) {
            throw new Error('No fields to update');
        }

        const sqlQuery = `
            UPDATE [Users]
            SET ${setClauses.join(', ')}
            WHERE UserID = @UserID;
            SELECT @@ROWCOUNT AS rowsAffected;
        `;
        const result = await request.query(sqlQuery);
        return { rowsAffected: result.recordset[0].rowsAffected };
    } catch (err) {
        console.error(`Error updating user ${userId}:`, err);
        throw err;
    }
};

/**
 * Xóa 1 user
 * @param {number} userId 
 */
exports.deleteUser = async (userId) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`
                DELETE FROM [Users]
                WHERE UserID = @UserID;
                SELECT @@ROWCOUNT AS rowsAffected;
            `);
        return { rowsAffected: result.recordset[0].rowsAffected };
    } catch (err) {
        console.error(`Error deleting user ${userId}:`, err);
        throw err;
    }
};

/**
 * Kiểm tra đăng nhập
 * @param {{ username: string, passwordHash: string }} credentials
 * @returns {Promise<Object|null>} Trả về thông tin người dùng nếu đúng, nếu sai thì trả về null
 */
exports.checkLogin = async ({ Username, PasswordHash }) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Username', sql.NVarChar(255), Username)
            .input('PasswordHash', sql.NVarChar(sql.MAX), PasswordHash)
            .query(`
                SELECT * FROM Users
                WHERE Username = @Username AND PasswordHash = @PasswordHash
            `);

        return result.recordset[0] || null;
    } catch (err) {
        console.error('Login check failed:', err);
        throw err;
    }
};
