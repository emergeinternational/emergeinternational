
import { useState } from 'react';
import { toast } from 'sonner';
import { generateMockProducts, addRecoveryLog } from '@/services/shop/shopRecoveryService';
import { validateShopAction } from '@/services/shopAuthService';

/**
 * Hook for managing mock products generation
 */
export const useMockProducts = (isLocked = false) => {
  const [isMockGenerating, setIsMockGenerating] = useState<boolean>(false);

  /**
   * Handle generating mock products
   */
  const handleGenerateMockProducts = async (count: number = 5) => {
    if (isLocked || !validateShopAction('admin', 'generate_mock_products')) {
      toast.error("You don't have permission to generate mock products");
      await addRecoveryLog('generate_mock_products', 'failure', { reason: 'permission_denied' });
      return;
    }
    
    try {
      setIsMockGenerating(true);
      await addRecoveryLog('generate_mock_products', 'pending', { count });
      
      const success = await generateMockProducts(count);
      
      if (success) {
        toast.success(`Successfully generated ${count} mock products`);
        await addRecoveryLog('generate_mock_products', 'success', { count });
      } else {
        await addRecoveryLog('generate_mock_products', 'failure');
      }
    } catch (error) {
      console.error("Error generating mock products:", error);
      toast.error("Failed to generate mock products");
      await addRecoveryLog('generate_mock_products', 'failure', { error: String(error) });
    } finally {
      setIsMockGenerating(false);
    }
  };

  return {
    isMockGenerating,
    handleGenerateMockProducts
  };
};
