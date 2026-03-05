const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User.model');
const Job = require('../models/Job.model');

// @desc    Get company profile
// @route   GET /api/company/:id
// @access  Public
const getCompanyProfile = asyncHandler(async (req, res) => {
  const company = await User.findById(req.params.id)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');
  
  if (!company) {
    return res.status(404).json(
      ApiResponse.error('Company not found', 404)
    );
  }
  
  if (company.role !== 'employer') {
    return res.status(404).json(
      ApiResponse.error('Not a company profile', 404)
    );
  }
  
  // Get active jobs for this company
  const jobs = await Job.find({ 
    employer: req.params.id,
    status: 'active'
  }).sort({ createdAt: -1 });
  
  // Get job statistics
  const totalJobs = await Job.countDocuments({ employer: req.params.id });
  const activeJobs = await Job.countDocuments({ employer: req.params.id, status: 'active' });
  
  return res.status(200).json(
    ApiResponse.success('Company profile retrieved successfully', {
      company,
      jobs,
      stats: {
        totalJobs,
        activeJobs
      }
    })
  );
});

// @desc    Get all companies
// @route   GET /api/company
// @access  Public
const getAllCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  
  const total = await User.countDocuments({ role: 'employer', isEmailVerified: true });
  
  const companies = await User.find({ 
    role: 'employer',
    isEmailVerified: true
  })
    .select('name email companyName companyWebsite companyDescription companyLogo location createdAt')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip(skip);
  
  // Get job count for each company
  const companiesWithStats = await Promise.all(
    companies.map(async (company) => {
      const jobCount = await Job.countDocuments({ 
        employer: company._id,
        status: 'active'
      });
      return {
        ...company.toObject(),
        jobCount
      };
    })
  );
  
  return res.status(200).json(
    ApiResponse.success('Companies retrieved successfully', {
      companies: companiesWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  );
});

module.exports = {
  getCompanyProfile,
  getAllCompanies
};
