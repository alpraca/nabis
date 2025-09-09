# 🚀 Nabis Farmaci - Complete Setup Guide

This guide will help you set up Nabis Farmaci so it **NEVER** shows connection errors again and starts automatically.

## 🔧 Quick Fix (Immediate Solution)

**Double-click any of these files to start Nabis Farmaci:**
- `start-nabis.bat` - Simple start (recommended for daily use)
- `nabis-manager.ps1` - Advanced manager with monitoring

## 📋 One-Time Setup (Permanent Solution)

### Step 1: Create Desktop Shortcuts
1. Right-click on `create-shortcuts.ps1`
2. Select "Run with PowerShell"
3. You'll get 5 shortcuts on your desktop for easy access

### Step 2: Set Up Auto-Start (Optional but Recommended)
1. Right-click on PowerShell and select "Run as Administrator"
2. Navigate to your project folder: `cd "C:\Users\Admin\2nd-step"`
3. Run: `.\setup-autostart.ps1`
4. This will make Nabis Farmaci start automatically when Windows boots

## 🎯 Available Commands

### Simple Commands (Batch Files)
- **start-nabis.bat** - Starts both frontend and backend
- **stop-nabis.bat** - Stops all Nabis services

### Advanced Commands (PowerShell)
```powershell
# Start the application
.\nabis-manager.ps1 -Action start

# Stop the application  
.\nabis-manager.ps1 -Action stop

# Restart the application
.\nabis-manager.ps1 -Action restart

# Check status and health
.\nabis-manager.ps1 -Action status
```

## 🌐 Access Points

After starting Nabis Farmaci, you can access:

- **Main Website**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin  
- **API Backend**: http://localhost:3001

## 🛠️ Troubleshooting

### If you see "ERR_CONNECTION_REFUSED" errors:
1. **Quick Fix**: Double-click `start-nabis.bat`
2. **Check Status**: Run `nabis-manager.ps1 -Action status`
3. **Restart**: Run `nabis-manager.ps1 -Action restart`

### If auto-start isn't working:
1. Open Task Scheduler (`taskschd.msc`)
2. Look for "NabisFarmaciAutoStart" task
3. Right-click and select "Run" to test

### If ports are busy:
1. Run `stop-nabis.bat` to stop all services
2. Wait 10 seconds
3. Run `start-nabis.bat` to restart

## 📝 Logs and Monitoring

- Log file location: `nabis.log` (created automatically)
- Use the advanced manager to see real-time status
- Check Windows Task Manager for Node.js processes

## 💡 Pro Tips

1. **Pin shortcuts to taskbar** for even faster access
2. **Use auto-start** if you work on this project daily
3. **Bookmark the websites** in your browser
4. **Check the log file** if something goes wrong

## 🆘 Emergency Reset

If everything breaks:
1. Run `stop-nabis.bat`
2. Close all command prompts and Node.js processes
3. Restart your computer
4. Run `start-nabis.bat`

---

**Remember**: The connection errors happen because the backend server (port 3001) isn't running. These scripts ensure it always starts properly!
