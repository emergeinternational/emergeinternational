
import React from 'react';

const ProductsManager: React.FC<{isLocked?: boolean}> = ({ isLocked = false }) => {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md border border-yellow-200">
        <h3 className="font-medium">Product Management</h3>
        <p className="text-sm">
          Product management features are being rebuilt. Please check back soon.
        </p>
      </div>
    </div>
  );
};

export default ProductsManager;
