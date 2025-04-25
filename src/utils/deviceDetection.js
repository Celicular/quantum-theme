/**
 * Device detection utilities for optimizing performance.
 * This centralizes all device detection logic to avoid inconsistent results.
 */

// Detect if the user is on a mobile device
export const isMobileDevice = () => {
  // Use matchMedia if available (more reliable than UA detection)
  if (typeof window !== 'undefined' && window.matchMedia) {
    // This checks for screen width ≤ 768px
    return window.matchMedia('(max-width: 768px)').matches ||
           // Check for mobile-specific features as a backup
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  // Fallback to user agent detection
  return typeof navigator !== 'undefined' && 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Get device performance tier (0-low, 1-medium, 2-high)
export const getDevicePerformanceTier = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return 1; // Default to medium
  
  // Use hardware concurrency as a rough estimate of device capability
  const cores = navigator.hardwareConcurrency || 0;
  
  // Low-end: Mobile or <= 2 cores
  if (isMobileDevice() && cores <= 2) return 0;
  
  // High-end: >= 6 cores and not mobile
  if (cores >= 6 && !isMobileDevice()) return 2;
  
  // Medium: Everything else
  return 1;
};

// Get recommended quality settings based on device capabilities
export const getRecommendedQualitySettings = () => {
  const tier = getDevicePerformanceTier();
  
  switch (tier) {
    case 0: // Low-end devices
      return {
        dpr: 0.5, // Half resolution
        antialias: false,
        precision: 'lowp',
        starsCount: {
          regular: 600,
          twinkling: 100,
          shootingStars: 10,
          nebulaClouds: 2
        }
      };
    case 1: // Medium devices
      return {
        dpr: 0.8, // 80% resolution
        antialias: false,
        precision: 'mediump',
        starsCount: {
          regular: 1200,
          twinkling: 250,
          shootingStars: 30,
          nebulaClouds: 5
        }
      };
    case 2: // High-end devices
      return {
        dpr: [1, 2], // Full resolution with 2x for Retina
        antialias: true,
        precision: 'highp',
        starsCount: {
          regular: 2000,
          twinkling: 400,
          shootingStars: 50,
          nebulaClouds: 8
        }
      };
    default:
      return {
        dpr: 1, // Full resolution
        antialias: false,
        precision: 'mediump',
        starsCount: {
          regular: 1200,
          twinkling: 250,
          shootingStars: 30,
          nebulaClouds: 5
        }
      };
  }
}; 