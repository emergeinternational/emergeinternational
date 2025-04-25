
// Re-export types
export * from './types';

// Re-export services
export * from './categoriesService';
export * from './contentService';
export * from './progressService';

// For backward compatibility, re-export fallback data
export { fallbackCategories, fallbackContent } from './fallbackData';
