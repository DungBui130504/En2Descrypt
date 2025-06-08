const { poolPromise, sql } = require('../database/dbConfig');

/**
 * Lấy tất cả key
 * @param {number} userId
 */
exports.getAllKeys = async (userId) => {
    const pool = await poolPromise;
    const result = await pool.request().input('UserID', sql.Int, userId).query('SELECT * FROM Keys WHERE UserID = @UserID');
    return result.recordset;
};

/**
 * Tạo key mới
 * @param {{ userId: number, publicKey: string, privateKey: string }} key
 */
exports.createKey = async ({ userId, publicKey, privateKey }) => {
    // console.log({ userId, publicKey, privateKey });

    const pool = await poolPromise;
    const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('PublicKey', sql.NVarChar(sql.MAX), publicKey)
        .input('PrivateKey', sql.NVarChar(sql.MAX), privateKey)
        .query(
            `INSERT INTO Keys(UserID, PublicKey, PrivateKey)
            VALUES(@UserID, @PublicKey, @PrivateKey);
            SELECT SCOPE_IDENTITY() AS KeyID;`
        );
    return { keyId: result.recordset[0].KeyID };
};

/**
 * Lấy key theo ID và userId
 * @param {number} keyId 
 * @param {number} userId 
 * @returns 
 */
exports.getKeyById = async (keyId, userId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('KeyID', sql.Int, keyId)
        .input('UserID', sql.Int, userId)
        .query('SELECT * FROM Keys WHERE KeyID = @KeyID AND UserID = @UserID');
    return result.recordset[0];
};

/**
 * Cập nhật key theo ID và userId
 * @param {number} keyId 
 * @param {number} userId 
 * @param {{ publicKey?: string, privateKey?: string }} fields 
 */
exports.updateKey = async (keyId, userId, fields) => {
    const pool = await poolPromise;
    const request = pool.request()
        .input('KeyID', sql.Int, keyId)
        .input('UserID', sql.Int, userId);
    const setClauses = [];

    if (fields.publicKey !== undefined) {
        request.input('PublicKey', sql.NVarChar(sql.MAX), fields.publicKey);
        setClauses.push('PublicKey = @PublicKey');
    }
    if (fields.privateKey !== undefined) {
        request.input('PrivateKey', sql.NVarChar(sql.MAX), fields.privateKey);
        setClauses.push('PrivateKey = @PrivateKey');
    }

    if (setClauses.length === 0) throw new Error('No fields to update');

    const result = await request.query(`
        UPDATE Keys
        SET ${setClauses.join(', ')}
        WHERE KeyID = @KeyID AND UserID = @UserID;
        SELECT @@ROWCOUNT AS rowsAffected;
    `);

    return { rowsAffected: result.recordset[0].rowsAffected };
};

/**
 * Xoá key theo ID và userId
 * @param {number} keyId 
 * @param {number} userId 
 */
exports.deleteKey = async (keyId, userId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('KeyID', sql.Int, keyId)
        .input('UserID', sql.Int, userId)
        .query(`
            DELETE FROM Keys WHERE KeyID = @KeyID AND UserID = @UserID;
            SELECT @@ROWCOUNT AS rowsAffected;
        `);
    return { rowsAffected: result.recordset[0].rowsAffected };
};
