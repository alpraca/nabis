import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Key, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get token from URL params
  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token i rivendosjes mungon ose është i pavlefshëm');
    }
  }, [token]);

  const validatePassword = (pass) => {
    if (pass.length < 6) {
      return 'Fjalëkalimi duhet të jetë të paktën 6 karaktere';
    }
    if (!/(?=.*[a-z])/.test(pass)) {
      return 'Fjalëkalimi duhet të përmbajë të paktën një shkronjë të vogël';
    }
    if (!/(?=.*[A-Z])/.test(pass)) {
      return 'Fjalëkalimi duhet të përmbajë të paktën një shkronjë të madhe';
    }
    if (!/(?=.*\d)/.test(pass)) {
      return 'Fjalëkalimi duhet të përmbajë të paktën një numër';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Token i rivendosjes mungon');
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password
      });

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/hyrje');
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Gabim në rivendosjen e fjalëkalimit';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Fjalëkalimi u Rivendos!
          </h1>
          <p className="text-gray-600 mb-6">
            Fjalëkalimi juaj u rivendos me sukses. Tani mund të hyni me fjalëkalimin e ri.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Po ju ridrejtojmë në faqen e hyrjes...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/hyrje" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kthehu te Hyrja
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto pt-16 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="bg-primary-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
              <Key className="h-12 w-12 text-primary-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Rivendos Fjalëkalimin
            </h1>
            <p className="text-gray-600">
              Shkruani fjalëkalimin tuaj të ri më poshtë
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fjalëkalimi i Ri
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Shkruani fjalëkalimin e ri"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmo Fjalëkalimin
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Shkruani përsëri fjalëkalimin"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Kërkesat për fjalëkalimin:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className={`flex items-center ${password.length >= 6 ? 'text-green-600' : ''}`}>
                  <span className="mr-2">{password.length >= 6 ? '✓' : '•'}</span>
                  Të paktën 6 karaktere
                </li>
                <li className={`flex items-center ${/(?=.*[a-z])/.test(password) ? 'text-green-600' : ''}`}>
                  <span className="mr-2">{/(?=.*[a-z])/.test(password) ? '✓' : '•'}</span>
                  Një shkronjë e vogël
                </li>
                <li className={`flex items-center ${/(?=.*[A-Z])/.test(password) ? 'text-green-600' : ''}`}>
                  <span className="mr-2">{/(?=.*[A-Z])/.test(password) ? '✓' : '•'}</span>
                  Një shkronjë e madhe
                </li>
                <li className={`flex items-center ${/(?=.*\d)/.test(password) ? 'text-green-600' : ''}`}>
                  <span className="mr-2">{/(?=.*\d)/.test(password) ? '✓' : '•'}</span>
                  Një numër
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Po rivendos...' : 'Rivendos Fjalëkalimin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
