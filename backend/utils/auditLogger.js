const AuditLog = require('../models/AuditLog.model');

const getRequestIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.ip ||
  req.socket?.remoteAddress ||
  '';

const logAuditEvent = async ({
  req,
  action,
  targetType,
  targetId,
  metadata = {}
}) => {
  try {
    if (!req?.user?._id) {
      return null;
    }

    return await AuditLog.create({
      actor: req.user._id,
      action,
      targetType,
      targetId,
      metadata,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'] || ''
    });
  } catch {
    return null;
  }
};

module.exports = {
  logAuditEvent
};
