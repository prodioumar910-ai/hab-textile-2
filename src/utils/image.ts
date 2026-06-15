/**
 * Utility to optimize and compress Google Drive user content images dynamically.
 * Appends width and WebP format request parameter (=w[size]-rw) which instructs
 * Google's imagery server to transcode, compress, and scale the raw image on the fly.
 */
export const getOptimizedImage = (url: string | undefined, width: number = 400): string => {
  if (!url) return '';
  if (url.includes('lh3.googleusercontent.com')) {
    // Strip existing trailing modifiers like =wXX or =sXX or =s0
    const baseUrl = url.split('=')[0];
    
    // For products, slider, and detailed views (width >= 200), we request "=s0"
    // which instructs Google's server to serve the original, uncompressed, crystal-sharp image.
    if (width >= 200) {
      return `${baseUrl}=s0`;
    }
    
    // For smaller layouts or avatars, we request double the size for high-DPI (Retina) support
    return `${baseUrl}=s${width * 2}`;
  }
  return url;
};
