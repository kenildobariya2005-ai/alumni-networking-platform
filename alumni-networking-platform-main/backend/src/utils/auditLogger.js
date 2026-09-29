import AuditLog from '../models/AuditLog.js';

/**
 * Log an administrative action to the AuditLog collection
 * @param {object} params
 * @param {string|mongoose.Types.ObjectId} params.adminId
 * @param {string} params.action
 * @param {string} params.targetType
 * @param {string|mongoose.Types.ObjectId} params.targetId
 * @param {string} params.description
 * @param {string} [params.ipAddress]
 * @param {object} [params.metadata]
 */
export const logAdminAction = async ({
  adminId,
  action,
  targetType,
  targetId,
  description,
  ipAddress = '',
  metadata = {},
}) => {
  try {
    if (!adminId || !action || !targetType || !targetId || !description) {
      console.warn('[AuditLogger] Incomplete audit log parameters:', { adminId, action, targetType, targetId });
      return null;
    }

    const log = await AuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId,
      description,
      ipAddress,
      metadata,
    });

    return log;
  } catch (error) {
    console.error(`[AuditLogger] Failed to write audit log: ${error.message}`);
    return null; // Audit logging failure should not crash the primary transaction
  }
};
