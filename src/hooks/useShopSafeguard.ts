
import { useEffect, useState } from 'react';
import { getShopSystemSettings, toggleRecoveryMode } from '@/services/shopSystemService';
import { getAuthStatus } from '@/services/shopAuthService';

/**
 * Hook that monitors shop dependencies and automatically
 * activates recovery mode if critical errors are detected
 */
export const useShopSafeguard = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [recoveryActivated, setRecoveryActivated] = useState(false);
  const { isAdmin } = getAuthStatus();
  
  useEffect(() => {
    // Only admins get the full monitoring capability
    if (isAdmin) {
      console.log("Shop safeguard monitoring activated for admin user");
      setIsMonitoring(true);
      
      const monitorErrorRate = () => {
        try {
          // Get any existing error info from session storage
          const errorCountStr = sessionStorage.getItem('shop_error_count') || '0';
          const errorCount = parseInt(errorCountStr);
          
          // If error count is high, check if we should activate recovery mode
          if (errorCount > 5 && !recoveryActivated) {
            console.log(`High error count detected (${errorCount}), checking if recovery mode should be activated`);
            checkAndActivateRecovery();
          }
          
          // Create error listener for global errors
          const errorHandler = () => {
            const currentCount = parseInt(sessionStorage.getItem('shop_error_count') || '0');
            const newCount = currentCount + 1;
            sessionStorage.setItem('shop_error_count', newCount.toString());
            console.log(`Shop error detected, new count: ${newCount}`);
            
            if (newCount > 5 && !recoveryActivated) {
              checkAndActivateRecovery();
            }
          };
          
          // Attach to global error event
          window.addEventListener('error', errorHandler);
          
          return () => {
            window.removeEventListener('error', errorHandler);
          };
        } catch (err) {
          console.error("Error in shop safeguard:", err);
        }
      };
      
      const monitorId = setTimeout(monitorErrorRate, 1000);
      
      return () => {
        clearTimeout(monitorId);
      };
    }
  }, [isAdmin, recoveryActivated]);
  
  // Check if recovery mode should be activated
  const checkAndActivateRecovery = async () => {
    try {
      console.log("Checking if recovery mode should be activated");
      // Get current system settings
      const settings = await getShopSystemSettings();
      
      // If recovery mode is already active, don't activate again
      if (settings.recoveryMode) {
        console.log("Recovery mode is already active");
        return;
      }
      
      // Activate recovery mode
      const success = await toggleRecoveryMode(true, 'minimal');
      
      if (success) {
        setRecoveryActivated(true);
        console.log("Recovery mode automatically activated due to high error rate");
        
        // Clear error count to prevent rapid toggling
        sessionStorage.setItem('shop_error_count', '0');
      } else {
        console.error("Failed to activate recovery mode");
      }
    } catch (err) {
      console.error("Error activating recovery mode:", err);
    }
  };
  
  return { isMonitoring, recoveryActivated };
};
