jest.mock('../models/Job.model', () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn()
}));

const Job = require('../models/Job.model');
const {
  getJobs,
  getJob,
  createJob,
  updateJob
} = require('../controllers/job.controller');

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

const createFindQuery = (jobs) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockResolvedValue(jobs)
});

const createFindByIdQuery = (job) => ({
  populate: jest.fn().mockResolvedValue(job)
});

describe('job controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getJobs', () => {
    it('defaults public listings to active jobs and applies search filters', async () => {
      const jobs = [{ _id: 'job-1', title: 'Frontend Engineer', status: 'active' }];
      const query = createFindQuery(jobs);
      Job.countDocuments.mockResolvedValue(1);
      Job.find.mockReturnValue(query);

      const req = {
        query: {
          keyword: 'react',
          location: 'remote',
          salary: '90000',
          skill: 'javascript',
          page: '2',
          limit: '5'
        },
        user: null
      };
      const res = createResponse();
      const next = jest.fn();

      getJobs(req, res, next);
      await flushPromises();

      const expectedFilter = {
        status: 'active',
        $or: [
          { title: { $regex: 'react', $options: 'i' } },
          { company: { $regex: 'react', $options: 'i' } },
          { description: { $regex: 'react', $options: 'i' } }
        ],
        location: { $regex: 'remote', $options: 'i' },
        salary: { $gte: 90000 },
        skills: { $regex: 'javascript', $options: 'i' }
      };

      expect(Job.countDocuments).toHaveBeenCalledWith(expectedFilter);
      expect(Job.find).toHaveBeenCalledWith(expectedFilter);
      expect(query.populate).toHaveBeenCalledWith('employer', 'name email');
      expect(query.populate).toHaveBeenCalledWith('applicationCount');
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(query.limit).toHaveBeenCalledWith(5);
      expect(query.skip).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Jobs retrieved successfully',
        data: {
          jobs,
          pagination: {
            page: 2,
            limit: 5,
            total: 1,
            pages: 1
          }
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects public requests for private job statuses', async () => {
      const req = {
        query: {
          status: 'pending'
        },
        user: null
      };
      const res = createResponse();
      const next = jest.fn();

      getJobs(req, res, next);
      await flushPromises();

      expect(Job.countDocuments).not.toHaveBeenCalled();
      expect(Job.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to view jobs with this status'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('allows an employer to list their own private jobs', async () => {
      const jobs = [{ _id: 'job-1', title: 'Pending Role', status: 'pending' }];
      const query = createFindQuery(jobs);
      Job.countDocuments.mockResolvedValue(1);
      Job.find.mockReturnValue(query);

      const req = {
        query: {
          employer: 'employer-1',
          status: 'pending'
        },
        user: {
          _id: { toString: () => 'employer-1' },
          role: 'employer'
        }
      };
      const res = createResponse();
      const next = jest.fn();

      getJobs(req, res, next);
      await flushPromises();

      expect(Job.find).toHaveBeenCalledWith({
        employer: 'employer-1',
        status: 'pending'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects invalid status filters', async () => {
      const req = {
        query: {
          status: 'archived'
        },
        user: { role: 'admin' }
      };
      const res = createResponse();
      const next = jest.fn();

      getJobs(req, res, next);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid status'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getJob', () => {
    it('returns 404 for non-existent jobs', async () => {
      Job.findById.mockReturnValue(createFindByIdQuery(null));

      const req = {
        params: { id: 'job-1' },
        user: null
      };
      const res = createResponse();
      const next = jest.fn();

      getJob(req, res, next);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Job not found'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('hides private job details from public users', async () => {
      Job.findById.mockReturnValue(createFindByIdQuery({
        _id: 'job-1',
        employer: 'employer-1',
        status: 'pending'
      }));

      const req = {
        params: { id: 'job-1' },
        user: null
      };
      const res = createResponse();
      const next = jest.fn();

      getJob(req, res, next);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Job not found'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('allows admins to view private job details', async () => {
      const job = {
        _id: 'job-1',
        employer: 'employer-1',
        status: 'pending'
      };
      Job.findById.mockReturnValue(createFindByIdQuery(job));

      const req = {
        params: { id: 'job-1' },
        user: { role: 'admin' }
      };
      const res = createResponse();
      const next = jest.fn();

      getJob(req, res, next);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Job retrieved successfully',
        data: job
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('createJob', () => {
    it('normalizes numeric, boolean, and list fields before creating a job', async () => {
      const createdJob = { _id: 'job-1', title: 'Frontend Engineer' };
      Job.create.mockResolvedValue(createdJob);

      const req = {
        user: { _id: 'employer-1' },
        body: {
          title: 'Frontend Engineer',
          salaryMin: '90000',
          salaryMax: '120000',
          skills: [' React ', '', 'Node.js'],
          benefits: [' Health ', null, 'Remote stipend'],
          applicationDeadline: '',
          isUrgent: 'true'
        }
      };
      const res = createResponse();
      const next = jest.fn();

      createJob(req, res, next);
      await flushPromises();

      expect(Job.create).toHaveBeenCalledWith({
        title: 'Frontend Engineer',
        salaryMin: 90000,
        salaryMax: 120000,
        salary: 120000,
        skills: ['React', 'Node.js'],
        benefits: ['Health', 'Remote stipend'],
        applicationDeadline: undefined,
        isUrgent: true,
        employer: 'employer-1'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Job created successfully',
        data: createdJob
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('updateJob', () => {
    it('rejects updates from employers who do not own the job', async () => {
      Job.findById.mockResolvedValue({
        _id: 'job-1',
        employer: { toString: () => 'owner-1' }
      });

      const req = {
        params: { id: 'job-1' },
        user: { _id: { toString: () => 'other-employer' } },
        body: { title: 'Updated title' }
      };
      const res = createResponse();
      const next = jest.fn();

      updateJob(req, res, next);
      await flushPromises();

      expect(Job.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to update this job'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
