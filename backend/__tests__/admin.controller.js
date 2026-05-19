jest.mock('../models/User.model', () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn()
}));

jest.mock('../models/Job.model', () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  deleteMany: jest.fn(),
  aggregate: jest.fn()
}));

jest.mock('../models/Application.model', () => ({
  countDocuments: jest.fn(),
  deleteMany: jest.fn()
}));

jest.mock('../models/AuditLog.model', () => ({
  countDocuments: jest.fn(),
  find: jest.fn()
}));

jest.mock('../utils/auditLogger', () => ({
  logAuditEvent: jest.fn()
}));

const User = require('../models/User.model');
const Job = require('../models/Job.model');
const Application = require('../models/Application.model');
const { logAuditEvent } = require('../utils/auditLogger');
const {
  getAllJobs,
  deleteUser,
  updateUserRole,
  approveJob,
  rejectJob,
  deleteJobAdmin
} = require('../controllers/admin.controller');

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('admin controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logAuditEvent.mockResolvedValue(null);
  });

  describe('getAllJobs', () => {
    it('rejects invalid status filters before querying jobs', async () => {
      const req = {
        query: { status: 'archived' }
      };
      const res = createResponse();
      const next = jest.fn();

      getAllJobs(req, res, next);
      await flushPromises();

      expect(Job.countDocuments).not.toHaveBeenCalled();
      expect(Job.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid status'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('prevents an admin from deleting their own account', async () => {
      User.findById.mockResolvedValue({
        _id: { toString: () => 'admin-1' },
        role: 'admin'
      });

      const req = {
        params: { id: 'admin-1' },
        user: { _id: { toString: () => 'admin-1' } }
      };
      const res = createResponse();
      const next = jest.fn();

      deleteUser(req, res, next);
      await flushPromises();

      expect(Job.deleteMany).not.toHaveBeenCalled();
      expect(Application.deleteMany).not.toHaveBeenCalled();
      expect(logAuditEvent).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You cannot delete your own account'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deletes employer jobs and writes an audit event when deleting an employer', async () => {
      const user = {
        _id: { toString: () => 'employer-1' },
        email: 'employer@example.com',
        role: 'employer',
        deleteOne: jest.fn().mockResolvedValue(undefined)
      };
      User.findById.mockResolvedValue(user);
      Job.deleteMany.mockResolvedValue({ deletedCount: 2 });

      const req = {
        params: { id: 'employer-1' },
        user: { _id: { toString: () => 'admin-1' } },
        headers: {},
        socket: {}
      };
      const res = createResponse();
      const next = jest.fn();

      deleteUser(req, res, next);
      await flushPromises();

      expect(Job.deleteMany).toHaveBeenCalledWith({ employer: user._id });
      expect(Application.deleteMany).not.toHaveBeenCalled();
      expect(user.deleteOne).toHaveBeenCalled();
      expect(logAuditEvent).toHaveBeenCalledWith({
        req,
        action: 'user.delete',
        targetType: 'User',
        targetId: user._id,
        metadata: {
          deletedUserEmail: 'employer@example.com',
          deletedUserRole: 'employer'
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User deleted successfully',
        data: { id: 'employer-1' }
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('updateUserRole', () => {
    it('rejects invalid roles', async () => {
      const req = {
        params: { id: 'user-1' },
        body: { role: 'owner' },
        user: { _id: { toString: () => 'admin-1' } }
      };
      const res = createResponse();
      const next = jest.fn();

      updateUserRole(req, res, next);
      await flushPromises();

      expect(User.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid role'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('prevents an admin from changing their own role', async () => {
      User.findById.mockResolvedValue({
        _id: { toString: () => 'admin-1' },
        role: 'admin'
      });

      const req = {
        params: { id: 'admin-1' },
        body: { role: 'jobseeker' },
        user: { _id: { toString: () => 'admin-1' } }
      };
      const res = createResponse();
      const next = jest.fn();

      updateUserRole(req, res, next);
      await flushPromises();

      expect(logAuditEvent).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You cannot change your own role'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('updates another user role and writes an audit event', async () => {
      const user = {
        _id: { toString: () => 'user-1' },
        email: 'user@example.com',
        role: 'jobseeker',
        save: jest.fn().mockResolvedValue(undefined)
      };
      User.findById.mockResolvedValue(user);

      const req = {
        params: { id: 'user-1' },
        body: { role: 'employer' },
        user: { _id: { toString: () => 'admin-1' } },
        headers: {},
        socket: {}
      };
      const res = createResponse();
      const next = jest.fn();

      updateUserRole(req, res, next);
      await flushPromises();

      expect(user.role).toBe('employer');
      expect(user.save).toHaveBeenCalled();
      expect(logAuditEvent).toHaveBeenCalledWith({
        req,
        action: 'user.role_update',
        targetType: 'User',
        targetId: user._id,
        metadata: {
          previousRole: 'jobseeker',
          nextRole: 'employer',
          email: 'user@example.com'
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User role updated successfully',
        data: user
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('job moderation', () => {
    it('approves a job and records the previous status', async () => {
      const job = {
        _id: 'job-1',
        title: 'Frontend Engineer',
        company: 'Acme',
        status: 'pending',
        save: jest.fn().mockResolvedValue(undefined)
      };
      Job.findById.mockResolvedValue(job);

      const req = {
        params: { id: 'job-1' },
        user: { _id: 'admin-1' },
        headers: {},
        socket: {}
      };
      const res = createResponse();
      const next = jest.fn();

      approveJob(req, res, next);
      await flushPromises();

      expect(job.status).toBe('active');
      expect(job.save).toHaveBeenCalled();
      expect(logAuditEvent).toHaveBeenCalledWith({
        req,
        action: 'job.approve',
        targetType: 'Job',
        targetId: 'job-1',
        metadata: {
          title: 'Frontend Engineer',
          company: 'Acme',
          previousStatus: 'pending',
          nextStatus: 'active'
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Job approved successfully',
        data: job
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects a job and records the previous status', async () => {
      const job = {
        _id: 'job-1',
        title: 'Frontend Engineer',
        company: 'Acme',
        status: 'pending',
        save: jest.fn().mockResolvedValue(undefined)
      };
      Job.findById.mockResolvedValue(job);

      const req = {
        params: { id: 'job-1' },
        user: { _id: 'admin-1' },
        headers: {},
        socket: {}
      };
      const res = createResponse();
      const next = jest.fn();

      rejectJob(req, res, next);
      await flushPromises();

      expect(job.status).toBe('rejected');
      expect(job.save).toHaveBeenCalled();
      expect(logAuditEvent).toHaveBeenCalledWith({
        req,
        action: 'job.reject',
        targetType: 'Job',
        targetId: 'job-1',
        metadata: {
          title: 'Frontend Engineer',
          company: 'Acme',
          previousStatus: 'pending',
          nextStatus: 'rejected'
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it('deletes applications before deleting a job', async () => {
      const job = {
        _id: 'job-1',
        title: 'Frontend Engineer',
        company: 'Acme',
        status: 'active',
        deleteOne: jest.fn().mockResolvedValue(undefined)
      };
      Job.findById.mockResolvedValue(job);
      Application.deleteMany.mockResolvedValue({ deletedCount: 3 });

      const req = {
        params: { id: 'job-1' },
        user: { _id: 'admin-1' },
        headers: {},
        socket: {}
      };
      const res = createResponse();
      const next = jest.fn();

      deleteJobAdmin(req, res, next);
      await flushPromises();

      expect(Application.deleteMany).toHaveBeenCalledWith({ job: 'job-1' });
      expect(job.deleteOne).toHaveBeenCalled();
      expect(logAuditEvent).toHaveBeenCalledWith({
        req,
        action: 'job.delete',
        targetType: 'Job',
        targetId: 'job-1',
        metadata: {
          title: 'Frontend Engineer',
          company: 'Acme',
          previousStatus: 'active'
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Job deleted successfully',
        data: { id: 'job-1' }
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
