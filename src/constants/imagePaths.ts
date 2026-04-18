/**
 * Image path constants for portfolio projects
 * All images are stored in public/projects/
 */

export const PROJECT_IMAGES = {
  bicMosque: {
    real: '/crimson1800/projects/bicmosquepics/real.png',
    revit: '/crimson1800/projects/bicmosquepics/revit.png',
    site: '/crimson1800/projects/bicmosquepics/site.png',
  },
  ceb: {
    video: '/crimson1800/projects/ceb/cebvideo.mp4',
    envelope: '/crimson1800/projects/ceb/envelopeceb.png',
    green: '/crimson1800/projects/ceb/greenceb.png',
    house: '/crimson1800/projects/ceb/houseceb.png',
    isometric: '/crimson1800/projects/ceb/isometric',
    living: '/crimson1800/projects/ceb/livingceb.png',
    outside: '/crimson1800/projects/ceb/outside.png',
    multiUnit: '/crimson1800/projects/ceb/multiunitceb.png',
    solar: '/crimson1800/projects/ceb/solar.png',
    totalView: '/crimson1800/projects/ceb/totalview.png',
    wallExterior: '/crimson1800/projects/ceb/wallexterior.png',
    redGray: '/crimson1800/projects/ceb/redgrayceb.png',
  },
  hydroRender: '/crimson1800/projects/hydrorender',
} as const;

/**
 * Helper function to get image path
 * @param category - Project category (e.g., 'bicMosque', 'ceb')
 * @param image - Image key within the category
 * @returns Full image path
 */
export function getImagePath(category: keyof typeof PROJECT_IMAGES, image?: string): string {
  const categoryImages = PROJECT_IMAGES[category];
  
  if (typeof categoryImages === 'string') {
    return categoryImages;
  }
  
  if (image && image in categoryImages) {
    return categoryImages[image as keyof typeof categoryImages];
  }
  
  return '';
}

/**
 * Example usage in React components:
 * 
 * import { PROJECT_IMAGES, getImagePath } from '@/constants/imagePaths';
 * 
 * // Direct usage:
 * <img src={PROJECT_IMAGES.bicMosque.real} alt="BIC Mosque Real" />
 * 
 * // Using helper function:
 * <img src={getImagePath('ceb', 'living')} alt="CEB Living Room" />
 */
