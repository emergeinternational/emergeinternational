
import React from 'react';
import { Button } from "@/components/ui/button";

interface SystemStatusProps {
  status: {
    usersCount: number | null;
    adminEmail: string | null;
    lastRefresh: string;
    status: 'ready' | 'loading' | 'error';
    error?: string;
  };
  onRefresh: () => void;
}

const SystemStatus = ({ status, onRefresh }: SystemStatusProps) => {
  if (status.status === 'error') {
    return (
      <div className="bg-red-50 p-4 mb-6 rounded shadow border-l-4 border-red-500">
        <h2 className="text-sm font-medium text-red-800">System Error Detected</h2>
        <p className="text-sm text-red-700 mt-1">{status.error}</p>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onRefresh} 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (status.status === 'ready') {
    return (
      <div className="bg-white p-4 mb-6 rounded shadow border-l-4 border-emerge-gold">
        <h2 className="text-sm font-medium">System Status</h2>
        <div className="mt-2 text-sm grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500">Admin Account</p>
            <p className="font-medium">{status.adminEmail || 'reddshawn@yahoo.com'}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Users</p>
            <p className="font-medium">{status.usersCount !== null ? status.usersCount : 'Loading...'}</p>
          </div>
          <div>
            <p className="text-gray-500">Last System Check</p>
            <p className="font-medium">{new Date(status.lastRefresh).toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SystemStatus;
