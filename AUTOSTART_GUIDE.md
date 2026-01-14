# ✅ AUTOMATIC STARTUP SYSTEM - QUICK START

## 🎉 What Changed?

Your website now **automatically** handles everything when it starts up!

### Before (Manual)
```bash
# Had to run multiple scripts manually:
npm run server                          # Start server
node restore-uploaded-images.cjs        # Restore images
node aggressive-image-matcher.cjs       # Match images
# ... etc
```

### Now (Automatic) ✨
```bash
# Just start the server - everything else is automatic!
npm run server
```

## 🚀 Starting Your Website

### Option 1: Server Only
```bash
cd nabis
npm run server
```

### Option 2: Full Development (Server + Frontend)
```bash
cd nabis
npm run dev:full
```

That's it! The autostart system will:
- ✅ Restore all product images
- ✅ Match images to products without them
- ✅ Organize everything automatically
- ✅ Keep running even if something fails

## 📊 What You'll See

When you start the server:

```
🚀 Server is running on http://localhost:3001
🌐 Network: http://192.168.100.96:3001

🚀 ========== AUTOSTART INITIALIZATION ==========

🔄 Auto-restoring product images...
   ✅ Image restoration complete: 150 updated, 2178 total

🎯 Auto-matching images to products...
   📦 Found 45 products without images
   🖼️  Available images: 500
   ✅ Auto-matched 45 images to products

✅ ========== AUTOSTART COMPLETE (2.34s) ==========
```

## 🎯 Benefits

1. **No Manual Work**: Never run individual scripts again
2. **Always Consistent**: Images and products stay synchronized
3. **Error Safe**: If something fails, server keeps running
4. **Fast**: Everything happens in the background
5. **Automatic**: Works every time you start the server

## 📁 Files Created

```
server/
└── autostart/
    ├── index.cjs              # Main controller
    ├── image-restoration.cjs  # Restores uploaded images
    ├── image-matching.cjs     # Matches images to products
    └── README.md              # Detailed documentation
```

## 🔧 Customization

Want to add more automatic tasks? Edit:
- `server/autostart/index.cjs` - Add new tasks here
- Create new modules in `server/autostart/` folder

## 🆘 Troubleshooting

**Problem**: Autostart tasks show errors
**Solution**: Server will still run. Check logs for details.

**Problem**: Images not showing up
**Solution**: 
1. Check `public/images/products/` folder exists
2. Check `server/uploads/images/` folder exists
3. Restart the server

**Problem**: Need to disable autostart temporarily
**Solution**: Comment out line in `server/server.cjs`:
```javascript
// runAutostart().catch(err => { ... })
```

## 🎊 You're Done!

From now on, just run `npm run server` or `npm run dev:full` and everything works automatically!

No more manual script execution needed! 🎉
