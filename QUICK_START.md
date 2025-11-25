# 🚀 Quick Start Guide - Nabis E-Commerce

## ✅ System Status: READY TO GO!

Your e-commerce store has been successfully set up with **771 products** and **740+ product images**!

---

## 🎯 Start the Application

### Option 1: Using the start script
```bash
.\start-nabis.bat
```

### Option 2: Manual start
```bash
# Terminal 1 - Start Backend Server
cd server
node server.cjs

# Terminal 2 - Start Frontend (in a new terminal)
npm run dev
```

---

## 🌐 Access the Application

Once started, open your browser to:

- **Frontend (Customer):** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Admin Panel:** http://localhost:5173/admin (login required)

---

## 👤 Admin Credentials

**Email:** admin@nabisfarmaci.al  
**Password:** Admin123!

---

## 📦 What's Available

### Products
- ✅ 771 dermocosmetics products
- ✅ All with images
- ✅ Proper categorization
- ✅ Albanian & English support
- ✅ Price in Albanian Lek (L)

### Features Enabled
- ✅ Product browsing & search
- ✅ Shopping cart
- ✅ User registration & login
- ✅ Order placement
- ✅ Email verification
- ✅ Admin panel for management

---

## 🛠️ Admin Panel Features

Once logged in as admin, you can:

1. **Manage Products**
   - View all products
   - Edit product details
   - Update prices & stock
   - Add/remove products

2. **Manage Orders**
   - View all orders
   - Update order status
   - Track deliveries

3. **Manage Users**
   - View registered users
   - Manage user roles

4. **Settings**
   - Update banner text
   - Configure site settings

---

## 📊 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Filter by category
- `GET /api/brands` - Get all brands

### Cart
- `POST /api/cart` - Add to cart
- `GET /api/cart` - Get cart items
- `PUT /api/cart/:id` - Update quantity
- `DELETE /api/cart/:id` - Remove item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email

---

## 🖼️ Product Images

All product images are served from:
```
/uploads/products/[product-slug].jpg
```

Example:
```
http://localhost:3001/uploads/products/rvb-lab-3-in-1-bi-phase-micellar-lotion.jpg
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=3001
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

### Database
- **Type:** SQLite
- **Location:** `server/database.sqlite`
- **Backup:** Recommended before making changes

---

## 📱 Testing the Store

### As a Customer:
1. Browse products on homepage
2. Use search & filters
3. Add products to cart
4. Register/Login
5. Complete checkout
6. Receive order confirmation email

### As an Admin:
1. Login with admin credentials
2. Access `/admin` route
3. View dashboard
4. Manage products & orders

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Install dependencies if needed
npm install
cd server && npm install
```

### Images not loading
- Ensure `server/uploads/products/` directory exists
- Check file permissions
- Verify image paths in database

### Database issues
```bash
# Check database
cd server
node -e "const db = require('sqlite3').verbose(); new db.Database('./database.sqlite');"
```

---

## 📚 Documentation

For more details, see:
- `IMPORT_SUCCESS_REPORT.md` - Import details
- `README.md` - Full project documentation
- `SETUP-COMPLETE.md` - Setup guide

---

## 🎉 You're All Set!

Your Nabis E-Commerce store is fully configured and ready to accept orders!

**Next Steps:**
1. Start the application
2. Test the customer flow
3. Configure email settings (if not already done)
4. Customize branding as needed
5. Go live! 🚀

---

**Need Help?** Check the documentation or review the setup files.
