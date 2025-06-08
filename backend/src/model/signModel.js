const { poolPromise, sql } = require('../database/dbConfig');

/**
 * Lấy tất cả signatures
 * @returns 
 */
exports.getAllSignatures = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Signatures');
    return result.recordset;
};

/**
 * Lấy chữ ký theo ID
 * @param {number} signatureId 
 * @returns 
 */
exports.getSignatureById = async (signatureId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('SignatureID', sql.Int, signatureId)
        .query('SELECT * FROM Signatures WHERE SignatureID = @SignatureID');
    return result.recordset[0];
};

/**
 * Tạo signature mới
 * @param {{ userId: number, signatureData: string }} signature
 */
exports.createSignature = async ({ userId, signatureData }) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('SignatureData', sql.NVarChar(sql.MAX), signatureData)
        .query(`
            INSERT INTO Signatures (UserID, SignatureData)
            VALUES (@UserID, @SignatureData);
            SELECT SCOPE_IDENTITY() AS SignatureID;
        `);
    return { signatureId: result.recordset[0].SignatureID };
};

/**
 * Cập nhật chữ ký
 * @param {number} signatureId 
 * @param {string} newData 
 * @returns 
 */
exports.updateSignature = async (signatureId, newData) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('SignatureID', sql.Int, signatureId)
        .input('SignatureData', sql.NVarChar(sql.MAX), newData)
        .query(`
            UPDATE Signatures
            SET SignatureData = @SignatureData
            WHERE SignatureID = @SignatureID;
            SELECT @@ROWCOUNT AS rowsAffected;
        `);
    return { rowsAffected: result.recordset[0].rowsAffected };
};

/**
 * Xoá chữ ký
 * @param {number} signatureId 
 * @returns 
 */
exports.deleteSignature = async (signatureId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('SignatureID', sql.Int, signatureId)
        .query(`
            DELETE FROM Signatures WHERE SignatureID = @SignatureID;
            SELECT @@ROWCOUNT AS rowsAffected;
        `);
    return { rowsAffected: result.recordset[0].rowsAffected };
};