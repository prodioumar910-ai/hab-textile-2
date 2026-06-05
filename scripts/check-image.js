import fs from 'fs';
import path from 'path';

function check(filename) {
  const filePath = path.join(process.cwd(), 'public', filename);
  console.log(`Checking ${filename}:`);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`- File size: ${stats.size} bytes`);
    
    if (stats.size > 100) {
      const buffer = Buffer.alloc(100);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 100, 0);
      fs.closeSync(fd);
      
      const text = buffer.toString('utf8');
      const isHtml = text.includes('<!doctypehtml>') || text.includes('<html') || text.includes('DOCTYPE') || text.includes('<!DOCTYPE');
      if (isHtml) {
        console.log('  ALERT: The downloaded file is an HTML page (likely Google Drive rate limit/warning), NOT a real image!');
      } else {
        console.log('  Seems like valid binary image data.');
      }
    } else {
      console.log('  File is too small/empty.');
    }
  } else {
    console.log('  File does not exist.');
  }
}

check('accessories_raw.jpg');
check('shoes_raw.jpg');
check('royal_raw.jpg');
check('parfum_raw.jpg');

