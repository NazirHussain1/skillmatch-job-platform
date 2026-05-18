jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

jest.mock('../models/User.model', () => ({
  findById: jest.fn()
}));

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { optionalProtect } = require('../middleware/auth.middleware');

describe('optionalProtect middleware', () => {
  const next = jest.fn();
  const res = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('continues without a user when no bearer token is present', async () => {
    const req = { headers: {} };

    await optionalProtect(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('attaches the user when a valid bearer token is present', async () => {
    const user = { _id: 'user-1', role: 'employer' };
    const select = jest.fn().mockResolvedValue(user);
    jwt.verify.mockReturnValue({ id: 'user-1' });
    User.findById.mockReturnValue({ select });

    const req = {
      headers: {
        authorization: 'Bearer valid-token'
      }
    };

    await optionalProtect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
    expect(User.findById).toHaveBeenCalledWith('user-1');
    expect(select).toHaveBeenCalledWith('-password');
    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('continues as public traffic when the bearer token is invalid', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const req = {
      headers: {
        authorization: 'Bearer invalid-token'
      }
    };

    await optionalProtect(req, res, next);

    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
