
import React from 'react';

interface RecoveryFallbackProps {
  products?: any[];
  error?: Error | null;
  level?: string;
  onRefresh?: () => void;
}

/**
 * Simplified recovery fallback component with minimal functionality
 */
const RecoveryFallback: React.FC<RecoveryFallbackProps> = () => {
  return (
    <div className="p-4 border rounded-md bg-yellow-50">
      <div className="text-yellow-500 text-sm">
        Recovery features temporarily disabled. Normal functionality will return in the next update.
      </div>
    </div>
  );
};

export default RecoveryFallback;
