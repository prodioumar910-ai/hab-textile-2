import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.habe.app',
  appName: 'Habé',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
