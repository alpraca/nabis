import React from 'react'
import { Shield, Lock, Eye, UserCheck, Mail, Phone } from 'lucide-react'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Politika e Privatësisë</h1>
          <p className="text-xl text-primary-100">Mbrojtja e të dhënave tuaja personale</p>
          <p className="text-sm text-primary-100 mt-2">Përditësuar më: 15 Nëntor 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* Introduction */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hyrje</h2>
            <p className="text-gray-700">
              Nabis Farmaci Sh.p.k. ("ne", "na", ose "Nabis Farmaci") respekton privatësinë tuaj dhe është e përkushtuar për të mbrojtur të dhënat tuaja personale. Kjo politikë e privatësisë do t'ju informojë se si ne trajtojmë të dhënat tuaja personale kur vizitoni faqen tonë www.nabisfarmaci.al dhe do t'ju tregojë për të drejtat tuaja të privatësisë.
            </p>
          </div>

          {/* Data Collection */}
          <div>
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Çfarë të dhënash mbledhim?</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Të dhëna të identitetit</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Emër dhe mbiemër</li>
                  <li>Adresë emaili</li>
                  <li>Numër telefoni</li>
                  <li>Adresë fizike (për dërgim)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Të dhëna të transaksionit</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Historiku i blerjeve</li>
                  <li>Produktet e porositura</li>
                  <li>Shuma e pagesës</li>
                  <li>Data e porosisë</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Të dhëna teknike</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Adresa IP</li>
                  <li>Lloji i shfletuesit</li>
                  <li>Cookies dhe teknologji të ngjashme</li>
                  <li>Të dhëna të përdorimit të faqes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Data */}
          <div>
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Si i përdorim të dhënat tuaja?</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-700">Për të procesuar dhe dërguar porositë tuaja</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-700">Për të komunikuar me ju rreth porosive dhe shërbimeve</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-700">Për të përmirësuar faqen dhe shërbimet tona</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-700">Për të ju dërguar njoftimet e rëndësishme dhe oferta (nëse keni dhënë pëlqimin)</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-700">Për të analizuar dhe parandaluar aktivitete të paligjshme</p>
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div>
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Si i mbrojmë të dhënat tuaja?</h2>
            </div>
            <div className="bg-primary-50 rounded-lg p-6 space-y-3">
              <p className="text-gray-700">
                Ne kemi implementuar masa të përshtatshme sigurie për të parandaluar humbjen, keqpërdorimin ose ndryshimin e pautorizuar të të dhënave tuaja personale:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Enkriptim SSL për të gjitha transaksionet</li>
                <li>Ruajtje e sigurt në serverë të mbrojtur</li>
                <li>Akses i kufizuar vetëm për personelin e autorizuar</li>
                <li>Auditim i rregullt i sistemeve tona</li>
                <li>Kopje rezervë të rregullta të të dhënave</li>
              </ul>
            </div>
          </div>

          {/* Data Sharing */}
          <div>
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Ndarja e të dhënave</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Ne NUK i shesim, shkëmbejmë ose transferojmë të dhënat tuaja personale palëve të treta pa pëlqimin tuaj, përveç rasteve të mëposhtme:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Kompani transporti për dërgimin e porosive (vetëm emri dhe adresa)</li>
              <li>Procesorë pagesash (nëse përdorni pagesë me kartë)</li>
              <li>Autoritete ligjore (nëse kërkohet me ligj)</li>
              <li>Partnerë të besuar që na ndihmojnë të operojmë faqen (me marrëveshje konfidencialiteti)</li>
            </ul>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Të drejtat tuaja</h2>
            <p className="text-gray-700 mb-4">Ju keni të drejtë të:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Akses</h3>
                <p className="text-sm text-gray-700">Të kërkoni kopje të të dhënave tuaja personale</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Korrigjim</h3>
                <p className="text-sm text-gray-700">Të kërkoni korrigjimin e të dhënave të pasakta</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Fshirje</h3>
                <p className="text-sm text-gray-700">Të kërkoni fshirjen e të dhënave tuaja</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Kufizim</h3>
                <p className="text-sm text-gray-700">Të kërkoni kufizimin e përdorimit të të dhënave</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Portabilitet</h3>
                <p className="text-sm text-gray-700">Të merrni të dhënat në një format të lexueshëm</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Tërheqje pëlqimi</h3>
                <p className="text-sm text-gray-700">Të tërhiqni pëlqimin për përpunimin e të dhënave</p>
              </div>
            </div>
          </div>

          {/* Cookies */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
            <p className="text-gray-700 mb-4">
              Faqja jonë përdor cookies për të përmirësuar përvojën tuaj. Cookies janë skedarë të vegjël që ruhen në kompjuterin tuaj dhe na ndihmojnë të:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mbajmë mend preferencat tuaja</li>
              <li>Analizojmë përdorimin e faqes</li>
              <li>Personalizojmë përmbajtjen</li>
              <li>Sigurojmë funksionimin e duhur të faqes</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Ju mund të refuzoni cookies përmes shfletuesit tuaj, por kjo mund të ndikojë në funksionalitetin e faqes.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-primary-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Kontaktoni ne</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Nëse keni pyetje rreth kësaj politike të privatësisë ose dëshironi të ushtroni të drejtat tuaja, na kontaktoni:
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary-600 mr-3" />
                <span className="text-gray-700">info@nabisfarmaci.al</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary-600 mr-3" />
                <span className="text-gray-700">+355 69 123 4567</span>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ndryshime në Politikën e Privatësisë</h2>
            <p className="text-gray-700">
              Ne rezervojmë të drejtën të përditësojmë këtë politikë privatësie në çdo kohë. Çdo ndryshim do të publikohet në këtë faqe me datën e përditësimit. Ju inkurajojmë të shqyrtoni periodikisht këtë politikë për t'u mbajtur të informuar rreth mënyrës se si ne mbrojmë të dhënat tuaja.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Privacy
