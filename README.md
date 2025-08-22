# Nabis Farmaci - Pharmacy E-commerce Website

A modern pharmacy e-commerce website built with React, Vite, and Tailwind CSS. This project mirrors the design and functionality # Nabis Farmaci - Pharmacy E-commerce Website

A complete pharmacy e-commerce platform built with React and Node.js, featuring Albanian localization and comprehensive admin management.

## 🚀 Features

- **Modern React Frontend** - Built with Vite, Tailwind CSS
- **Full E-commerce Functionality** - Product catalog, shopping cart, checkout
- **Admin Panel** - Complete product, order, and user management
- **Authentication System** - User registration, login, email verification
- **Albanian Localization** - Full Albanian language support
- **Mobile Responsive** - Works perfectly on all devices
- **Database Integration** - SQLite for reliable data storage

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, SQLite
- **Authentication**: JWT tokens, bcrypt
- **File Upload**: Multer for product images
- **Email**: Nodemailer for notifications

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd pharma
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `server` directory:
   ```env
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   PORT=3001
   ```

4. **Start the backend server**
   ```bash
   cd server
   node server.cjs
   ```

5. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```

## 🌐 Usage

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### Admin Access
- **Email**: admin@nabisfarmaci.al
- **Password**: admin123

## 📁 Project Structure

```
pharma/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── context/           # React contexts
│   └── config/            # Configuration files
├── server/                # Backend API
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   └── uploads/           # File uploads
└── public/                # Static assets
```

## 🔧 API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `GET /api/brands` - Get all brands
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/orders/admin/all` - Get all orders (admin)
- `POST /api/cart` - Add to cart

## 🎨 Brand Guidelines

- **Name**: Nabis Farmaci
- **Colors**: Teal (#77BAB9), Green (#22c55e), Yellow (#eab308)
- **Font**: Inter
- **Language**: Albanian

## 📱 Features Overview

### Customer Features
- Browse product catalog
- Search and filter products
- Shopping cart management
- Secure checkout process
- Order tracking
- User account management

### Admin Features
- Product management (CRUD)
- Order management
- User management
- Brand management
- Settings configuration
- Analytics dashboard

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- File upload restrictions

## 🚀 Deployment

The application is ready for deployment on platforms like:
- Vercel (frontend)
- Railway/Heroku (backend)
- DigitalOcean
- AWS

## 📞 Support

For support or questions, contact the development team.

---

**Built with ❤️ for Albanian pharmacy market**npharmacy.com while featuring Albanian localization and custom category structure.

## 🏥 Features

- **Exact Design Mirror**: Replicates the layout, styling, and user experience of skinpharmacy.com
- **Albanian Localization**: Complete Albanian language support
- **Custom Categories**: Specialized pharmacy product categories in Albanian
- **Responsive Design**: Mobile-first approach with perfect mobile responsiveness
- **User Authentication**: Login and registration system
- **Shopping Cart**: Complete cart and checkout functionality
- **Cash on Delivery**: Payment method tailored for Albanian market
- **Email Verification**: Order confirmation via email
- **Admin Panel**: Content management system
- **SEO Optimized**: Meta tags and proper structure for search engines

## 🛍️ Product Categories

1. **Dermokozmetikë** (Dermocosmetics)
   - Fytyre (Face)
   - Flokët (Hair)
   - Trupi (Body)
   - SPF
   - Tanning
   - Makeup

2. **Higjena** (Hygiene)
   - Depilim dhe Intime
   - Goja (Oral)
   - Këmbët (Feet)
   - Trupi (Body)

3. **Farmaci** (Pharmacy)
   - OTC (pa recetë)
   - Mirëqenia seksuale
   - Aparat mjekësore
   - First aid (ndihmë e parë)
   - Ortopedike

4. **Mama dhe Bebat** (Mom & Baby)
   - Kujdesi ndaj nënës
   - Kujdesi ndaj bebit
   - Aksesorë për beba
   - Planifikim familjar

5. **Produkte Shtesë** (Additional Products)
   - Sete
   - Vajra esencial

6. **Suplemente** (Supplements)

## 🎨 Brand Identity

- **Name**: Nabis Farmaci
- **Colors**: Teal (#77BAB9), Green (#22c55e), Yellow accent (#eab308)
- **Font**: Inter
- **Language**: Albanian

## 🚀 Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Database**: SQLite (planned)
- **Authentication**: JWT (planned)
- **HTTP Client**: Axios

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nabis-farmaci.git
cd nabis-farmaci
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AdminBanner.jsx
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── HowItWorks.jsx
│   ├── BestSellers.jsx
│   ├── ShopByBrand.jsx
│   ├── LatestArticles.jsx
│   └── Footer.jsx
├── pages/              # Page components
│   ├── ProductPage.jsx
│   ├── CategoryPage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   └── AdminPanel.jsx
├── assets/             # Static assets
├── App.jsx             # Main app component
├── main.jsx           # Entry point
├── index.css          # Global styles
└── App.css            # Component styles
```

## 🌐 Navigation Structure

The website includes:
- Responsive navigation with hover dropdowns (desktop) and tap-to-expand (mobile)
- Albanian category structure as specified
- User account and shopping cart integration
- Search functionality
- Brand directory

## 💰 Payment & Delivery

- **Payment Method**: Cash on Delivery (COD)
- **Delivery**: Free shipping for orders over 5000 ALL
- **Coverage**: Nationwide delivery in Albania
- **Verification**: Email verification for all orders

## 🔮 Planned Features

- [ ] Complete product catalog
- [ ] Advanced search and filtering
- [ ] User reviews and ratings
- [ ] Wishlist functionality
- [ ] Order tracking
- [ ] Admin dashboard for content management
- [ ] Blog/articles system
- [ ] Multi-language support
- [ ] Integration with payment gateways
- [ ] Real-time chat support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Nabis Farmaci**
- Email: info@nabisfarmaci.al
- Phone: +355 69 123 4567
- Address: Rruga e Durrësit, Tiranë, Shqipëri

---

Built with ❤️ for the Albanian pharmacy market+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
