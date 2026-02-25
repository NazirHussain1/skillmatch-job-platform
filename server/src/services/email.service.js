import nodemailer from 'nodemailer';
import config from '../config/env.config.js';
import logger from '../config/logger.config.js';

const transporter = nodemailer.createTransporter({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: config.email.auth,
});

// Verify connection
if (config.env !== 'test') {
  transporter.verify((error) => {
    if (error) {
      logger.warn('Email service not configured properly');
    } else {
      logger.info('Email service ready');
    }
  });
}

const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      from: config.email.from,
      to,
      subject,
      html,
    };
    await transporter.sendMail(msg);
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

export const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;
  const subject = 'Email Verification - SkillMatch';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email</h2>
      <p>Thank you for registering with SkillMatch!</p>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Verify Email
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

export const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
  const subject = 'Password Reset - SkillMatch';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>You requested to reset your password.</p>
      <p>Please click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Reset Password
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${resetUrl}</p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

export const send2FACode = async (to, code) => {
  const subject = 'Two-Factor Authentication Code - SkillMatch';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Two-Factor Authentication</h2>
      <p>Your verification code is:</p>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h1 style="margin: 0; font-size: 32px; letter-spacing: 8px; color: #4F46E5;">${code}</h1>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email and secure your account.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

export const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to SkillMatch!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to SkillMatch, ${name}!</h2>
      <p>Your email has been verified successfully.</p>
      <p>You can now start exploring opportunities and connecting with employers.</p>
      <a href="${config.frontendUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Go to Dashboard
      </a>
      <p>Thank you for joining us!</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

export default {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  send2FACode,
  sendWelcomeEmail,
};
