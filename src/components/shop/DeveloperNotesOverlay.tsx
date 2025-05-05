
import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { hasAdminAccess } from '@/services/shopAuthService';
import { getShopSystemSettings } from '@/services/shopSystemService';
import { ShopProduct } from '@/types/shop';

interface DeveloperNotesOverlayProps {
  products: ShopProduct[];
  lastUpdated: Date | null;
}

const DeveloperNotesOverlay: React.FC<DeveloperNotesOverlayProps> = ({ 
  products, 
  lastUpdated 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [systemSettings, setSystemSettings] = useState<any>({
    liveSync: true,
    recoveryMode: false,
    diagnosticsEnabled: true
  });
  
  // Only show to admins
  useEffect(() => {
    const isAdmin = hasAdminAccess();
    
    if (!isAdmin) {
      setIsVisible(false);
      return;
    }
    
    setIsVisible(true);
    
    // Load system settings
    const loadSettings = async () => {
      const settings = await getShopSystemSettings();
      setSystemSettings({
        liveSync: settings.liveSync,
        recoveryMode: settings.recoveryMode,
        diagnosticsEnabled: settings.diagnosticsEnabled
      });
    };
    
    loadSettings();
  }, []);
  
  if (!isVisible) return null;
  
  const toggleOverlay = () => setIsExpanded(prev => !prev);
  
  return (
    <div 
      className={`fixed bottom-20 right-4 z-50 transition-all duration-300 ${
        isExpanded 
          ? 'w-80 bg-white shadow-lg rounded-lg border border-gray-200' 
          : 'w-auto bg-gray-800 rounded-md'
      }`}
    >
      {!isExpanded ? (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white px-3 py-2"
          onClick={toggleOverlay}
        >
          <Info className="w-4 h-4 mr-2" />
          <span>Dev Info</span>
        </Button>
      ) : (
        <div className="p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">Developer Notes</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleOverlay}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-2">
              <TabsTrigger value="general" className="flex-1 text-xs">General</TabsTrigger>
              <TabsTrigger value="data" className="flex-1 text-xs">Data</TabsTrigger>
              <TabsTrigger value="system" className="flex-1 text-xs">System</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <dl className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Active Table:</dt>
                  <dd>
                    <Badge variant="outline" className="font-mono text-xs px-1 py-0">shop_products</Badge>
                  </dd>
                </div>
                
                <div className="flex justify-between">
                  <dt className="text-gray-500">Products Visible:</dt>
                  <dd>{products.length}</dd>
                </div>
                
                <div className="flex justify-between">
                  <dt className="text-gray-500">Live Sync:</dt>
                  <dd>
                    {systemSettings.liveSync ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-500">
                        <X className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </dd>
                </div>
                
                <div className="flex justify-between">
                  <dt className="text-gray-500">Last Updated:</dt>
                  <dd className="font-mono">
                    {lastUpdated 
                      ? lastUpdated.toLocaleTimeString() 
                      : 'Never'}
                  </dd>
                </div>
              </dl>
            </TabsContent>
            
            <TabsContent value="data">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Published Products:</span>
                  <Badge variant="outline">{
                    products.filter(p => p.status === 'published').length
                  }</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Draft Products:</span>
                  <Badge variant="outline">{
                    products.filter(p => p.status === 'draft').length
                  }</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>With Images:</span>
                  <Badge variant="outline">{
                    products.filter(p => p.image_url).length
                  }</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Missing Images:</span>
                  <Badge variant="outline" className={
                    products.filter(p => !p.image_url).length > 0 ? "bg-yellow-100" : ""
                  }>{
                    products.filter(p => !p.image_url).length
                  }</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="system">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Recovery Mode:</span>
                  {systemSettings.recoveryMode ? (
                    <Badge className="bg-yellow-500">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Diagnostics:</span>
                  {systemSettings.diagnosticsEnabled ? (
                    <Badge className="bg-blue-500">Enabled</Badge>
                  ) : (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Environment:</span>
                  <Badge variant="outline">
                    {import.meta.env.MODE || 'development'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Build Time:</span>
                  <span className="font-mono text-xs">
                    {import.meta.env.VITE_BUILD_TIME || new Date().toISOString()}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <Layers className="h-3 w-3 mr-1 text-gray-400" />
              <span className="text-xs text-gray-500">Admin View</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 text-xs p-1">
              Report Issue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperNotesOverlay;
