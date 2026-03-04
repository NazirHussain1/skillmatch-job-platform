import { Link, useLocation } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';

function RegistrationSuccess() {
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <strong>{email}</strong>
          </p>
          
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 mb-1">Next Steps:</p>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the verification link</li>
                  <li>Start using SkillMatch!</li>
                </ol>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            The verification link will expire in 24 hours. If you don't see the email, check your spam folder.
          </p>

          <div className="space-y-3">
            <Link to="/resend-verification" className="btn-secondary w-full block">
              Resend Verification Email
            </Link>
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationSuccess;
