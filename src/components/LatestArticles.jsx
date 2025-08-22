import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, User, ArrowRight } from 'lucide-react'

const LatestArticles = () => {
  const articles = [
    {
      id: 1,
      title: 'Çfarë është ndryshimi mes hiperpigmentimit dhe melazmës?',
      excerpt: 'Mësoni rreth ndryshimeve kryesore mes këtyre dy problemeve të lëkurës dhe si të zgjidhni trajtimin e duhur.',
      author: 'Dr. Sidra Imtiaz',
      date: '22 Korrik, 2025',
      image: '🔬',
      category: 'Dermatologji',
      readTime: '5 min lexim'
    },
    {
      id: 2,
      title: 'Si të përdorni maskën LED për terapinë me dritë',
      excerpt: 'Udhëzuesi i plotë për përdorimin e maskave LED dhe përfitimet që ato sjellin për lëkurën tuaj.',
      author: 'Ekipi i Nabis Farmaci',
      date: '17 Qershor, 2025',
      image: '💡',
      category: 'Teknologji',
      readTime: '7 min lexim'
    },
    {
      id: 3,
      title: 'Udhëzuesi përfundimtar për kujdesin e trupit',
      excerpt: 'Zbuloni sekretet e një rutine të përsosur për kujdesin e trupit që do t\'ju japë lëkurë të butë dhe të shëndetshme.',
      author: 'Ekipi i Nabis Farmaci',
      date: '5 Qershor, 2025',
      image: '🧴',
      category: 'Kujdes Trupi',
      readTime: '6 min lexim'
    },
    {
      id: 4,
      title: 'Gjithçka që duhet të dini rreth peptideve',
      excerpt: 'Përbërësit e fuqishëm që po revolucionojnë industrinë e kujdesit për lëkurën dhe si të përfitoni prej tyre.',
      author: 'Dr. Elena Chabo',
      date: '6 Shkurt, 2025',
      image: '🧬',
      category: 'Skincare',
      readTime: '8 min lexim'
    },
    {
      id: 5,
      title: 'Gjendja e lëkurës vs. shqetësimi i lëkurës',
      excerpt: 'Kuptoni ndryshimin mes gjendjeve dhe shqetësimeve të lëkurës për të zgjedhur trajtimin e duhur.',
      author: 'Tori Crowther',
      date: '20 Tetor, 2024',
      image: '📋',
      category: 'Edukative',
      readTime: '4 min lexim'
    },
    {
      id: 6,
      title: 'Vitaminat më të rëndësishme për shëndetin',
      excerpt: 'Zbuloni cilat vitaminë janë jetike për organizmin tuaj dhe si të siguroheni që po merrni sasinë e duhur.',
      author: 'Dr. Alban Hoxha',
      date: '15 Mars, 2025',
      image: '💊',
      category: 'Shëndet',
      readTime: '6 min lexim'
    }
  ]

  const ArticleCard = ({ article }) => (
    <article className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      {/* Article Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-6xl">{article.image}</div>
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-primary-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
            {article.category}
          </span>
        </div>

        {/* Read Time */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 text-gray-700 px-2 py-1 text-xs rounded-md">
            {article.readTime}
          </span>
        </div>
      </div>

      {/* Article Content */}
      <div className="p-6">
        {/* Meta Information */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
          <Link to={`/blog/${article.id}`} className="line-clamp-2">
            {article.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.excerpt}
        </p>

        {/* Read More */}
        <Link
          to={`/blog/${article.id}`}
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium group-hover:underline"
        >
          <span>Lexo më shumë</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </article>
  )

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Artikujt tanë më të Fundit
            </h2>
            <p className="text-lg text-gray-600">
              Këshilla profesionale dhe informacion i dobishëm për shëndetin dhe bukurinë tuaj
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden md:inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-600 hover:text-white transition-colors duration-300"
          >
            Lexo të Gjitha
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-300"
          >
            Lexo të Gjitha
          </Link>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-200">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Newsletter i Nabis Farmaci
            </h3>
            <p className="text-gray-600 mb-6">
              Bashkohuni me komunitetin e Nabis Farmaci dhe merrni këshilla për shëndetin dhe bukurinë direkt në email-in tuaj, plus 15% zbritje në blerjen e parë.
            </p>
            
            <form className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email-i juaj *"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 transition-colors duration-300 font-semibold"
              >
                Pajtohuni
              </button>
            </form>
            
            <p className="text-xs text-gray-500 mt-4">
              Duke u regjistruar, ju pranoni <Link to="/termat" className="text-primary-600 hover:underline">Termat & Kushtet</Link> dhe keni lexuar <Link to="/privatesia" className="text-primary-600 hover:underline">Politikën e Privatësisë</Link>. Mund të çregjistroheni në çdo kohë duke klikuar Çregjistrohu në fund të çdo email-i tonë.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LatestArticles
