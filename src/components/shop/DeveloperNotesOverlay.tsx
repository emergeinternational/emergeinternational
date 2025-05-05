
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { X, FileCog, Code } from "lucide-react";
import { ShopProduct } from "@/types/shop";
import { getAuthStatus } from "@/services/shopAuthService";
import { getShopSystemSettings } from "@/services/shopSystemService";

interface DeveloperNotesOverlayProps {
  products: ShopProduct[];
}

/**
 * A hidden admin-only developer notes overlay that provides
 * debugging information about the Shop module's state
 */
const DeveloperNotesOverlay: React.FC<DeveloperNotesOverlayProps> = ({ products }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [rpcCount, setRpcCount] = useState<number>(0);
  const { isAdmin } = getAuthStatus();
  
  // Only load for admins
  useEffect(() => {
    if (isAdmin) {
      loadSystemSettings();
      
      // Add keyboard shortcut (Alt+D) to toggle the overlay
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.altKey && e.key.toLowerCase() === 'd') {
          setIsVisible(prev => !prev);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isAdmin]);
  
  // Subscribe to realtime changes
  useEffect(() => {
    if (!isAdmin) return;
    
    const productsChannel = supabase
      .channel('shop_realtime_monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shop_products'
        },
        (payload) => {
          console.log("Product change detected:", payload);
          setLastUpdated(new Date());
          setRpcCount(prev => prev + 1);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(productsChannel);
    };
  }, [isAdmin]);
  
  const loadSystemSettings = async () => {
    try {
      const settings = await getShopSystemSettings();
      setSystemSettings(settings);
    } catch (error) {
      console.error("Error loading system settings for developer notes:", error);
    }
  };
  
  // If not admin or not visible, show nothing
  if (!isAdmin || !isVisible) {
    return null;
  }
  
  // Count products by status
  const productStatusCounts: Record<string, number> = {};
  products.forEach(product => {
    const status = product.status || 'unknown';
    productStatusCounts[status] = (productStatusCounts[status] || 0) + 1;
  });
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 opacity-90 hover:opacity-100 transition-opacity border-emerge-gold bg-gray-900 text-white shadow-lg">
        <div className="flex items-center justify-between p-2 bg-emerge-gold text-black">
          <div className="flex items-center">
            <Code className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Developer Notes</span>
          </div>
          <button 
            onClick={() => setIsVisible(false)} 
            className="rounded p-1 hover:bg-black/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <CardContent className="p-3 text-xs space-y-3">
          <div>
            <h3 className="text-white/70 mb-1">Shop System</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-white/60">Active Table</div>
                <div className="font-mono">shop_products</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-white/60">Products Count</div>
                <div className="font-mono">{products.length}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-white/60">Live Sync</div>
                <div className="font-mono">
                  {systemSettings?.liveSync ? "ON" : "OFF"}
                </div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-white/60">System Mode</div>
                <div className="font-mono">
                  {systemSettings?.recoveryMode ? "RECOVERY" : "NORMAL"}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-white/70 mb-1">Product Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(productStatusCounts).map(([status, count]) => (
                <div key={status} className="bg-gray-800 p-2 rounded">
                  <div className="text-white/60">{status}</div>
                  <div className="font-mono">{count}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-white/60">Last Update</div>
            <div className="font-mono">{lastUpdated.toLocaleTimeString()}</div>
            <div className="text-white/40 text-xs">
              {rpcCount} realtime events received
            </div>
          </div>
          
          <div className="text-white/50 text-[10px]">
            Press Alt+D to toggle this overlay
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperNotesOverlay;
