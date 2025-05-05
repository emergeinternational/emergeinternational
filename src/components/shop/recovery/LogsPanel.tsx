
import React from 'react';
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useShopDiagnostics } from "@/hooks/shop/useShopDiagnostics";

/**
 * Component for displaying recovery logs
 */
const LogsPanel: React.FC = () => {
  const { recoveryLogs, isLoading } = useShopDiagnostics();

  return (
    <div className="p-4 border rounded-md">
      <h3 className="font-medium mb-2">Recovery Logs</h3>
      <div className="space-y-2 mt-4 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-gray-500 mr-2" />
            <span>Loading logs...</span>
          </div>
        ) : recoveryLogs.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            No recovery logs available
          </div>
        ) : (
          recoveryLogs.map((log) => (
            <div key={log.id} className="p-2 border-b text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {log.status === 'success' ? (
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                  ) : log.status === 'failure' ? (
                    <XCircle className="h-3 w-3 text-red-500 mr-2" />
                  ) : (
                    <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin mr-2" />
                  )}
                  <span className="font-mono">
                    {log.action}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {log.details && (
                <div className="ml-5 mt-1 text-xs text-gray-500">
                  {JSON.stringify(log.details)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogsPanel;
