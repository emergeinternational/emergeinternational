
/**
 * Get page lock status from session storage
 * @param pageId Unique identifier for the page
 * @param defaultLocked Default lock state if not found in storage
 */
export const getPageLockStatus = (pageId: string, defaultLocked: boolean = true): boolean => {
  try {
    const storedValue = sessionStorage.getItem(`pageLock_${pageId}`);
    if (storedValue !== null) {
      return JSON.parse(storedValue);
    }
    return defaultLocked;
  } catch (error) {
    console.error(`Error getting lock status for page ${pageId}:`, error);
    return defaultLocked;
  }
};

/**
 * Set page lock status in session storage
 * @param pageId Unique identifier for the page
 * @param isLocked Whether the page is locked
 */
export const setPageLockStatus = (pageId: string, isLocked: boolean): void => {
  try {
    sessionStorage.setItem(`pageLock_${pageId}`, JSON.stringify(isLocked));
  } catch (error) {
    console.error(`Error setting lock status for page ${pageId}:`, error);
  }
};

/**
 * Get unique session-based lock ID for a page
 * This helps ensure each page has a unique lock status
 * @param pageId Unique identifier for the page
 */
export const getPageLockId = (pageId: string): string => {
  const sessionId = sessionStorage.getItem('sessionId') || 
    Math.random().toString(36).substring(2, 15);
    
  if (!sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', sessionId);
  }
  
  return `${pageId}_${sessionId}`;
};
