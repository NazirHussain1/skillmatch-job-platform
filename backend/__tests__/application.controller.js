jest.mock('../models/Application.model', () => ({
  find: jest.fn()
}));

jest.mock('../models/Job.model', () => ({}));
jest.mock('../models/Notification.model', () => ({}));

const Application = require('../models/Application.model');
const { getMyApplications } = require('../controllers/application.controller');

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('application controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not expose employer private notes in applicant application lists', async () => {
    const applications = [{ _id: 'application-1', status: 'interview' }];
    const query = {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(applications)
    };
    const req = { user: { _id: 'user-1' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    Application.find.mockReturnValue(query);

    getMyApplications(req, res, next);
    await flushPromises();

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
});
