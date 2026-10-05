import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Builds the official brand assets for Habé:
 * - The logo is added WITHOUT modification directly from the user's emblem.
 * - The name is strictly "Habé" (and never "Habé Textile").
 */
export function buildOfficialBrandAssets() {
  const masterJpg = path.join(process.cwd(), 'src', 'assets', 'images', 'habe_official_logo_transparent_1790980242415.jpg');
  if (!fs.existsSync(masterJpg)) {
    console.error('Source master image not found at', masterJpg);
    return;
  }

  console.log('[Brand Assets] Using high-resolution master logo with careful preservation...');

  // 1. Process the master image: Just make transparent with low fuzz to avoid mangling the 'h'
  execSync(`convert "${masterJpg}" -fuzz 3% -transparent white +repage /tmp/habe_master_final.png`);
  
  // Use the FULL authentic image for all primary logo locations
  execSync('cp /tmp/habe_master_final.png public/logo.png');
  execSync('cp /tmp/habe_master_final.png public/logo-wide.png');
  
  // Create a white version
  execSync('convert /tmp/habe_master_final.png -fill white -colorize 100% public/logo-white.png');
  execSync('cp public/logo-white.png public/logo-wide-white.png');
  
  console.log('✓ Created authentic public/logo.png and public/logo-white.png from square master');

  // 2. Icon (The full authentic logo padded to square)
  execSync('convert /tmp/habe_master_final.png -gravity center -background none -extent 1:1 /tmp/habe_emblem_final.png');
  execSync('cp /tmp/habe_emblem_final.png public/logo-icon.png');
  execSync('cp /tmp/habe_emblem_final.png public/icon.png');
  console.log('✓ Created public/logo-icon.png from authentic master');

  // 3. Wordmark
  execSync('cp /tmp/habe_master_final.png public/logo-text.png');
  execSync('cp public/logo-white.png public/logo-text-white.png');
  console.log('✓ Used authentic logo for wordmark');

  // 4. App Icons
  execSync('convert -size 512x512 xc:"#0B0A0C" \\( /tmp/habe_emblem_final.png -resize 420x420 \\) -gravity center -composite public/icon-512.png');
  execSync('convert -size 192x192 xc:"#0B0A0C" \\( /tmp/habe_emblem_final.png -resize 160x160 \\) -gravity center -composite public/icon-192.png');
  execSync('convert -size 64x64 xc:"#0B0A0C" \\( /tmp/habe_emblem_final.png -resize 48x48 \\) -gravity center -composite public/favicon.png');
  execSync('convert public/favicon.png -define icon:auto-resize=64,32,16 public/favicon.ico');
  console.log('✓ Created app icons');

  // 5. Master logo JPEG
  execSync('convert -size 800x800 xc:white \\( /tmp/habe_master_final.png -resize 600x600 \\) -gravity center -composite public/logo.jpeg');
  console.log('✓ Created public/logo.jpeg');


  // 6. Mirror to dist if dist exists
  if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    const filesToCopy = [
      'logo-icon.png',
      'icon.png',
      'logo.png',
      'logo-white.png',
      'logo-wide.png',
      'logo-wide-white.png',
      'logo-text.png',
      'logo-text-white.png',
      'icon-512.png',
      'icon-192.png',
      'favicon.png',
      'favicon.ico',
      'logo.jpeg'
    ];
    for (const f of filesToCopy) {
      fs.copyFileSync(path.join(process.cwd(), 'public', f), path.join(process.cwd(), 'dist', f));
    }
    console.log('✓ Synchronized all updated brand files to dist/');
  }

  console.log('★ All official pure Habé brand assets successfully generated!');
}

buildOfficialBrandAssets();
