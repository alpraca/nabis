import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      category: 'Porosia dhe Dërgesa',
      questions: [
        {
          question: 'Si mund të bëj një porosi?',
          answer: 'Mund të bëni një porosi duke shfletuar produktet në faqen tonë, duke i shtuar ato në shportë dhe duke ndjekur procesin e checkout. Gjithashtu mund të na kontaktoni drejtpërdrejt në telefon ose WhatsApp për ndihmë me porosinë tuaj.'
        },
        {
          question: 'Sa zgjat dërgesa?',
          answer: 'Dërgesa brenda Tiranës bëhet brenda 24 orëve. Për qytetet e tjera, dërgesa merr 2-3 ditë pune. Ju do të njoftoheni me SMS kur produktet të jenë në rrugë.'
        },
        {
          question: 'Sa kushton dërgesa?',
          answer: 'Dërgesa është falas për porosi mbi 3000 Lekë. Për porosi nën këtë shumë, kostoja e dërgimit është 300 Lekë për Tiranën dhe 400 Lekë për qytetet e tjera.'
        },
        {
          question: 'Mund të ndryshoj adresen e dërgimit pas bërjes së porosisë?',
          answer: 'Po, mund ta ndryshoni adresën deri sa produkti të mos jetë dërguar nga magazina jonë. Ju lutemi na kontaktoni sa më shpejt të jetë e mundur për të bërë ndryshimin.'
        }
      ]
    },
    {
      category: 'Pagesa',
      questions: [
        {
          question: 'Cilat metoda pagese pranoni?',
          answer: 'Pranojmë pagesë cash në dorëzim (Cash on Delivery). Së shpejti do të ofrojmë edhe pagesë me kartë krediti/debiti dhe transfertë bankare.'
        },
        {
          question: 'A është e sigurt pagesa në faqen tuaj?',
          answer: 'Po, absolutisht. Të gjitha transaksionet kryhen në mënyrë të sigurt. Për momentin, pagesa bëhet vetëm në dorëzim (cash), që është metoda më e sigurt.'
        },
        {
          question: 'Marr faturë për blerjen time?',
          answer: 'Po, çdo blerje shoqërohet me faturë fiskale të rregullt. Fatura dorëzohet së bashku me produktet.'
        }
      ]
    },
    {
      category: 'Produktet',
      questions: [
        {
          question: 'A janë të gjitha produktet origjinale?',
          answer: 'Po, të gjitha produktet që ofrojmë janë 100% origjinale dhe importohen drejtpërdrejt nga furnizues të autorizuar. Çdo produkt ka certifikatën përkatëse të autenticitetit.'
        },
        {
          question: 'Si mund të verifikoj origjinalitetin e produktit?',
          answer: 'Çdo produkt vjen me ambalazh origjinal të mbyllur dhe me etiketën e prodhuesit. Mund të verifikoni kodin e barkod në faqen e prodhuesit. Në rast dyshimi, na kontaktoni dhe ne do t\'ju ndihmojmë.'
        },
        {
          question: 'Çfarë bëj nëse produkti nuk më përshtatet?',
          answer: 'Nëse një produkt shkakton reaksion alergjik ose nuk përputhet me pritjet tuaja, na kontaktoni brenda 14 ditëve. Do të shqyrtojmë rastin dhe do të ofrojmë zëvendësim ose rimbursim sipas politikës sonë.'
        },
        {
          question: 'A mund të marr këshilla për zgjedhjen e produkteve?',
          answer: 'Po, ekipi ynë i farmacistëve është gati t\'ju ndihmojë. Mund të na kontaktoni në telefon, email ose përmes chat-it në faqe për konsultime falas.'
        }
      ]
    },
    {
      category: 'Kthimi dhe Rimbursimi',
      questions: [
        {
          question: 'Si funksionon politika e kthimit?',
          answer: 'Mund të ktheni produktet e papërdorura dhe në ambalazh origjinal brenda 14 ditëve nga data e blerjes. Produktet e hapura nuk mund të kthehen për arsye higjienike, përveç nëse janë të dëmtuara ose të gabuara.'
        },
        {
          question: 'Sa zgjat procesi i rimbursimit?',
          answer: 'Pasi të kemi pranuar dhe verifikuar produktin e kthyer, rimbursimi do të bëhet brenda 7-10 ditëve pune. Ju do të njoftoheni me email kur rimbursimi të jetë procesuar.'
        },
        {
          question: 'Kush e paguan koston e kthimit?',
          answer: 'Nëse produkti është i dëmtuar ose i gabuar nga ana jonë, ne e mbulojmë koston e kthimit. Në raste të tjera, kostoja e kthimit mbulohet nga klienti.'
        }
      ]
    },
    {
      category: 'Llogaria dhe Privatësia',
      questions: [
        {
          question: 'A duhet të krijoj llogari për të blerë?',
          answer: 'Jo, mund të blini edhe pa krijuar llogari. Megjithatë, krijimi i një llogarie ju lejon të gjurmoni porosinë, të shihni historikun e blerjeve dhe të merrni oferta ekskluzive.'
        },
        {
          question: 'Si janë të mbrojtura të dhënat e mia personale?',
          answer: 'Të dhënat tuaja mbrohen me teknologjinë më të fundit të enkriptimit. Ne nuk i ndajmë të dhënat tuaja me palë të treta dhe respektojmë plotësisht ligjin për mbrojtjen e të dhënave.'
        },
        {
          question: 'Si mund të fshij llogarinë time?',
          answer: 'Për të fshirë llogarinë, na dërgoni një kërkesë në info@nabisfarmaci.al. Do të procesohet brenda 7 ditëve pune.'
        }
      ]
    },
    {
      category: 'Të Tjera',
      questions: [
        {
          question: 'Ofroni konsultime online?',
          answer: 'Po, farmacistët tanë ofrojnë konsultime falas online. Mund të na kontaktoni përmes telefonit, email-it ose chat-it në faqe gjatë orarit të punës.'
        },
        {
          question: 'A mund të rezervoj produkte?',
          answer: 'Po, nëse një produkt nuk është në stok, mund ta rezervoni dhe do t\'ju njoftojmë kur të jetë i disponueshëm përsëri.'
        },
        {
          question: 'Ofroni shërbime të abonimit?',
          answer: 'Aktualisht nuk ofrojmë abonime, por jemi duke punuar për të shtuar këtë shërbim së shpejti për produktet që përdoren rregullisht.'
        }
      ]
    }
  ]

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pyetje të Shpeshta (FAQ)</h1>
          <p className="text-xl text-primary-100">Gjeni përgjigjet për pyetjet më të zakonshme</p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
                <h2 className="text-2xl font-bold text-primary-900">{category.category}</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {category.questions.map((item, questionIndex) => {
                  const index = `${categoryIndex}-${questionIndex}`
                  const isOpen = openIndex === index
                  return (
                    <div key={questionIndex} className="p-6">
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="flex justify-between items-start w-full text-left"
                      >
                        <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-primary-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <p className="mt-3 text-gray-700 leading-relaxed">{item.answer}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-primary-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuk gjetët përgjigjen?</h3>
          <p className="text-gray-700 mb-6">
            Ekipi ynë është gati t'ju ndihmojë. Na kontaktoni dhe do t'ju përgjigjemi sa më shpejt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+355691234567"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Na Telefononi
            </a>
            <a
              href="mailto:info@nabisfarmaci.al"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Dërgoni Email
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ
