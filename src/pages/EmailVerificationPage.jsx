import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token i verifikimit mungon ose është i pavlefshëm.');
      return;
    }

    verifyEmail();
  }, [verifyEmail, token]);

  const verifyEmail = useCallback(async () => {
    try {
      setStatus('loading');
      const response = await axios.post('http://localhost:3001/api/auth/verify-email', {
        token
      });

      setStatus('success');
      setMessage('Email-i juaj është verifikuar me sukses! Tani mund të hyni në llogarinë tuaj.');
      
      // Store the login token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(
        error.response?.data?.error || 
        'Gabim në verifikimin e email-it. Token-i mund të jetë i skaduar ose i pavlefshëm.'
      );
    }
  }, [token]);

  const resendVerification = async () => {
    setIsResending(true);
    try {
      // This would need the user's email - for simplicity, we'll just show a message
      setMessage('Për të rinisur verifikimin, ju lutemi regjistrohuni përsëri ose kontaktoni mbështetjen.');
    } catch {
      setMessage('Gabim në dërgimin e email-it të verifikimit.');
    } finally {
      setIsResending(false);
    }
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8">
            {/* Status Icon */}
            <div className="text-center mb-6">
              {status === 'loading' && (
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}
              
              {status === 'success' && (
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
              
              {status === 'error' && (
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              )}

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {status === 'loading' && 'Duke verifikuar email-in...'}
                {status === 'success' && 'Email i verifikuar!'}
                {status === 'error' && 'Gabim në verifikim'}
              </h1>
            </div>

            {/* Message */}
            <div className="text-center mb-6">
              <p className={`text-sm ${
                status === 'success' ? 'text-green-700' : 
                status === 'error' ? 'text-red-700' : 
                'text-gray-600'
              }`}>
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {status === 'success' && (
                <>
                  <Link
                    to="/hyrje"
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-center block"
                  >
                    Hyr në Llogari
                  </Link>
                  <Link
                    to="/"
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-center block"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-2" />
                    Kthehu në Ballina
                  </Link>
                </>
              )}

              {status === 'error' && (
                <>
                  <button
                    onClick={verifyEmail}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  >
                    Provo Përsëri
                  </button>
                  <button
                    onClick={resendVerification}
                    disabled={isResending}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Duke dërguar...
                      </div>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 inline mr-2" />
                        Dërgo Përsëri
                      </>
                    )}
                  </button>
                  <Link
                    to="/"
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-center block"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-2" />
                    Kthehu në Ballina
                  </Link>
                </>
              )}

              {status === 'loading' && (
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Ju lutemi prisni ndërsa verifikojmë email-in tuaj...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Keni nevojë për ndihmë?
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Nëse keni probleme me verifikimin e email-it, kontaktoni mbështetjen tonë.
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <span>📞 +355 69 123 4567</span>
                <span>✉️ info@nabisfarmaci.al</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {status === 'success' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">
                  Përfunduar!
                </h3>
                <p className="text-sm text-blue-800 mt-1">
                  Llogaria juaj është aktivizuar dhe mund të filloni të blini produkte nga farmacia jonë online.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
