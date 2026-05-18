const { validationResult } = require('express-validator');
const {
  registerValidator,
  resetPasswordValidator,
  forgotPasswordValidator
} = require('../validators/auth.validator');

const runValidation = async (validators, body) => {
  const req = { body };

  for (const validator of validators) {
    await validator.run(req);
  }

  return validationResult(req).array().map((error) => error.msg);
};

describe('auth validators', () => {
  it('rejects weak registration passwords', async () => {
    const errors = await runValidation(registerValidator, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'simple',
      role: 'jobseeker'
    });

    expect(errors).toContain('Password must be at least 8 characters');
    expect(errors).toContain('Password must include an uppercase letter');
    expect(errors).toContain('Password must include a number');
    expect(errors).toContain('Password must include a special character');
  });

  it('accepts strong registration passwords', async () => {
    const errors = await runValidation(registerValidator, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'StrongPass1!',
      role: 'employer'
    });

    expect(errors).toEqual([]);
  });

  it('applies the same password policy to resets', async () => {
    const errors = await runValidation(resetPasswordValidator, {
      password: 'NoNumber!'
    });

    expect(errors).toContain('Password must include a number');
  });

  it('validates forgot password email input', async () => {
    const errors = await runValidation(forgotPasswordValidator, {
      email: 'not-an-email'
    });

    expect(errors).toContain('Please provide a valid email');
  });
});
