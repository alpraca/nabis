import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin, Clock } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const companyLinks = [
    { name: 'Rreth Nesh', href: '/rreth-nesh' },
    { name: 'Karriera', href: '/karriera' },
    { name: 'Kontakt', href: '/kontakt' },
    { name: 'Partnerët', href: '/partneret' },
    { name: 'Lajme dhe Media', href: '/lajme' }
  ]

  const helpLinks = [
    { name: 'Pyetje të Shpeshta', href: '/faq' },
    { name: 'Dërgimi dhe Kthimi', href: '/dergimi' },
    { name: 'Metoda të Pagesës', href: '/pagesa' },
    { name: 'Reklamime', href: '/reklamime' },
    { name: 'Garanci të Produkteve', href: '/garancia' },
    { name: 'Konsultime Online', href: '/konsultime' }
  ]

  const legalLinks = [
    { name: 'Termat dhe Kushtet', href: '/termat' },
    { name: 'Politika e Privatësisë', href: '/privatesia' },
    { name: 'Politika e Cookies', href: '/cookies' },
    { name: 'Shërbimi për Klientë', href: '/sherbimi-klienti' }
  ]

  const categories = [
    { name: 'Dermokozmetikë', href: '/kategori/dermokozmetike' },
    { name: 'Higjena', href: '/kategori/higjena' },
    { name: 'Farmaci', href: '/kategori/farmaci' },
    { name: 'Mama dhe Bebat', href: '/kategori/mama-bebat' },
    { name: 'Suplemente', href: '/kategori/suplemente' }
  ]

  return (
    <footer id="kontakt" className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <Link to="/" className="text-2xl font-bold text-white">
                Nabis <span className="text-primary-400">Farmaci</span>
              </Link>
              <p className="mt-4 text-gray-300">
                Farmacia juaj e besuar për produkte farmaceutike dhe dermokozmetike të cilësisë së lartë. Shëndeti juaj është prioriteti ynë.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300">+355 69 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300">info@nabisfarmaci.al</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300">Rruga e Durrësit, Tiranë</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300">Hënë - Premte: 08:00 - 20:00</span>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-3">Na Ndiqni</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Kategoritë</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-300"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Kompania</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Info */}
          <div>
            <h4 className="font-semibold mb-4">Ndihmë & Informacion</h4>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Awards and Certifications */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm text-gray-300">Farmaci e Certifikuar</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🚚</div>
              <div className="text-sm text-gray-300">Dërgesa e Shpejtë</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">💯</div>
              <div className="text-sm text-gray-300">Cilësi e Garantuar</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🔒</div>
              <div className="text-sm text-gray-300">Pagesa e Sigurt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            {/* Legal Info */}
            <div className="text-sm text-gray-400">
              <p className="mb-2">
                Farmacist Përgjegjës: Dr. Mahmoud Metwally. Nr. Regjistrimi: 2082818 | 
                Nr. Farmaci e Regjistruar: 9012474
              </p>
              <p>
                Nabis Farmaci Sh.p.k., Rruga e Durrësit, Tiranë, Shqipëri | 
                Nr. Regjistrimi të Kompanisë: 12535657
              </p>
            </div>

            {/* Legal Links */}
            <div className="mt-4 md:mt-0">
              <div className="flex flex-wrap space-x-6 text-sm">
                {legalLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400">
              © {currentYear} Nabis Farmaci. Të gjitha të drejtat e rezervuara.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
