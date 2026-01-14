# 🚀 Autostart System

## Overview
The autostart system automatically handles all necessary initialization tasks when the server starts. **No manual script execution required!**

## What Runs Automatically

### 1. Image Restoration
- Restores all uploaded product images from the database
- Sets proper sort orders and primary image flags
- Ensures all existing images are properly displayed

### 2. Image Matching
- Automatically matches available images to products without images
- Uses intelligent matching algorithms:
  - Brand name matching
  - Product name matching
  - Keyword analysis
  - Prevents duplicate image assignments

## How It Works

When you start the server with:
```bash
npm run server
```

Or the full dev environment:
```bash
npm run dev:full
```

The autostart system will:
1. ✅ Initialize the database
2. ✅ Start the Express server
3. ✅ Run all autostart tasks in the background
4. ✅ Continue running the server regardless of task results

## Architecture

```
server/
├── server.cjs              # Main server file (calls autostart)
└── autostart/
    ├── index.cjs           # Main autostart orchestrator
    ├── image-restoration.cjs  # Restores uploaded images
    └── image-matching.cjs     # Matches images to products
```

## Adding New Autostart Tasks

To add a new automated task:

1. Create a new module in `server/autostart/your-task.cjs`:
```javascript
async function autoYourTask() {
  // Your initialization code here
  return { success: true, data: {} };
}
module.exports = { autoYourTask };
```

2. Add it to `server/autostart/index.cjs`:
```javascript
const { autoYourTask } = require('./your-task.cjs');

async function runAutostart() {
  // ... existing code ...
  await autoYourTask();
  // ... rest of code ...
}
```

## Configuration

All autostart tasks run automatically. No configuration needed!

If you need to disable autostart (not recommended):
- Comment out the `runAutostart()` call in `server/server.cjs`

## Benefits

✅ **No Manual Work**: Everything runs automatically when server starts
✅ **Consistent State**: Database and images are always synchronized
✅ **Error Handling**: Failures don't crash the server
✅ **Fast Startup**: Tasks run asynchronously after server is ready
✅ **Extensible**: Easy to add new initialization tasks

## Monitoring

Check server logs on startup to see autostart progress:
```
🚀 Server is running on http://localhost:3001
🚀 ========== AUTOSTART INITIALIZATION ==========
🔄 Auto-restoring product images...
   ✅ Image restoration complete: 150 updated, 2178 total
🎯 Auto-matching images to products...
   ✅ Auto-matched 45 images to products
✅ ========== AUTOSTART COMPLETE (2.34s) ==========
```

## Troubleshooting

If autostart tasks fail:
1. Check server logs for error messages
2. Verify database exists at `server/database.sqlite`
3. Verify image directories exist:
   - `public/images/products/`
   - `server/uploads/images/`
   - `server/uploads/products/`
4. Server will continue running even if autostart fails

## Related Files

- Manual image restoration: `restore-uploaded-images.cjs` (deprecated, now automatic)
- Manual image matching: `aggressive-image-matcher.cjs` (deprecated, now automatic)
- Server configuration: `server/server.cjs`
