import React from 'react'
import { Award, Heart, Users, Target } from 'lucide-react'

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Rreth Nabis Farmaci</h1>
          <p className="text-xl text-primary-100">Partneri juaj i besuar për shëndet dhe mirëqenie</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Historia Jonë</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Nabis Farmaci është themeluar me një vizion të qartë: të ofrojmë produkte farmaceutike dhe dermokozmetike të cilësisë më të lartë për komunitetin shqiptar. Me vite përvojë në industrinë farmaceutike, ne kemi ndërtuar një reputacion të fortë si furnizuesi më i besueshëm i produkteve të kujdesit shëndetësor.
            </p>
            <p>
              Emri "Nabis" simbolizon angazhimin tonë për t'ju sjellë produktet më të mira nga markat më të njohura botërore. Ne punojmë vetëm me furnizues të certifikuar dhe garantojmë autenticitetin e çdo produkti që ofrojmë.
            </p>
            <p>
              Sot, Nabis Farmaci shërben mijëra klientë në të gjithë Shqipërinë, duke u ofruar atyre jo vetëm produkte cilësore, por edhe këshilla profesionale dhe shërbim të shkëlqyer ndaj klientit.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Award className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cilësi</h3>
            <p className="text-gray-600">Vetëm produkte të certifikuara nga markat më të mira botërore</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
              <Heart className="h-8 w-8 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Kujdes</h3>
            <p className="text-gray-600">Shëndeti dhe mirëqenia juaj janë prioriteti ynë numër një</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Profesionalizëm</h3>
            <p className="text-gray-600">Ekip i kualifikuar farmacistësh dhe konsulentësh</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
              <Target className="h-8 w-8 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Besueshmëri</h3>
            <p className="text-gray-600">Transparencë dhe etikë në çdo aspekt të biznesit tonë</p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Misioni Ynë</h2>
            <p className="text-gray-700 leading-relaxed">
              Të ofrojmë produkte farmaceutike dhe dermokozmetike të cilësisë së lartë, të aksesueshme për të gjithë, duke u mbështetur në integritet, profesionalizëm dhe përkushtim ndaj shëndetit të klientëve tanë. Ne synojmë të jemi farmacia e parë që ju vjen në mendje kur bëhet fjalë për shëndetin tuaj.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vizioni Ynë</h2>
            <p className="text-gray-700 leading-relaxed">
              Të bëhemi farmacia lider në Shqipëri, e njohur për cilësinë e produkteve, shërbimin e shkëlqyer dhe kontributin tonë në përmirësimin e shëndetit dhe mirëqenies së komunitetit. Ne aspirojmë të zgjerojmë gamën tonë të produkteve dhe shërbimeve për të përmbushur nevojat në ndryshim të klientëve tanë.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ekipi Ynë</h2>
          <p className="text-gray-700 mb-6">
            Nabis Farmaci drejtohet nga një ekip i përkushtuar profesionistësh të kujdesit shëndetësor, me Dr. Mahmoud Metwally si Farmacist Përgjegjës. Ekipi ynë përbëhet nga farmacistë të licencuar, konsulentë shëndetësorë dhe specialistë të shërbimit ndaj klientit, të gjithë të përkushtuar për të ju ofruar këshilla profesionale dhe shërbim të personalizuar.
          </p>
          <p className="text-gray-700">
            Çdo anëtar i ekipit tonë është i trajnuar vazhdimisht për të qenë i informuar me zhvillimet më të fundit në industrinë farmaceutike dhe për t'ju ofruar ju ekspertizën më të mirë.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
