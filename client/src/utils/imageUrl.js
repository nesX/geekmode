const IMAGE_SIZES = {
  thumb: 'thumb',
  medium: 'medium',
  large: 'large',
  original: 'original'
}

export function getProductImageUrl(filename, size = 'medium') {
  if (!filename) {
    return '/images/camiseta-template.png'
  }

  const variant = IMAGE_SIZES[size] || 'medium'
  return `/media/products/${filename}-${variant}.webp`
}
