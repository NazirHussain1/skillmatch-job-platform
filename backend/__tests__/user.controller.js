jest.mock('../models/User.model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn()
}));

jest.mock('../config/cloudinary', () => ({
  uploader: {
    destroy: jest.fn(),
    upload_stream: jest.fn()
  }
}));

const User = require('../models/User.model');
const cloudinary = require('../config/cloudinary');
const {
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadProfilePicture,
  uploadCompanyLogo,
  uploadResume,
  saveJob,
  unsaveJob,
  getSavedJobs
} = require('../controllers/user.controller');

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

describe('user controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the current profile without selecting the password', async () => {
    const user = { _id: 'user-1', name: 'Test User' };
    const select = jest.fn().mockResolvedValue(user);
    User.findById.mockReturnValue({ select });

    const { res, next } = await runController(getProfile, {
      user: { _id: 'user-1' }
    });

    expect(User.findById).toHaveBeenCalledWith('user-1');
    expect(select).toHaveBeenCalledWith('-password');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('updates allowed profile fields and removes password from the response', async () => {
    const user = {
      _id: 'user-1',
      name: 'Old Name',
      email: 'old@example.com',
      role: 'employer',
      bio: 'Old bio',
      skills: ['old'],
      companyName: 'Old Company',
      password: 'hashed-password',
      save: jest.fn(),
      toObject: jest.fn()
    };
    const updatedUser = {
      ...user,
      name: 'New Name',
      email: 'new@example.com',
      companyName: 'New Company',
      password: 'hashed-password'
    };
    user.save.mockResolvedValue(updatedUser);
    user.toObject.mockReturnValue(updatedUser);
    User.findById.mockResolvedValue(user);

    const { res, next } = await runController(updateProfile, {
      user: { _id: 'user-1' },
      body: {
        name: 'New Name',
        email: 'new@example.com',
        bio: '',
        skills: [],
        companyName: 'New Company',
        password: 'NewPass1!'
      }
    });

    expect(user.name).toBe('New Name');
    expect(user.email).toBe('new@example.com');
    expect(user.bio).toBe('');
    expect(user.skills).toEqual([]);
    expect(user.companyName).toBe('New Company');
    expect(user.password).toBe('NewPass1!');
    expect(user.save).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.password).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });

  it('paginates admin user lists with bounded query values', async () => {
    const users = [{ _id: 'user-1' }];
    const query = {
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(users)
    };
    User.find.mockReturnValue(query);
    User.countDocuments.mockResolvedValue(250);

    const { res, next } = await runController(getUsers, {
      query: { page: '-5', limit: '999' }
    });

    expect(query.select).toHaveBeenCalledWith('-password');
    expect(query.limit).toHaveBeenCalledWith(100);
    expect(query.skip).toHaveBeenCalledWith(0);
    expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          page: 1,
          limit: 100,
          total: 250,
          pages: 3
        }
      }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 404 when an admin user lookup misses', async () => {
    const select = jest.fn().mockResolvedValue(null);
    User.findById.mockReturnValue({ select });

    const { res, next } = await runController(getUserById, {
      params: { id: 'missing-user' }
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User not found'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('updates admin-managed user fields without exposing password', async () => {
    const user = {
      name: 'Old Name',
      email: 'old@example.com',
      role: 'jobseeker',
      isActive: true,
      save: jest.fn(),
      toObject: jest.fn()
    };
    user.save.mockResolvedValue(user);
    user.toObject.mockReturnValue({
      _id: 'user-1',
      name: 'New Name',
      email: 'new@example.com',
      role: 'employer',
      isActive: false,
      password: 'hashed-password'
    });
    User.findById.mockResolvedValue(user);

    const { res, next } = await runController(updateUser, {
      params: { id: 'user-1' },
      body: {
        name: 'New Name',
        email: 'new@example.com',
        role: 'employer',
        isActive: false
      }
    });

    expect(user.role).toBe('employer');
    expect(user.isActive).toBe(false);
    expect(user.save).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.password).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });

  it('deletes an admin-managed user', async () => {
    const user = {
      deleteOne: jest.fn().mockResolvedValue(undefined)
    };
    User.findById.mockResolvedValue(user);

    const { res, next } = await runController(deleteUser, {
      params: { id: 'user-1' }
    });

    expect(user.deleteOne).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'User deleted successfully',
      data: { id: 'user-1' }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('requires an uploaded file before profile picture upload work starts', async () => {
    const { res, next } = await runController(uploadProfilePicture, {
      user: { _id: 'user-1' }
    });

    expect(User.findById).not.toHaveBeenCalled();
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Please upload an image file'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('uploads a profile picture and replaces the previous cloudinary image', async () => {
    const user = {
      profilePicture: 'https://res.cloudinary.com/demo/image/upload/v1/old-avatar.jpg',
      save: jest.fn().mockResolvedValue(undefined)
    };
    User.findById.mockResolvedValue(user);
    cloudinary.uploader.destroy.mockResolvedValue(undefined);
    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => ({
      end: jest.fn(() => callback(null, {
        secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/new-avatar.jpg'
      }))
    }));

    const { res, next } = await runController(uploadProfilePicture, {
      user: { _id: 'user-1' },
      file: { buffer: Buffer.from('image-bytes') }
    });

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('skillmatch/profiles/old-avatar');
    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'skillmatch/profiles' }),
      expect.any(Function)
    );
    expect(user.profilePicture).toBe('https://res.cloudinary.com/demo/image/upload/v1/new-avatar.jpg');
    expect(user.save).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: 'https://res.cloudinary.com/demo/image/upload/v1/new-avatar.jpg'
      }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks company logo upload for non-employers', async () => {
    User.findById.mockResolvedValue({ role: 'jobseeker' });

    const { res, next } = await runController(uploadCompanyLogo, {
      user: { _id: 'user-1' },
      file: { buffer: Buffer.from('image-bytes') }
    });

    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Only employers can upload company logos'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks resume upload for non-jobseekers', async () => {
    User.findById.mockResolvedValue({ role: 'employer' });

    const { res, next } = await runController(uploadResume, {
      user: { _id: 'user-1' },
      file: {
        originalname: 'resume.pdf',
        buffer: Buffer.from('resume-bytes')
      }
    });

    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Only jobseekers can upload resumes'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('prevents duplicate saved jobs', async () => {
    User.findById.mockResolvedValue({
      role: 'jobseeker',
      savedJobs: ['job-1']
    });

    const { res, next } = await runController(saveJob, {
      user: { _id: 'user-1' },
      params: { jobId: 'job-1' }
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Job already saved'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('saves and unsaves jobs for jobseekers', async () => {
    const user = {
      role: 'jobseeker',
      savedJobs: ['job-1'],
      save: jest.fn().mockResolvedValue(undefined)
    };
    User.findById.mockResolvedValue(user);

    const saveResult = await runController(saveJob, {
      user: { _id: 'user-1' },
      params: { jobId: 'job-2' }
    });

    expect(user.savedJobs).toEqual(['job-1', 'job-2']);
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(saveResult.res.status).toHaveBeenCalledWith(200);

    const unsaveResult = await runController(unsaveJob, {
      user: { _id: 'user-1' },
      params: { jobId: 'job-1' }
    });

    expect(user.savedJobs).toEqual(['job-2']);
    expect(user.save).toHaveBeenCalledTimes(2);
    expect(unsaveResult.res.status).toHaveBeenCalledWith(200);
    expect(saveResult.next).not.toHaveBeenCalled();
    expect(unsaveResult.next).not.toHaveBeenCalled();
  });

  it('populates saved jobs for jobseekers', async () => {
    const user = {
      role: 'jobseeker',
      savedJobs: [{ _id: 'job-1', title: 'Frontend Engineer' }]
    };
    const populate = jest.fn().mockResolvedValue(user);
    User.findById.mockReturnValue({ populate });

    const { res, next } = await runController(getSavedJobs, {
      user: { _id: 'user-1' }
    });

    expect(populate).toHaveBeenCalledWith({
      path: 'savedJobs',
      populate: {
        path: 'employer',
        select: 'name email companyName'
      }
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Saved jobs retrieved successfully',
      data: user.savedJobs
    });
    expect(next).not.toHaveBeenCalled();
  });
});
