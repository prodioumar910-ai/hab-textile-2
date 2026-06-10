import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.maisonhabe.app',
  appName: 'Maison Habé',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
