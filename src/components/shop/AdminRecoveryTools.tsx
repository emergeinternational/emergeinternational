
import React from 'react';
import MockupGenerator from './recovery/MockupGenerator';

/**
 * Simplified recovery tools component with just mock product generation functionality
 */
export default function AdminRecoveryTools() {
  return (
    <div className="mb-6">
      <div className="text-sm text-yellow-600 p-4 border border-yellow-400 bg-yellow-100 rounded-md mb-4">
        Recovery tools are temporarily disabled due to failed build. Only mock product generation is available.
      </div>
      
      {/* Include only the MockupGenerator for now */}
      <MockupGenerator />
    </div>
  );
}
