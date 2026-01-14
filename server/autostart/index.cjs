/**
 * 🚀 AUTOSTART MODULE
 * Runs all necessary initialization tasks when server starts
 * - Image consolidation (PERMANENT FIX)
 * - Image restoration
 * - Image matching
 * - Duplicate removal
 */

const { autoConsolidateImages } = require('./image-consolidation.cjs');
const { autoRestoreImages } = require('./image-restoration.cjs');
const { autoMatchImages } = require('./image-matching.cjs');

async function runAutostart() {
  console.log('\n🚀 ========== AUTOSTART INITIALIZATION ==========\n');
  
  const startTime = Date.now();
  
  try {
    // 1. Consolidate all images into one location and validate (PERMANENT)
    await autoConsolidateImages();
    
    // 2. Restore and assign images from uploads
    await autoRestoreImages();
    
    // 3. Auto-matching DISABLED to prevent duplicate assignments
    // Image matching is now done manually when needed
    console.log('🎯 Auto-matching disabled (database is clean)');
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ ========== AUTOSTART COMPLETE (${duration}s) ==========\n`);
    
    return { success: true, duration };
  } catch (error) {
    console.error('\n❌ ========== AUTOSTART FAILED ==========');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.log('\n⚠️  Server will continue, but some features may not work correctly\n');
    
    return { success: false, error: error.message };
  }
}

module.exports = { runAutostart };
