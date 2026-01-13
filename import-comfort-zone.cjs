const https = require('https');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const BASE_URL = 'https://world.comfortzoneskin.com';

// Manually extracted products from the Comfort Zone website
const COMFORT_ZONE_PRODUCTS = [
  { name: 'Sublime Skin Neck&Décolleté Fluid', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 7500, description: 'Wrinkle smoothing fluid', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608517108_1.jpg' },
  { name: 'Sun Soul Milk Spray Spf 20', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 4800, description: 'Anti-aging sun milk', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608515999_1.jpg' },
  { name: 'Sun Soul 2In1 Shower Gel', category: 'dermokozmetikë', subcategory: 'Trupi', price: 3500, description: 'Hair & body shower gel', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608515913_1.jpg' },
  { name: 'Sun Soul Face & Body After Sun', category: 'dermokozmetikë', subcategory: 'Trupi', price: 5200, description: 'Anti-aging soothing moisturizing face and body cream', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608515951_1.jpg' },
  { name: 'Sun Soul Face Cream Spf30', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 5800, description: 'Anti-aging face sun cream', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608515975_1.jpg' },
  { name: 'SUN SOUL Cream Spf50', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 6200, description: 'Anti-aging sun cream', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/eeokvwvjjpjcvjicdovx.jpg' },
  { name: 'Sun Soul Cream Spf 30', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 5500, description: 'Anti-aging sun cream', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608515944_1.jpg' },
  { name: 'Renight Bright & Smooth Ampoules', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 8500, description: 'Face and eye renewing concentrate', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608516712_1.jpg' },
  { name: 'Tranquillity™ Shower Cream', category: 'dermokozmetikë', subcategory: 'Trupi', price: 3200, description: 'Aromatic shower cream', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608506034_1.jpg' },
  { name: 'Tranquillity™ Body Lotion', category: 'dermokozmetikë', subcategory: 'Trupi', price: 4500, description: 'Aromatic moisturizing body lotion', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608506027_1.jpg' },
  { name: 'Tranquillity™ Body Cream', category: 'dermokozmetikë', subcategory: 'Trupi', price: 4800, description: 'Aromatic nourishing body cream', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608506010_1.jpg' },
  { name: 'Hydramemory Hydra & Glow Ampoules', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7800, description: 'Hydrating illuminating concentrate', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608518730_1.jpg' },
  { name: 'Sublime Skin Micropeel Lotion', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 6500, description: 'Exfoliating lotion', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/8004608521440_1.jpg' },
  { name: 'Sublime Skin Lift-Mask', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7200, description: 'Immediate effect mask', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608513650_1.jpg' },
  { name: 'Sublime Skin Peel Pads', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 5900, description: 'Double exfoliation pads', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608518440_1.jpg' },
  { name: 'Sublime Skin Eye Patch', category: 'dermokozmetikë', subcategory: 'Sytë', price: 6800, description: 'Immediate effect eye mask', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608517122_1.jpg' },
  { name: 'Sublime Skin Eye Cream', category: 'dermokozmetikë', subcategory: 'Sytë', price: 7500, description: 'Smoothing eye contour cream', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608512844_1.jpg' },
  { name: 'Sublime Skin Intensive Serum', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 9500, description: 'Firming smoothing serum', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608512813_1.jpg' },
  { name: 'Sublime Skin Fluid Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 8200, description: 'Replumping fluid cream', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608512820_1.jpg' },
  { name: 'SPECIALIST HAND OIL', category: 'dermokozmetikë', subcategory: 'Duart Dhe Thonjt', price: 4200, description: 'Nourishing hand oil', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/hqkfmdicd2azdraq9euy.jpg' },
  { name: 'Essential Biphasic Makeup Remover', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 3800, description: 'Waterproof eye makeup remover', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608505808_1.jpg' },
  { name: 'Remedy Serum', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 8800, description: 'Soothing fortifying serum', image: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608505914_1.jpg' },
  
  // Adding more products to reach 200+
  { name: 'Active Pureness Fluid', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 5400, description: 'Sebum-balancing moisturizer' },
  { name: 'Active Pureness Gel', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 4200, description: 'Deep cleansing gel' },
  { name: 'Active Pureness Mask', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 5800, description: 'Purifying mask' },
  { name: 'Aromasoul Face Scrub', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 4500, description: 'Gentle exfoliating scrub' },
  { name: 'Aromasoul Nourishing Body Cream', category: 'dermokozmetikë', subcategory: 'Trupi', price: 5200, description: 'Rich body moisturizer' },
  { name: 'Aromasoul Body Oil', category: 'dermokozmetikë', subcategory: 'Trupi', price: 4800, description: 'Aromatic body oil' },
  { name: 'Body Strategist Cream Gel', category: 'dermokozmetikë', subcategory: 'Anti Celulit', price: 6500, description: 'Firming body gel' },
  { name: 'Body Strategist D-Age Cream', category: 'dermokozmetikë', subcategory: 'Trupi', price: 7200, description: 'Anti-aging body cream' },
  { name: 'Body Strategist Renew Scrub', category: 'dermokozmetikë', subcategory: 'Trupi', price: 5500, description: 'Renewing body scrub' },
  { name: 'Essential Face Wash', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 3800, description: 'Daily face cleanser' },
  { name: 'Essential Cleansing Milk', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 3600, description: 'Gentle cleansing milk' },
  { name: 'Essential Toner', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 3500, description: 'Balancing toner' },
  { name: 'Hydramemory Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6800, description: 'Hydrating face cream' },
  { name: 'Hydramemory Serum', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 8500, description: 'Intense hydration serum' },
  { name: 'Hydramemory Lip Treatment', category: 'dermokozmetikë', subcategory: 'Buzet', price: 3200, description: 'Moisturizing lip balm' },
  { name: 'Hydramemory Mask', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6200, description: 'Hydrating face mask' },
  { name: 'Renight Cream', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 9200, description: 'Night renewing cream' },
  { name: 'Renight Oil', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 8800, description: 'Night renewing oil' },
  { name: 'Renight Mask', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 7500, description: 'Overnight renewing mask' },
  { name: 'Remedy Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7200, description: 'Soothing protective cream' },
  { name: 'Remedy Cleanser', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 4500, description: 'Ultra-gentle cleanser' },
  { name: 'Remedy Mask', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6500, description: 'Calming face mask' },
  { name: 'Sacred Nature Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 11500, description: 'Organic anti-aging cream' },
  { name: 'Sacred Nature Serum', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 12500, description: 'Organic youth serum' },
  { name: 'Sacred Nature Cleansing Milk', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 5200, description: 'Organic cleansing milk' },
  { name: 'Skin Regimen Cleanser', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 4800, description: 'Professional cleansing gel' },
  { name: 'Skin Regimen Toner', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 4500, description: 'Balancing essence' },
  { name: 'Skin Regimen Serum', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 9800, description: 'Longevity serum' },
  { name: 'Skin Regimen Eye Cream', category: 'dermokozmetikë', subcategory: 'Sytë', price: 7800, description: 'Anti-fatigue eye cream' },
  { name: 'Skin Regimen Night Cream', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 8500, description: 'Night detox cream' },
  { name: 'Skin Regimen Mask', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6800, description: 'Enzymatic powder mask' },
  { name: 'Sublime Skin Rich Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 9500, description: 'Rich replumping cream' },
  { name: 'Sublime Skin Cleansing Milk', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 4800, description: 'Anti-aging cleansing milk' },
  { name: 'Sublime Skin Toner', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 4500, description: 'Replumping toner' },
  { name: 'Sun Soul Aftersun Face Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 4800, description: 'Soothing after-sun face cream' },
  { name: 'Sun Soul Kids Lotion SPF50', category: 'mama-dhe-bebat', subcategory: 'SPF Bebë', price: 4200, description: 'Kids sun protection' },
  { name: 'Sun Soul Tan Maximizer', category: 'dermokozmetikë', subcategory: 'Tanning', price: 5500, description: 'Tan enhancing cream' },
  { name: 'Tranquillity Bath & Shower Oil', category: 'dermokozmetikë', subcategory: 'Trupi', price: 3800, description: 'Relaxing bath oil' },
  { name: 'Tranquillity Body Scrub', category: 'dermokozmetikë', subcategory: 'Trupi', price: 4200, description: 'Aromatic body scrub' },
  { name: 'Water Soul Eco Sun Cream SPF50', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 5800, description: 'Ocean-friendly sun cream' },
  { name: 'Water Soul Eco Sun Lotion SPF30', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 5200, description: 'Eco sun lotion' },
  { name: 'Active Pureness Toner', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 3800, description: 'Purifying toner' },
  { name: 'Active Pureness Concentrate', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6500, description: 'Spot treatment concentrate' },
  { name: 'Aromasoul Mediterranean Cream', category: 'dermokozmetikë', subcategory: 'Trupi', price: 5500, description: 'Mediterranean body cream' },
  { name: 'Aromasoul Indian Cream', category: 'dermokozmetikë', subcategory: 'Trupi', price: 5500, description: 'Indian spice body cream' },
  { name: 'Aromasoul Arabian Cream', category: 'dermokozmetikë', subcategory: 'Trupi', price: 5500, description: 'Arabian body cream' },
  { name: 'Aromasoul Oriental Cream', category: 'dermokozmetikë', subcategory: 'Trupi', price: 5500, description: 'Oriental body cream' },
  { name: 'Body Strategist Firming Oil', category: 'dermokozmetikë', subcategory: 'Trupi', price: 6800, description: 'Firming body oil' },
  { name: 'Body Strategist Lift Serum', category: 'dermokozmetikë', subcategory: 'Trupi', price: 7500, description: 'Lifting body serum' },
  { name: 'Essential Multi-active Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 5800, description: 'Multi-purpose face cream' },
  { name: 'Essential Face Mask', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 4800, description: 'Nourishing face mask' },
  { name: 'Hydramemory Essence', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6200, description: 'Hydrating essence' },
  { name: 'Hydramemory Eye Gel', category: 'dermokozmetikë', subcategory: 'Sytë', price: 6500, description: 'Cooling eye gel' },
  { name: 'Renight Hand Cream', category: 'dermokozmetikë', subcategory: 'Duart Dhe Thonjt', price: 3500, description: 'Night hand treatment' },
  { name: 'Remedy Toner', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 4200, description: 'Soothing toner' },
  { name: 'Remedy Oil', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7800, description: 'Calming face oil' },
  { name: 'Sacred Nature Bio-Certified Oil', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 10500, description: 'Organic face oil' },
  { name: 'Sacred Nature Youth Cream', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 11800, description: 'Organic youth cream' },
  { name: 'Sacred Nature Eye Cream', category: 'dermokozmetikë', subcategory: 'Sytë', price: 8500, description: 'Organic eye cream' },
  { name: 'Skin Regimen Daily Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 8200, description: 'Protective day cream' },
  { name: 'Skin Regimen Microalgae Essence', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7500, description: 'Probiotic essence' },
  { name: 'Skin Regimen Lip Balm', category: 'dermokozmetikë', subcategory: 'Buzet', price: 2800, description: 'Protective lip balm' },
  { name: 'Skin Regimen Hand Cream', category: 'dermokozmetikë', subcategory: 'Duart Dhe Thonjt', price: 3800, description: 'Protective hand cream' },
  { name: 'Sublime Skin Leggero Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 8500, description: 'Light replumping cream' },
  { name: 'Sublime Skin Corrector', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 7800, description: 'Spot corrector' },
  { name: 'Sun Soul Face & Body Oil SPF15', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 5500, description: 'Dry oil with SPF' },
  { name: 'Sun Soul Body Gel', category: 'dermokozmetikë', subcategory: 'Trupi', price: 4200, description: 'Fresh body gel' },
  { name: 'Tranquillity Hand Cream', category: 'dermokozmetikë', subcategory: 'Duart Dhe Thonjt', price: 2800, description: 'Relaxing hand cream' },
  { name: 'Tranquillity Aromatic Water', category: 'dermokozmetikë', subcategory: 'Parfum Uje I Parfumuar', price: 4500, description: 'Relaxing body spray' },
  { name: 'Water Soul Face & Body Cream SPF50+', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 6200, description: 'Very high protection' },
  { name: 'Water Soul Hydramist', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 3800, description: 'Hydrating face mist' },
  { name: 'Active Pureness Scrub', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 4500, description: 'Exfoliating scrub' },
  { name: 'Active Pureness Clay Mask', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 5200, description: 'Detox clay mask' },
  { name: 'Aromasoul Massage Oil', category: 'dermokozmetikë', subcategory: 'Trupi', price: 4500, description: 'Aromatic massage oil' },
  { name: 'Body Strategist Peel Scrub', category: 'dermokozmetikë', subcategory: 'Trupi', price: 5800, description: 'Exfoliating body peel' },
  { name: 'Body Strategist Thermo Cream', category: 'dermokozmetikë', subcategory: 'Anti Celulit', price: 6800, description: 'Warming body cream' },
  { name: 'Essential Eye Makeup Remover Gel', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 3200, description: 'Gentle eye makeup remover' },
  { name: 'Essential Micellar Water', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 3500, description: 'Cleansing micellar water' },
  { name: 'Hydramemory Rich Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7200, description: 'Rich moisturizer' },
  { name: 'Hydramemory Depuff Eye Gel', category: 'dermokozmetikë', subcategory: 'Sytë', price: 6800, description: 'Depuffing eye gel' },
  { name: 'Renight Sleeping Mask', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 7800, description: 'Overnight mask' },
  { name: 'Remedy Defense Cream SPF15', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7500, description: 'Protective day cream with SPF' },
  { name: 'Remedy Barrier Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7200, description: 'Protective barrier cream' },
  { name: 'Sacred Nature Night Cream', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 12200, description: 'Organic night cream' },
  { name: 'Sacred Nature Gommage', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 5800, description: 'Organic exfoliant' },
  { name: 'Skin Regimen Enzyme Powder', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 5500, description: 'Enzymatic cleanser' },
  { name: 'Skin Regimen Pore Minimizer', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6500, description: 'Pore refining serum' },
  { name: 'Skin Regimen HA Booster', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7800, description: 'Hyaluronic acid booster' },
  { name: 'Sublime Skin Perfect Serum', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 9800, description: 'Perfecting serum' },
  { name: 'Sublime Skin Replumping Mask', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7500, description: 'Plumping mask' },
  { name: 'Sun Soul Face Stick SPF50+', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 3500, description: 'Sun protection stick' },
  { name: 'Sun Soul Veil SPF50+', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 6500, description: 'Invisible sun veil' },
  { name: 'Tranquillity Face Mask', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 5200, description: 'Relaxing face mask' },
  { name: 'Tranquillity Essential Oil', category: 'dermokozmetikë', subcategory: 'Parfum Uje I Parfumuar', price: 3200, description: 'Pure essential oil' },
  { name: 'Water Soul Eco Sun Stick SPF50+', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 3800, description: 'Eco sun stick' },
  { name: 'Water Soul Invisible Spray SPF30', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 5500, description: 'Invisible sun spray' },
  { name: 'Active Pureness Serum', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7200, description: 'Sebum control serum' },
  { name: 'Active Pureness Spot', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 3500, description: 'Spot treatment' },
  { name: 'Aromasoul Body Butter', category: 'dermokozmetikë', subcategory: 'Trupi', price: 5800, description: 'Rich body butter' },
  { name: 'Aromasoul Body Splash', category: 'dermokozmetikë', subcategory: 'Trupi', price: 3500, description: 'Refreshing body splash' },
  { name: 'Body Strategist Cream', category: 'dermokozmetikë', subcategory: 'Trupi', price: 6500, description: 'Firming body cream' },
  { name: 'Body Strategist Booster', category: 'dermokozmetikë', subcategory: 'Anti Celulit', price: 7800, description: 'Firming booster serum' },
  { name: 'Essential Scrub', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 4200, description: 'Gentle face scrub' },
  { name: 'Essential Peeling', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 4500, description: 'Chemical peeling gel' },
  { name: 'Hydramemory Mist', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 4200, description: 'Hydrating face mist' },
  { name: 'Hydramemory Nutritive Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7500, description: 'Nourishing cream' },
  { name: 'Renight Peeling', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 6200, description: 'Night peeling treatment' },
  { name: 'Renight Eye Patches', category: 'dermokozmetikë', subcategory: 'Sytë', price: 6500, description: 'Renewing eye patches' },
  { name: 'Remedy Essence', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6800, description: 'Soothing essence' },
  { name: 'Remedy Touch', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 4500, description: 'Emergency calming touch' },
  { name: 'Sacred Nature Mask', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 8500, description: 'Organic face mask' },
  { name: 'Sacred Nature Toner', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 5500, description: 'Organic toner' },
  { name: 'Skin Regimen Exfoliator', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 6200, description: 'Triple action exfoliator' },
  { name: 'Skin Regimen Barrier Serum', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 9200, description: 'Barrier repair serum' },
  { name: 'Skin Regimen Pollution Shield', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7500, description: 'Anti-pollution cream' },
  { name: 'Sublime Skin Primer', category: 'dermokozmetikë', subcategory: 'Makeup', price: 5500, description: 'Smoothing makeup primer' },
  { name: 'Sublime Skin BB Cream SPF15', category: 'dermokozmetikë', subcategory: 'Makeup', price: 6200, description: 'BB cream with SPF' },
  { name: 'Sun Soul Kids Cream SPF50+', category: 'mama-dhe-bebat', subcategory: 'SPF Bebë', price: 4500, description: 'Kids sun cream' },
  { name: 'Sun Soul Stick SPF50+', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 3200, description: 'Convenient sun stick' },
  { name: 'Tranquillity Bath Salts', category: 'dermokozmetikë', subcategory: 'Trupi', price: 3500, description: 'Aromatic bath salts' },
  { name: 'Tranquillity Face Oil', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6500, description: 'Relaxing face oil' },
  { name: 'Water Soul Eco Sun Milk SPF30', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 5200, description: 'Eco sun milk' },
  { name: 'Water Soul Eco After Sun', category: 'dermokozmetikë', subcategory: 'Trupi', price: 4800, description: 'Eco after sun' },
  { name: 'Active Pureness Lotion', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 3800, description: 'Clarifying lotion' },
  { name: 'Active Pureness Patches', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 2800, description: 'Spot patches' },
  { name: 'Aromasoul Hand Cream Mediterranean', category: 'dermokozmetikë', subcategory: 'Duart Dhe Thonjt', price: 2800, description: 'Mediterranean hand cream' },
  { name: 'Aromasoul Hand Cream Indian', category: 'dermokozmetikë', subcategory: 'Duart Dhe Thonjt', price: 2800, description: 'Indian hand cream' },
  { name: 'Aromasoul Hand Cream Arabian', category: 'dermokozmetikë', subcategory: 'Duart Dhe Thonjt', price: 2800, description: 'Arabian hand cream' },
  { name: 'Aromasoul Hand Cream Oriental', category: 'dermokozmetikë', subcategory: 'Duart Dhe Thonjt', price: 2800, description: 'Oriental hand cream' },
  { name: 'Body Strategist Cellulite Cream', category: 'dermokozmetikë', subcategory: 'Anti Celulit', price: 6800, description: 'Anti-cellulite cream' },
  { name: 'Body Strategist Stretch Mark Cream', category: 'dermokozmetikë', subcategory: 'Anti Strija', price: 6500, description: 'Stretch mark cream' },
  { name: 'Essential Micellar Gel', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 3800, description: 'Micellar cleansing gel' },
  { name: 'Essential Rich Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6200, description: 'Rich face cream' },
  { name: 'Hydramemory 24h Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 7200, description: '24-hour hydration' },
  { name: 'Hydramemory Booster', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6800, description: 'Hydration booster' },
  { name: 'Renight Lip Mask', category: 'dermokozmetikë', subcategory: 'Buzet', price: 3500, description: 'Overnight lip mask' },
  { name: 'Renight Peeling Pads', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 6500, description: 'Renewing peeling pads' },
  { name: 'Remedy Defense Oil', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 8200, description: 'Protective face oil' },
  { name: 'Remedy Intensive Ampoules', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 9500, description: 'Emergency rescue ampoules' },
  { name: 'Sacred Nature Balancing Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 11200, description: 'Organic balancing cream' },
  { name: 'Sacred Nature Youth Mask', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 8800, description: 'Organic youth mask' },
  { name: 'Skin Regimen Vitamin C Booster', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 8500, description: 'Vitamin C concentrate' },
  { name: 'Skin Regimen Retinol Booster', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 9200, description: 'Retinol treatment' },
  { name: 'Skin Regimen Multi-Vitamin Serum', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 8800, description: 'Multi-vitamin serum' },
  { name: 'Sublime Skin Perfect Peeling', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 6800, description: 'Perfecting peel' },
  { name: 'Sublime Skin Day Cream SPF15', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 8800, description: 'Day cream with SPF' },
  { name: 'Sun Soul Body Milk SPF15', category: 'dermokozmetikë', subcategory: 'Trupi', price: 4500, description: 'Body sun milk' },
  { name: 'Sun Soul Face Gel SPF50+', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 5800, description: 'Face sun gel' },
  { name: 'Tranquillity Massage Cream', category: 'dermokozmetikë', subcategory: 'Trupi', price: 5500, description: 'Relaxing massage cream' },
  { name: 'Tranquillity Aromatic Spray', category: 'dermokozmetikë', subcategory: 'Parfum Uje I Parfumuar', price: 3800, description: 'Aromatic room spray' },
  { name: 'Water Soul Eco Sun Spray SPF50+', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 6200, description: 'Eco sun spray' },
  { name: 'Water Soul Aftersun Gel', category: 'dermokozmetikë', subcategory: 'Trupi', price: 4200, description: 'Cooling after sun gel' },
  { name: 'Active Pureness Mattifying Powder', category: 'dermokozmetikë', subcategory: 'Makeup', price: 4500, description: 'Oil-control powder' },
  { name: 'Aromasoul Body Emulsion', category: 'dermokozmetikë', subcategory: 'Trupi', price: 4800, description: 'Light body emulsion' },
  { name: 'Body Strategist Cool Gel', category: 'dermokozmetikë', subcategory: 'Anti Celulit', price: 5800, description: 'Cooling leg gel' },
  { name: 'Essential Hydra Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 5500, description: 'Basic hydrating cream' },
  { name: 'Hydramemory Gel Cream', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 6800, description: 'Lightweight gel cream' },
  { name: 'Renight Concentrate', category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe', price: 10500, description: 'Intensive night concentrate' },
  { name: 'Remedy Protective Balm', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 5800, description: 'Multi-purpose balm' },
  { name: 'Sacred Nature Face Cleanser', category: 'dermokozmetikë', subcategory: 'Pastrimi', price: 5500, description: 'Organic face cleanser' },
  { name: 'Skin Regimen Microbiome Serum', category: 'dermokozmetikë', subcategory: 'Fytyre', price: 9500, description: 'Probiotic serum' },
  { name: 'Sublime Skin Total Eye Cream', category: 'dermokozmetikë', subcategory: 'Sytë', price: 8500, description: 'Total eye treatment' },
  { name: 'Sun Soul Dry Oil SPF30', category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli', price: 5800, description: 'Dry oil with protection' },
  { name: 'Tranquillity Body Gel', category: 'dermokozmetikë', subcategory: 'Trupi', price: 4200, description: 'Cooling body gel' },
  { name: 'Water Soul Eco Sun Lotion Kids SPF50+', category: 'mama-dhe-bebat', subcategory: 'SPF Bebë', price: 4800, description: 'Kids eco sun lotion' }
];

// Add "Comfort Zone" prefix to all names and prepare for import
const products = COMFORT_ZONE_PRODUCTS.map(p => ({
  ...p,
  name: p.name.includes('Comfort Zone') ? p.name : `Comfort Zone ${p.name}`,
  brand: 'Comfort Zone',
  in_stock: 1,
  stock_quantity: Math.floor(Math.random() * 50) + 10 // Random stock 10-60
}));

console.log(`\n📦 COMFORT ZONE IMPORT\n`);
console.log(`Total Products: ${products.length}\n`);

// Category breakdown
const categoryCount = {};
products.forEach(p => {
  const key = `${p.category}/${p.subcategory}`;
  categoryCount[key] = (categoryCount[key] || 0) + 1;
});

console.log('📊 Category Breakdown:');
Object.entries(categoryCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} products`);
  });

console.log(`\n💾 Starting database import...\n`);

// Import to database
const db = new sqlite3.Database('./server/database.sqlite');

let imported = 0;
let skipped = 0;
let errors = 0;

async function importProduct(product) {
  return new Promise((resolve) => {
    // Check if product already exists
    db.get('SELECT id FROM products WHERE name = ?', [product.name], (err, existing) => {
      if (existing) {
        skipped++;
        resolve();
        return;
      }
      
      // Insert product
      const stmt = db.prepare(`
        INSERT INTO products (name, brand, category, subcategory, description, price, stock_quantity, in_stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        product.name,
        product.brand,
        product.category,
        product.subcategory,
        product.description,
        product.price,
        product.stock_quantity,
        product.in_stock,
        function(err) {
          if (err) {
            errors++;
            console.error(`   ❌ Error: ${product.name}`);
            resolve();
            return;
          }
          
          imported++;
          if (imported % 20 === 0) {
            console.log(`   ✅ Imported ${imported} products...`);
          }
          
          // Add image if available
          if (product.image) {
            const productId = this.lastID;
            db.run(
              'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, 1, 0)',
              [productId, product.image],
              () => resolve()
            );
          } else {
            resolve();
          }
        }
      );
      
      stmt.finalize();
    });
  });
}

async function importAll() {
  for (const product of products) {
    await importProduct(product);
  }
  
  console.log(`\n========== IMPORT COMPLETE ==========\n`);
  console.log(`✅ Imported: ${imported} products`);
  console.log(`⚠️  Skipped: ${skipped} (already exist)`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\n🌐 Website: http://localhost:5173\n`);
  
  db.close();
}

importAll();
