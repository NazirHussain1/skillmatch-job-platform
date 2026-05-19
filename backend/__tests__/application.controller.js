jest.mock('../models/Application.model', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
}));

jest.mock('../models/Job.model', () => ({
  findById: jest.fn()
}));

jest.mock('../models/Notification.model', () => ({
  create: jest.fn()
}));

const Application = require('../models/Application.model');
const Job = require('../models/Job.model');
const Notification = require('../models/Notification.model');
const {
  createApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/application.controller');

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

const runController = async (controller, req, res = createResponse()) => {
  const next = jest.fn();
  controller(req, res, next);
  await flushPromises();
  return { res, next };
};

describe('application controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects applications for missing jobs', async () => {
    Job.findById.mockResolvedValue(null);

    const { res, next } = await runController(createApplication, {
      params: { jobId: 'job-1' },
      user: { _id: 'user-1', name: 'Applicant' }
    });

    expect(Application.findOne).not.toHaveBeenCalled();
    expect(Application.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Job not found'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects applications for inactive jobs', async () => {
    Job.findById.mockResolvedValue({
      _id: 'job-1',
      status: 'closed'
    });

    const { res, next } = await runController(createApplication, {
      params: { jobId: 'job-1' },
      user: { _id: 'user-1', name: 'Applicant' }
    });

    expect(Application.findOne).not.toHaveBeenCalled();
    expect(Application.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Applications are only open for active jobs'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects duplicate applications', async () => {
    Job.findById.mockResolvedValue({
      _id: 'job-1',
      status: 'active'
    });
    Application.findOne.mockResolvedValue({ _id: 'application-1' });

    const { res, next } = await runController(createApplication, {
      params: { jobId: 'job-1' },
      user: { _id: 'user-1', name: 'Applicant' }
    });

    expect(Application.findOne).toHaveBeenCalledWith({
      job: 'job-1',
      applicant: 'user-1'
    });
    expect(Application.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'You have already applied to this job'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('creates an application and notifies the employer', async () => {
    const populatedApplication = { _id: 'application-1', status: 'pending' };
    const populateApplicant = jest.fn().mockResolvedValue(populatedApplication);
    const populateJob = jest.fn().mockReturnValue({ populate: populateApplicant });
    Job.findById.mockResolvedValue({
      _id: 'job-1',
      title: 'Frontend Engineer',
      status: 'active',
      employer: { toString: () => 'employer-1' }
    });
    Application.findOne.mockResolvedValue(null);
    Application.create.mockResolvedValue({ _id: 'application-1' });
    Application.findById.mockReturnValue({ populate: populateJob });
    Notification.create.mockResolvedValue({});

    const { res, next } = await runController(createApplication, {
      params: { jobId: 'job-1' },
      user: {
        _id: { toString: () => 'user-1' },
        name: 'Applicant'
      }
    });

    expect(Application.create).toHaveBeenCalledWith({
      job: 'job-1',
      applicant: { toString: expect.any(Function) },
      statusHistory: [{
        status: 'pending',
        note: 'Application submitted'
      }]
    });
    expect(Notification.create).toHaveBeenCalledWith({
      userId: { toString: expect.any(Function) },
      type: 'application_received',
      message: 'Applicant applied to your job "Frontend Engineer".'
    });
    expect(populateJob).toHaveBeenCalledWith('job', 'title company location salary salaryMin salaryMax jobType category workplaceType experienceLevel');
    expect(populateApplicant).toHaveBeenCalledWith('applicant', 'name email resume');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Application submitted successfully',
      data: populatedApplication
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('does not expose employer private notes in applicant application lists', async () => {
    const applications = [{ _id: 'application-1', status: 'interview' }];
    const query = {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(applications)
    };
    const req = { user: { _id: 'user-1' } };

    Application.find.mockReturnValue(query);

    const { res, next } = await runController(getMyApplications, req);

    expect(Application.find).toHaveBeenCalledWith({ applicant: 'user-1' });
    expect(query.select).toHaveBeenCalledWith('-employerNotes');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Applications retrieved successfully',
      data: applications
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('requires job ownership before listing applications for a job', async () => {
    Job.findById.mockResolvedValue({
      _id: 'job-1',
      employer: { toString: () => 'employer-1' }
    });

    const { res, next } = await runController(getJobApplications, {
      params: { jobId: 'job-1' },
      user: { _id: { toString: () => 'other-user' } }
    });

    expect(Application.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized to view applications for this job'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('lists applications for the owning employer', async () => {
    const applications = [{ _id: 'application-1' }];
    const query = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(applications)
    };
    Job.findById.mockResolvedValue({
      _id: 'job-1',
      employer: { toString: () => 'employer-1' }
    });
    Application.find.mockReturnValue(query);

    const { res, next } = await runController(getJobApplications, {
      params: { jobId: 'job-1' },
      user: { _id: { toString: () => 'employer-1' } }
    });

    expect(Application.find).toHaveBeenCalledWith({ job: 'job-1' });
    expect(query.populate).toHaveBeenCalledWith('applicant', 'name email resume');
    expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Applications retrieved successfully',
      data: applications
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('requires ownership before updating application status', async () => {
    const populate = jest.fn().mockResolvedValue({
      _id: 'application-1',
      job: {
        employer: { toString: () => 'employer-1' }
      }
    });
    Application.findById.mockReturnValue({ populate });

    const { res, next } = await runController(updateApplicationStatus, {
      params: { id: 'application-1' },
      user: { _id: { toString: () => 'other-user' } },
      body: { status: 'shortlisted' }
    });

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized to update this application'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('updates application status, history, notes, interview date, and notification', async () => {
    const updatedApplication = { _id: 'application-1', status: 'interview' };
    const populateApplicant = jest.fn().mockResolvedValue(updatedApplication);
    const populateJob = jest.fn().mockReturnValue({ populate: populateApplicant });
    const application = {
      _id: 'application-1',
      applicant: 'applicant-1',
      status: 'pending',
      employerNotes: '',
      interviewDate: undefined,
      statusHistory: [],
      job: {
        title: 'Frontend Engineer',
        employer: { toString: () => 'employer-1' }
      },
      save: jest.fn().mockResolvedValue(undefined)
    };
    Application.findById
      .mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(application)
      })
      .mockReturnValueOnce({
        populate: populateJob
      });
    Notification.create.mockResolvedValue({});

    const { res, next } = await runController(updateApplicationStatus, {
      params: { id: 'application-1' },
      user: { _id: { toString: () => 'employer-1' } },
      body: {
        status: 'interview',
        employerNotes: 'Strong candidate',
        interviewDate: '2026-06-01T10:00:00.000Z',
        historyNote: 'Invite sent'
      }
    });

    expect(application.status).toBe('interview');
    expect(application.employerNotes).toBe('Strong candidate');
    expect(application.interviewDate).toEqual(new Date('2026-06-01T10:00:00.000Z'));
    expect(application.statusHistory).toEqual([
      expect.objectContaining({
        status: 'interview',
        note: 'Invite sent',
        changedAt: expect.any(Date)
      })
    ]);
    expect(application.save).toHaveBeenCalledWith();
    expect(Notification.create).toHaveBeenCalledWith({
      userId: 'applicant-1',
      type: 'application_accepted',
      message: 'You have been moved to the interview stage. Job: "Frontend Engineer".'
    });
    expect(populateJob).toHaveBeenCalledWith('job', 'title company location salary salaryMin salaryMax jobType category workplaceType experienceLevel');
    expect(populateApplicant).toHaveBeenCalledWith('applicant', 'name email resume');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Application status updated successfully',
      data: updatedApplication
    });
    expect(next).not.toHaveBeenCalled();
  });
});
