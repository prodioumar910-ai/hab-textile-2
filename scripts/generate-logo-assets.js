import { buildOfficialBrandAssets } from './build-official-brand-assets.js';

export function generateLogoAssets() {
  buildOfficialBrandAssets();
}

if (process.argv[1]?.endsWith('generate-logo-assets.js')) {
  generateLogoAssets();
}
