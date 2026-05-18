jest.mock('../models/AuditLog.model', () => ({
  create: jest.fn()
}));

const AuditLog = require('../models/AuditLog.model');
const { logAuditEvent } = require('../utils/auditLogger');

describe('logAuditEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an audit log with request context', async () => {
    AuditLog.create.mockResolvedValue({ _id: 'audit-1' });

    await logAuditEvent({
      req: {
        user: { _id: 'admin-1' },
        headers: {
          'x-forwarded-for': '203.0.113.10, 10.0.0.1',
          'user-agent': 'jest'
        }
      },
      action: 'job.approve',
      targetType: 'Job',
      targetId: 'job-1',
      metadata: { previousStatus: 'pending' }
    });

    expect(AuditLog.create).toHaveBeenCalledWith({
      actor: 'admin-1',
      action: 'job.approve',
      targetType: 'Job',
      targetId: 'job-1',
      metadata: { previousStatus: 'pending' },
      ipAddress: '203.0.113.10',
      userAgent: 'jest'
    });
  });

  it('does not log when there is no actor', async () => {
    const result = await logAuditEvent({
      req: { headers: {} },
      action: 'job.approve',
      targetType: 'Job',
      targetId: 'job-1'
    });

    expect(result).toBeNull();
    expect(AuditLog.create).not.toHaveBeenCalled();
  });

  it('does not throw when audit persistence fails', async () => {
    AuditLog.create.mockRejectedValue(new Error('database error'));

    await expect(logAuditEvent({
      req: {
        user: { _id: 'admin-1' },
        headers: {}
      },
      action: 'job.reject',
      targetType: 'Job',
      targetId: 'job-1'
    })).resolves.toBeNull();
  });
});
