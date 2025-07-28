import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  api, 
  AcceptInvitationData, 
  AcceptInvitationSuccessResponse,
  validatePassword 
} from '../../apis';

interface AcceptInvitationProps {
  inviteToken: string;
}

const AcceptInvitation: React.FC<AcceptInvitationProps> = ({ inviteToken }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<AcceptInvitationData>({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);

  // Load invitation details on component mount
  useEffect(() => {
    const loadInvitation = async () => {
      try {
        const data = await api.invitations.getInvitationByToken(inviteToken);
        setInvitationData(data);
        // Pre-fill email if available
        if (data.email) {
          setFormData(prev => ({ ...prev, email: data.email }));
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (inviteToken) {
      loadInvitation();
    }
  }, [inviteToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Client-side password validation
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        setError(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
        setLoading(false);
        return;
      }

      // Accept the invitation
      const response: AcceptInvitationSuccessResponse = await api.invitations.acceptInvitation(
        inviteToken, 
        formData
      );

      setSuccess('Account created successfully! Redirecting to login...');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push(`/auth/login?email=${encodeURIComponent(formData.email)}&invitation=success`);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Loading invitation...</h2>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Accept Invitation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete your account setup
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="first_name" className="sr-only">
                First name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                value={formData.first_name}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="First name"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="sr-only">
                Last name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                value={formData.last_name}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Last name"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {/* Password requirements */}
          <div className="text-xs text-gray-600">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside ml-2">
              <li>At least 8 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one special character</li>
              <li>No common sequences</li>
            </ul>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Accepting invitation...' : 'Accept Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitation; 