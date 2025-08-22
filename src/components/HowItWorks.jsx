import React from 'react'
import { MessageCircle, ShoppingCart, Truck } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: <MessageCircle className="h-12 w-12 text-primary-600" />,
      title: 'Bisedoni me një Ekspert',
      description: 'Ekspertët tanë farmaceutë ofrojnë konsultime të detajuara për të kuptuar nevojat tuaja individuale për shëndetin.',
      details: 'Ne ofrojmë rekomandime të personalizuara dhe sigurojmë përdorimin e sigurt të produkteve farmaceutike (konsultim i kërkuar për disa produkte).',
      buttonText: 'Bisedoni me një Ekspert',
      buttonLink: '/kontakt'
    },
    {
      icon: <ShoppingCart className="h-12 w-12 text-secondary-600" />,
      title: 'Personalizoni Rutinën Tuaj',
      description: 'Dizajnuar vetëm për ju.',
      details: 'Ne krijojmë një plan të personalizuar që synon shqetësimet tuaja specifike. Jo më konfuzion – ekspertët tanë ndërtojnë një rutinë që është përshtatur saktësisht me nevojat tuaja.',
      buttonText: '',
      buttonLink: ''
    },
    {
      icon: <Truck className="h-12 w-12 text-accent-600" />,
      title: 'Merrni Produktet Tuaja',
      description: 'Vetëm disa klikime dhe porosia juaj është në rrugë!',
      details: 'Shijoni opsionet e shpejta si Dërgesa po Ditë ose Dërgesa Ditën e Ardhshme. Dërgesa falas aplikohet për porositë mbi 5000 lekë. Shihni detajet e plota në Politikën e Dërgimeve.',
      buttonText: '',
      buttonLink: ''
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Si Funksionon Nabis Farmaci
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Procesi ynë i thjeshtë në tre hapa për të siguruar që të merrni produktet më të mira për nevojat tuaja
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6 group-hover:bg-primary-50 transition-colors duration-300">
                <span className="text-xl font-bold text-gray-600 group-hover:text-primary-600">
                  {index + 1}
                </span>
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                {step.icon}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 font-medium">
                  {step.description}
                </p>
                
                <p className="text-sm text-gray-500">
                  {step.details}
                </p>

                {/* Button if available */}
                {step.buttonText && (
                  <div className="pt-4">
                    <a
                      href={step.buttonLink}
                      className="inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-600 hover:text-white transition-colors duration-300"
                    >
                      {step.buttonText}
                    </a>
                  </div>
                )}
              </div>

              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 left-1/2 w-full h-0.5 bg-gray-200 -z-10">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Gati të filloni?
            </h3>
            <p className="text-gray-600 mb-6">
              Bashkohuni me mijëra klientë të kënaqur që besojnë tek Nabis Farmaci
            </p>
            <a
              href="/kategori/farmaci"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-300 btn-hover"
            >
              Filloni Blerjen
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
