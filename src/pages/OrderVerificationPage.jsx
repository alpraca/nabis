import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/currency';
import axios from 'axios';
import { API_URL } from '../config/api';

const OrderVerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  // Get order data from navigation state
  const orderData = location.state;

  // Redirect if no order data
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="h-16 w-16 text-red-500 mx-auto mb-6">
            ❌
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Gabim në Porosi
          </h1>
          <p className="text-gray-600 mb-6">
            Nuk u gjetën të dhënat e porosisë. Ju lutemi provoni përsëri.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
          >
            Kthehu në faqen kryesore
          </Link>
        </div>
      </div>
    );
  }

  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Ju lutemi shkruani kodin 6-shifror');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/orders/verify`, {
        email: orderData.email,
        code: verificationCode.trim()
      });

      if (response.data.success) {
        setIsVerified(true);
        // Clear cart only after successful verification
        clearCart();
        // Redirect to success page after 3 seconds
        setTimeout(() => {
          navigate('/order-success', { 
            state: { 
              orderNumber: orderData.orderNumber,
              totalAmount: orderData.totalAmount,
              verified: true
            }
          });
        }, 3000);
      }
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.error || 'Gabim në verifikim';
      
      setError(errorMessage);
      
      if (errorData?.orderCancelled) {
        setIsCancelled(true);
      } else if (errorData?.remainingAttempts !== undefined) {
        setRemainingAttempts(errorData.remainingAttempts);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="h-16 w-16 text-red-500 mx-auto mb-6">
            ❌
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Porosia u Anullua
          </h1>
          <p className="text-gray-600 mb-6">
            Porosia juaj #{orderData.orderNumber} u anullua për shkak të tentativave të shumta të gabuara për verifikim.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Nëse keni dhënë email ose telefon të gabuar, ju lutemi provoni të bëni një porosi të re me informacionet e sakta.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
          >
            Kthehu në faqen kryesore
          </Link>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Porosia u Verifikua!
          </h1>
          <p className="text-gray-600 mb-6">
            Faleminderit! Porosia juaj #{orderData.orderNumber} u verifikua me sukses.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Po ju ridrejtojmë...
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
            to="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kthehu në faqen kryesore
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto pt-16 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="bg-primary-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
              <Mail className="h-12 w-12 text-primary-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifikoni Porosinë
            </h1>
            <p className="text-gray-600">
              Kemi dërguar një kod verifikimi në email-in tuaj
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <p className="text-gray-600">Numri i porosisë:</p>
              <p className="font-semibold text-gray-900">#{orderData.orderNumber}</p>
            </div>
            <div className="text-sm mt-2">
              <p className="text-gray-600">Email-i:</p>
              <p className="font-semibold text-gray-900">{orderData.email}</p>
            </div>
            <div className="text-sm mt-2">
              <p className="text-gray-600">Totali:</p>
              <p className="font-semibold text-gray-900">{formatPrice(orderData.totalAmount)}</p>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerification}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kodi i verifikimit (6 shifra)
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only digits
                  if (value.length <= 6) {
                    setVerificationCode(value);
                  }
                }}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={6}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
              {!error && remainingAttempts < 3 && (
                <p className="mt-1 text-sm text-orange-600">
                  Ju keni {remainingAttempts} tentativa të tjera
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying || verificationCode.length !== 6}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? 'Po verifikohet...' : 'Verifiko Porosinë'}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Nuk e morët kodin? Kontrolloni folder-in e spam-it ose{' '}
              <button className="text-primary-600 hover:underline">
                riçakoni kodin
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderVerificationPage;
