/**
 * Utility to optimize and compress Google Drive user content images dynamically.
 * Appends width and WebP format request parameter (=w[size]-rw) which instructs
 * Google's imagery server to transcode, compress, and scale the raw image on the fly.
 */
export const getOptimizedImage = (url: string | undefined, width: number = 400): string => {
  if (!url) return '';
  if (url.includes('lh3.googleusercontent.com')) {
    // Strip existing trailing modifiers like =wXX or =sXX
    const baseUrl = url.split('=')[0];
    return `${baseUrl}=w${width}-rw`;
  }
  return url;
};
