import fs from 'fs';
import path from 'path';
import https from 'https';

const FILES_TO_DOWNLOAD = [
  {
    id: '12huYtS1oArRGqVW5C3DyqkYEN4bXDOSN',
    name: 'accessories_raw.jpg'
  },
  {
    id: '1ASOzctlG7h-ApAd5zx_1oaaVoWkHAE8c',
    name: 'shoes_raw.jpg'
  },
  {
    id: '1V4Iz_hYaXGR3nr4cdZ71wJlxoW-8Bl9w',
    name: 'royal_raw.jpg'
  },
  {
    id: '1_KAX3Wtr_yMgxDH4O89rpxBgAybLul5U',
    name: 'parfum_raw.jpg'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    };

    https.get(url, options, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301 || response.statusCode === 307 || response.statusCode === 303) {
        const redirectUrl = response.headers.location;
        downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download, status code: ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(dest);
      response.pipe(file);

      file.on('finish', () => {
        file.close(() => {
          resolve(true);
        });
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // delete partial file
      reject(err);
    });
  });
}

async function run() {
  console.log('Downloading custom category icons from Google Drive...');
  for (const item of FILES_TO_DOWNLOAD) {
    const targetPath = path.join(process.cwd(), 'public', item.name);
    
    // Check if file exists and has size > 0 to avoid redundant network calls during build
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 100) {
      console.log(`Skipping download of ${item.name} because it is already present.`);
      continue;
    }

    const downloadUrl = `https://drive.google.com/uc?id=${item.id}&export=download`;
    try {
      console.log(`Downloading ${item.name}...`);
      await downloadFile(downloadUrl, targetPath);
      console.log(`Successfully downloaded ${item.name} (${fs.statSync(targetPath).size} bytes)`);
    } catch (err) {
      console.error(`Error downloading ${item.name}:`, err.message);
    }
  }
  console.log('All downloads finished.');
}

run();
