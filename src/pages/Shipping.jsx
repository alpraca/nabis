import React from 'react'
import { Truck, Package, MapPin, Clock, CheckCircle, Phone } from 'lucide-react'

const Shipping = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dërgimi dhe Kthimi</h1>
          <p className="text-xl text-primary-100">Informacion i detajuar për dërgimin dhe kthimin e produkteve</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Shipping Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <Truck className="h-8 w-8 text-primary-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Dërgimi i Produkteve</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kohët e Dërgimit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary-600 mr-2 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Tiranë</h4>
                      <p className="text-gray-700">Dërgesa brenda 24 orëve</p>
                      <p className="text-sm text-gray-600 mt-1">Për porosite e bëra deri në orën 15:00</p>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-secondary-600 mr-2 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Qytete të Tjera</h4>
                      <p className="text-gray-700">Dërgesa brenda 2-3 ditëve</p>
                      <p className="text-sm text-gray-600 mt-1">Kohë pune, përjashtuar fundjavat</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kostot e Dërgimit</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-700">Porosi mbi 3,000 Lekë</span>
                    <span className="font-semibold text-green-600">FALAS</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-700">Tiranë (nën 3,000 Lekë)</span>
                    <span className="font-semibold text-gray-900">300 Lekë</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Qytete të tjera (nën 3,000 Lekë)</span>
                    <span className="font-semibold text-gray-900">400 Lekë</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Si Funksionon Dërgimi</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-3">
                    <Package className="h-8 w-8 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">1. Porositni</h4>
                  <p className="text-sm text-gray-600">Zgjidhni produktet dhe plotësoni të dhënat</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-3">
                    <CheckCircle className="h-8 w-8 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">2. Konfirmimi</h4>
                  <p className="text-sm text-gray-600">Do të merrni konfirmim me SMS/Email</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-3">
                    <Truck className="h-8 w-8 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">3. Dërgimi</h4>
                  <p className="text-sm text-gray-600">Produktet dërgohen në adresën tuaj</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-3">
                    <Clock className="h-8 w-8 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">4. Dorëzimi</h4>
                  <p className="text-sm text-gray-600">Paguani në dorëzim (Cash on Delivery)</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Shënim:</strong> Ju lutemi sigurohuni që adresa e dërgimit të jetë e saktë. Kontaktohuni me ne nëse keni pyetje rreth dërgimit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Returns Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <Package className="h-8 w-8 text-secondary-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Kthimi i Produkteve</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Politika e Kthimit</h3>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  Në Nabis Farmaci, ne jemi të përkushtuar për kënaqësinë tuaj. Nëse nuk jeni plotësisht të kënaqur me blerjen tuaj, mund të ktheni produktet brenda 14 ditëve nga data e blerjes.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kushtet për Kthim</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Produkti duhet të jetë i papërdorur dhe në ambalazh origjinal të mbyllur</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Të gjitha etiketat dhe vula të jenë të paprekura</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Fatura origjinale e blerjes të shoqërojë produktin</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Kthimi të bëhet brenda 14 ditëve nga data e blerjes</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Produkte që NUK Mund të Kthehen</h3>
              <div className="bg-red-50 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Produkte të hapura për arsye higjienike (përveç nëse janë të dëmtuara)</li>
                  <li>Produkte të personalizuara ose të porosisura posaçërisht</li>
                  <li>Produkte me recetë mjekësore</li>
                  <li>Produkte me datë skadence të afërt (nën 3 muaj)</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Si të Ktheni një Produkt</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  <li className="pl-2">
                    <strong>Kontaktoni ne:</strong> Telefononi në +355 69 123 4567 ose dërgoni email në info@nabisfarmaci.al
                  </li>
                  <li className="pl-2">
                    <strong>Merrni autorizimin:</strong> Do t'ju japim një numër autorizimi për kthimin
                  </li>
                  <li className="pl-2">
                    <strong>Paketoni produktin:</strong> Vendoseni në ambalazhin origjinal me faturën
                  </li>
                  <li className="pl-2">
                    <strong>Dërgoni produktin:</strong> Mund ta ktheni në adresën tonë ose ne mund ta marrim
                  </li>
                  <li className="pl-2">
                    <strong>Merrni rimbursimin:</strong> Pas verifikimit, rimbursimi bëhet brenda 7-10 ditëve
                  </li>
                </ol>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Phone className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Keni pyetje?</strong> Kontaktoni shërbimin tonë të klientit në +355 69 123 4567 ose info@nabisfarmaci.al
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shipping
