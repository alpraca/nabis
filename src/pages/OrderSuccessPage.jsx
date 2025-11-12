import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Truck, Mail, Phone, ArrowLeft, PackageOpen } from 'lucide-react';
import { formatPrice } from '../utils/currency';

const OrderSuccessPage = () => {
  const location = useLocation();
  const orderData = location.state;

  // Redirect if no order data
  if (!orderData) {
    return <Navigate to="/" replace />;
  }

  const { orderNumber, totalAmount } = orderData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Faleminderit për porosinë!
          </h1>
          <p className="text-lg text-gray-600">
            Porosia juaj është pranuar me sukses dhe do të përpunohet së shpejti.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 bg-primary-600">
            <h2 className="text-lg font-medium text-white">
              Detajet e Porosisë
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Numri i Porosisë</p>
                <p className="font-mono text-lg font-medium text-gray-900">
                  #{orderNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Totali i Paguar</p>
                <p className="text-lg font-medium text-primary-600">
                  {formatPrice(totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Çfarë ndodh më pas?
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    1. Konfirmimi me Email
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Do të merrni një email konfirmimi me detajet e porosisë dhe numrin e ndjekjes.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <PackageOpen className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    2. Përgatitja e Porosisë
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ekipi ynë do të përgatisë porosinë tuaj brenda 1-2 ditëve pune.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    3. Dërgesa dhe Dorëzimi
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Porosia do të dërgohet në adresën tuaj dhe do të paguani në dorëzim.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Keni pyetje?
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Telefon</p>
                  <p className="text-sm text-gray-600">+355 69 123 4567</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">info@nabisfarmaci.al</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Kontaktoni ne për çdo pyetje rreth porosisë suaj ose produkteve tona.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kthehu në Ballina
          </Link>
          <Link
            to="/produktet"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            Vazhdo Blerjen
          </Link>
        </div>

        {/* Order Tracking Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">i</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                Ndjekja e Porosisë
              </h3>
              <p className="text-sm text-blue-800 mt-1">
                Numri i porosisë <strong>#{orderNumber}</strong> mund të përdoret për të ndjekur statusin e dërgimit. 
                Do të njoftoheni me SMS dhe email kur porosia të jetë në rrugë.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
