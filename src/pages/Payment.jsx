import React from 'react'
import { CreditCard, Banknote, Shield, CheckCircle } from 'lucide-react'

const Payment = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Metoda të Pagesës</h1>
          <p className="text-xl text-primary-100">Pagesa e sigurt dhe e lehtë për ju</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Metodat e Pagesës</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cash on Delivery */}
            <div className="border-2 border-primary-200 rounded-lg p-6 bg-primary-50">
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-full mr-4">
                  <Banknote className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Cash në Dorëzim</h3>
                  <p className="text-sm text-green-600 font-medium">Aktive Tani</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Paguani me para cash kur produkti ju dorëzohet në shtëpi. Kjo është metoda më e sigurt dhe më e preferuar nga klientët tanë.
              </p>
              <div className="space-y-2">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Nuk kërkohen të dhëna bankare</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Paguani vetëm pasi të shihni produktin</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Merrni faturë fiskale menjëherë</span>
                </div>
              </div>
            </div>

            {/* Card Payment - Coming Soon */}
            <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 opacity-75">
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-400 rounded-full mr-4">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Kartë Krediti/Debiti</h3>
                  <p className="text-sm text-orange-600 font-medium">Së Shpejti</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Së shpejti do të mund të paguani me kartë krediti ose debiti (Visa, Mastercard, American Express) në mënyrë të sigurt online.
              </p>
              <div className="space-y-2">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Pagesa e menjëhershme dhe e sigurt</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Enkriptim SSL 256-bit</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Mbrojtje 3D Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-primary-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Siguria e Pagesës</h2>
          </div>

          <div className="space-y-6">
            <p className="text-gray-700 text-lg">
              Në Nabis Farmaci, siguria e transaksioneve tuaja është prioriteti ynë kryesor. Ne përdorim teknologjitë më të fundit për të mbrojtur të dhënat tuaja.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Enkriptim SSL</h3>
                <p className="text-sm text-gray-700">Të gjitha të dhënat enkriptohen me SSL 256-bit</p>
              </div>

              <div className="text-center p-6 bg-secondary-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-secondary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Verifikim i Sigurt</h3>
                <p className="text-sm text-gray-700">Sistem verifikimi me dy faktorë për kartën</p>
              </div>

              <div className="text-center p-6 bg-primary-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Mbrojtje e Të Dhënave</h3>
                <p className="text-sm text-gray-700">Nuk ruajmë të dhënat e kartës suaj</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Pyetje të Shpeshta</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">A është e sigurt pagesa në faqen tuaj?</h3>
              <p className="text-gray-700">
                Po, absolutisht. Aktualisht pranojmë vetëm pagesë cash në dorëzim, që është metoda më e sigurt. Kur të implementojmë pagesën me kartë, do të përdorim enkriptimin më të fundit dhe sisteme të verifikuara nga industria.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Çfarë duhet të bëj nëse nuk kam para cash?</h3>
              <p className="text-gray-700">
                Ju lutemi na kontaktoni paraprakisht dhe mund të organizojmë një zgjidhje alternative. Së shpejti do të ofrojmë edhe pagesë me kartë.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">A marr faturë për blerjen time?</h3>
              <p className="text-gray-700">
                Po, çdo blerje shoqërohet me faturë fiskale të rregullt që dorëzohet së bashku me produktet.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">A mund të paguaj me këste?</h3>
              <p className="text-gray-700">
                Aktualisht nuk ofrojmë pagesë me këste, por jemi duke punuar për të shtuar këtë opsion në të ardhmen për blerje mbi një shumë të caktuar.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Çfarë ndodh nëse refuzoj pranimin e porosisë?</h3>
              <p className="text-gray-700">
                Nëse refuzoni pranimin pa një arsye të vlefshme, kostoja e transportit mund t'ju ngarkohet në porosinë tuaj të ardhshme. Ju lutemi na kontaktoni nëse keni arsye për të anulluar porosinë.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
