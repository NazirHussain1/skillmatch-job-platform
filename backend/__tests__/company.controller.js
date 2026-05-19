jest.mock('../models/User.model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn()
}));

jest.mock('../models/Job.model', () => ({
  find: jest.fn(),
  countDocuments: jest.fn()
}));

const User = require('../models/User.model');
const Job = require('../models/Job.model');
const {
  getCompanyProfile,
  getAllCompanies
} = require('../controllers/company.controller');

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

describe('company controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 when company profile does not exist', async () => {
    const select = jest.fn().mockResolvedValue(null);
    User.findById.mockReturnValue({ select });

    const { res, next } = await runController(getCompanyProfile, {
      params: { id: 'company-1' }
    });

    expect(select).toHaveBeenCalledWith('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');
    expect(Job.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Company not found'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 404 for non-employer profiles', async () => {
    const select = jest.fn().mockResolvedValue({
      _id: 'user-1',
      role: 'jobseeker'
    });
    User.findById.mockReturnValue({ select });

    const { res, next } = await runController(getCompanyProfile, {
      params: { id: 'user-1' }
    });

    expect(Job.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not a company profile'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns a company profile with active jobs and stats', async () => {
    const company = {
      _id: 'company-1',
      role: 'employer',
      companyName: 'Acme'
    };
    const jobs = [{ _id: 'job-1', title: 'Frontend Engineer' }];
    const select = jest.fn().mockResolvedValue(company);
    const sort = jest.fn().mockResolvedValue(jobs);
    User.findById.mockReturnValue({ select });
    Job.find.mockReturnValue({ sort });
    Job.countDocuments
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(3);

    const { res, next } = await runController(getCompanyProfile, {
      params: { id: 'company-1' }
    });

    expect(Job.find).toHaveBeenCalledWith({
      employer: 'company-1',
      status: 'active'
    });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(Job.countDocuments).toHaveBeenNthCalledWith(1, { employer: 'company-1' });
    expect(Job.countDocuments).toHaveBeenNthCalledWith(2, {
      employer: 'company-1',
      status: 'active'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Company profile retrieved successfully',
      data: {
        company,
        jobs,
        stats: {
          totalJobs: 8,
          activeJobs: 3
        }
      }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns paginated companies with active job counts', async () => {
    const companies = [
      {
        _id: 'company-1',
        toObject: jest.fn().mockReturnValue({
          _id: 'company-1',
          companyName: 'Acme'
        })
      },
      {
        _id: 'company-2',
        toObject: jest.fn().mockReturnValue({
          _id: 'company-2',
          companyName: 'Globex'
        })
      }
    ];
    const query = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockResolvedValue(companies)
    };
    User.countDocuments.mockResolvedValue(25);
    User.find.mockReturnValue(query);
    Job.countDocuments
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2);

    const { res, next } = await runController(getAllCompanies, {
      query: { page: '2', limit: '10' }
    });

    expect(User.countDocuments).toHaveBeenCalledWith({
      role: 'employer',
      isEmailVerified: true
    });
    expect(User.find).toHaveBeenCalledWith({
      role: 'employer',
      isEmailVerified: true
    });
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(query.skip).toHaveBeenCalledWith(10);
    expect(Job.countDocuments).toHaveBeenNthCalledWith(1, {
      employer: 'company-1',
      status: 'active'
    });
    expect(Job.countDocuments).toHaveBeenNthCalledWith(2, {
      employer: 'company-2',
      status: 'active'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Companies retrieved successfully',
      data: {
        companies: [
          {
            _id: 'company-1',
            companyName: 'Acme',
            jobCount: 4
          },
          {
            _id: 'company-2',
            companyName: 'Globex',
            jobCount: 2
          }
        ],
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          pages: 3
        }
      }
    });
    expect(next).not.toHaveBeenCalled();
  });
});
