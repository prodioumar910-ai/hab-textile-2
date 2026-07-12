/**
 * Utility to optimize and compress Google Drive user content images dynamically.
 * Appends width and WebP format request parameter (=w[size]-rw) which instructs
 * Google's imagery server to transcode, compress, and scale the raw image on the fly.
 */
export const getOptimizedImage = (url: string | undefined, width: number = 400): string => {
  if (!url) return '';
  
  // Extract file ID if it is a Google Drive or googleusercontent URL
  let id = '';
  if (url.includes('lh3.googleusercontent.com/d/')) {
    const parts = url.split('/d/');
    if (parts[1]) {
      id = parts[1].split('=')[0];
    }
  } else if (url.includes('drive.google.com')) {
    const match = url.match(/id=([^&]+)/) || url.match(/\/file\/d\/([^/]+)/);
    if (match && match[1]) {
      id = match[1];
    }
  }

  if (id) {
    // Using the direct Google User Content CDN endpoint (lh3.googleusercontent.com/d/{id}) is far faster
    // than the drive.google.com/thumbnail endpoint, because it completely avoids HTTP 302 redirects
    // and authentication cookie verification round-trips.
    // Specifying `=w${targetSz}-rw` instructs Google's edge CDN server to scale on-the-fly and transcode
    // to WebP, reducing the weight of the images up to 95% while keeping them crisp and with full CORS support.
    const targetSz = width > 0 ? width : 400;
    return `https://lh3.googleusercontent.com/d/${id}=w${targetSz}-rw`;
  }

  if (url.includes('lh3.googleusercontent.com')) {
    const baseUrl = url.split('=')[0];
    const targetWidth = width > 0 ? width : 400;
    return `${baseUrl}=w${targetWidth}-rw`;
  }

  return url;
};
