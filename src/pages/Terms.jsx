import React from 'react'
import { FileText, ShoppingCart, CreditCard, Package, AlertCircle } from 'lucide-react'

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Termat dhe Kushtet</h1>
          <p className="text-xl text-primary-100">Rregullat për përdorimin e faqes sonë</p>
          <p className="text-sm text-primary-100 mt-2">Përditësuar më: 15 Nëntor 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* Introduction */}
          <div>
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Hyrje</h2>
            </div>
            <p className="text-gray-700">
              Mirë se vini në Nabis Farmaci (www.nabisfarmaci.al). Duke përdorur faqen tonë, ju pranoni të ndiqni këto terma dhe kushte. Ju lutemi lexoni me kujdes përpara se të përdorni shërbimet tona.
            </p>
          </div>

          {/* General Terms */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Kushte të Përgjithshme</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1.1. Nabis Farmaci Sh.p.k. ("ne", "na", ose "Kompania") operon faqen www.nabisfarmaci.al dhe ofron produkte farmaceutike dhe dermokozmetike.
              </p>
              <p>
                1.2. Duke përdorur këtë faqe, ju konfirmoni që jeni të paktën 18 vjeç ose keni pëlqimin e prindit/kujdestarit.
              </p>
              <p>
                1.3. Ne rezervojmë të drejtën të ndryshojmë, modifikojmë ose heqim çdo pjesë të faqes pa njoftim paraprak.
              </p>
              <p>
                1.4. Të gjitha çmimet janë në Lekë (ALL) dhe përfshijnë TVSH-në përveç nëse specifikohet ndryshe.
              </p>
            </div>
          </div>

          {/* Orders and Purchases */}
          <div>
            <div className="flex items-center mb-4">
              <ShoppingCart className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">2. Porosite dhe Blerjet</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                2.1. Duke bërë një porosi, ju bëni një ofertë për të blerë produkte. Të gjitha porosite i nënshtrohen pranim dhe disponibilitet.
              </p>
              <p>
                2.2. Ne rezervojmë të drejtën të refuzojmë ose anullojmë çdo porosi për arsye të ndryshme, duke përfshirë disponibilitetin e produktit, gabime në çmime, ose shkelje të këtyre termave.
              </p>
              <p>
                2.3. Pas pranimit të porosisë, ju do të merrni një konfirmim në email ose SMS.
              </p>
              <p>
                2.4. Çmimet mund të ndryshojnë pa njoftim. Çmimi që vlen është ai në momentin e konfirmimit të porosisë.
              </p>
              <p>
                2.5. Ne nuk jemi përgjegjës për gabime tipografike ose tekn ike në përshkrimin e produkteve.
              </p>
            </div>
          </div>

          {/* Payment */}
          <div>
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">3. Pagesa</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                3.1. Aktualisht pranojmë vetëm pagesë cash në dorëzim (Cash on Delivery).
              </p>
              <p>
                3.2. Pagesa duhet të bëhet në momentin e dorëzimit të produkteve.
              </p>
              <p>
                3.3. Në rast refuzimi të pagesës, produktet nuk do të dorëzohen dhe kostoja e transportit mund t'ju ngarkohet.
              </p>
              <p>
                3.4. Fatura fiskale do të dorëzohet së bashku me produktet.
              </p>
            </div>
          </div>

          {/* Delivery */}
          <div>
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">4. Dërgimi</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                4.1. Dërgimi brenda Tiranës: 24 orë. Qytete të tjera: 2-3 ditë pune.
              </p>
              <p>
                4.2. Kostoja e dërgimit: Falas për porosi mbi 5,000 Lekë. Nën këtë shumë: 300 Lekë (Tiranë), 500 Lekë (qytete të tjera).
              </p>
              <p>
                4.3. Ju duhet të jeni i disponueshëm në adresën e specifikuar gjatë orarit të dërgimit.
              </p>
              <p>
                4.4. Ne nuk jemi përgjegjës për vonesa të shkaktuara nga faktorë jashtë kontrollit tonë (mot i keq, probleme transporti, etj.).
              </p>
              <p>
                4.5. Nëse nuk jeni i disponueshëm, do të bëjmë përpjekje të tjera kontakti. Pas 3 përpjekjeve të dështuara, porosia mund të anulohet.
              </p>
            </div>
          </div>

          {/* Returns */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Kthimi dhe Rimbursimi</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                5.1. Mund të ktheni produktet e papërdorura në ambalazh origjinal brenda 14 ditëve.
              </p>
              <p>
                5.2. Produktet e hapura nuk kthehen për arsye higjienike, përveç nëse janë defekte ose të dëmtuara.
              </p>
              <p>
                5.3. Rimbursimi bëhet brenda 7-10 ditëve pune pas pranimit të produktit të kthyer.
              </p>
              <p>
                5.4. Kostoja e kthimit mbulohet nga klienti, përveç rasteve kur produkti është defekt ose i gabuar.
              </p>
              <p>
                5.5. Produktet me recetë mjekësore nuk mund të kthehen.
              </p>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Informacioni i Produkteve</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                6.1. Të gjitha produktet janë origjinale dhe importohen nga furnizues të autorizuar.
              </p>
              <p>
                6.2. Përshkrimet e produkteve janë sa më të sakta të jetë e mundur, por mund të ketë gabime të vogla.
              </p>
              <p>
                6.3. Ngjyrat e produkteve mund të ndryshojnë pak nga ato në foto për shkak të ekraneve të ndryshme.
              </p>
              <p>
                6.4. Është përgjegjësia juaj të lexoni etiketat dhe udhëzimet para përdorimit.
              </p>
            </div>
          </div>

          {/* Liability */}
          <div>
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">7. Përgjegjësia</h2>
            </div>
            <div className="bg-orange-50 rounded-lg p-6 space-y-3 text-gray-700">
              <p>
                7.1. Ne nuk jemi përgjegjës për dëme të shkaktuara nga përdorimi i gabuar i produkteve.
              </p>
              <p>
                7.2. Konsultohuni me mjek ose farmacist para përdorimit të produkteve mjekësore.
              </p>
              <p>
                7.3. Ne nuk garantojmë që faqja do të jetë e disponueshme vazhdimisht pa ndërprerje.
              </p>
              <p>
                7.4. Përgjegjësia jonë e përgjithshme ndaj jush, për çdo shkak, është e kufizuar në vlerën e porosisë suaj.
              </p>
            </div>
          </div>

          {/* Intellectual Property */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Pronësia Intelektuale</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                8.1. Të gjitha të drejtat e pronësisë intelektuale në faqe (dizajn, logo, tekst, foto) janë pronë e Nabis Farmaci.
              </p>
              <p>
                8.2. Ju nuk mund t'i përdorni, kopjoni ose shpërndani këto materiale pa lejen tonë me shkrim.
              </p>
              <p>
                8.3. Emrat dhe logot e markave të produkteve janë pronë e prodhuesve përkatës.
              </p>
            </div>
          </div>

          {/* Privacy */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privatësia</h2>
            <p className="text-gray-700">
              Përdorimi i të dhënave tuaja personale rregullohet nga Politika jonë e Privatësisë. Duke përdorur faqen, ju pranoni mbledhjen dhe përdorimin e të dhënave sipas asaj politike.
            </p>
          </div>

          {/* Governing Law */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Ligji Përkatës</h2>
            <p className="text-gray-700">
              Këta terma dhe kushte rregullohen nga ligjet e Republikës së Shqipërisë. Çdo mosmarrëveshje do të zgjidhet në gjykatat kompetente të Tiranës.
            </p>
          </div>

          {/* Contact */}
          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kontakti</h2>
            <p className="text-gray-700 mb-4">
              Për pyetje rreth këtyre termave dhe kushteve, na kontaktoni:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Nabis Farmaci Sh.p.k.</strong></p>
              <p>Rruga e Durrësit, Tiranë, Shqipëri</p>
              <p>Email: info@nabisfarmaci.al</p>
              <p>Tel: +355 69 123 4567</p>
              <p>Nr. Regjistrimi: 12535657</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms
