export function optimizeImageUrl(url: string, options: { width?: number; quality?: number } = {}): string {
  const { width = 1200, quality = 80 } = options;
  
  if (!url) return url;
  
  // If URL is already using a CDN, optimize with CDN params
  if (url.includes('cloudinary')) {
    return `${url}?w=${width}&q=${quality}&f=auto`;
  }
  if (url.includes('imagekit')) {
    return `${url}?tr=w-${width},q-${quality},f-auto`;
  }
  
  return url;
}

export function getImagePlaceholder(color: string = '#0B0F1A'): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect fill='${encodeURIComponent(color)}' width='16' height='9'/%3E%3C/svg%3E`;
}
