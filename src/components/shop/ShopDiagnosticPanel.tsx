
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { toggleDiagnosticsMode, toggleRecoveryMode, getShopSystemSettings } from "@/services/shopSystemService";
import { getAuthStatus } from "@/services/shopAuthService";

interface DiagnosticTest {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  message?: string;
  details?: any;
  runTest: () => Promise<void>;
}

const ShopDiagnosticPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("tests");
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const { toast } = useToast();
  
  // Load system settings on component mount
  useEffect(() => {
    loadSystemSettings();
  }, []);
  
  // Initialize tests
  useEffect(() => {
    initializeDiagnosticTests();
  }, [systemSettings]);
  
  const loadSystemSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const settings = await getShopSystemSettings();
      setSystemSettings(settings);
    } catch (error) {
      console.error("Error loading system settings:", error);
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Toggle diagnostics mode
  const handleToggleDiagnostics = async () => {
    if (!systemSettings) return;
    
    try {
      const newValue = !systemSettings.diagnosticsEnabled;
      const success = await toggleDiagnosticsMode(newValue);
      
      if (success) {
        setSystemSettings(prev => ({
          ...prev,
          diagnosticsEnabled: newValue
        }));
        
        toast({
          title: newValue ? "Diagnostics Enabled" : "Diagnostics Disabled",
          description: newValue ? 
            "Shop diagnostics are now active" : 
            "Shop diagnostics are now disabled",
        });
      }
    } catch (error) {
      console.error("Error toggling diagnostics:", error);
      toast({
        title: "Error",
        description: "Failed to toggle diagnostic mode",
        variant: "destructive"
      });
    }
  };
  
  // Toggle recovery mode
  const handleToggleRecovery = async () => {
    if (!systemSettings) return;
    
    try {
      const newValue = !systemSettings.recoveryMode;
      const level = systemSettings.fallbackLevel || 'minimal';
      const success = await toggleRecoveryMode(newValue, level);
      
      if (success) {
        setSystemSettings(prev => ({
          ...prev,
          recoveryMode: newValue
        }));
        
        toast({
          title: newValue ? "Recovery Mode Enabled" : "Recovery Mode Disabled",
          description: newValue ? 
            `Shop is now in ${level} recovery mode` : 
            "Shop is now in normal mode",
        });
      }
    } catch (error) {
      console.error("Error toggling recovery mode:", error);
      toast({
        title: "Error",
        description: "Failed to toggle recovery mode",
        variant: "destructive"
      });
    }
  };
  
  // Set fallback level
  const setFallbackLevel = async (level: string) => {
    try {
      const success = await toggleRecoveryMode(systemSettings.recoveryMode, level);
      
      if (success) {
        setSystemSettings(prev => ({
          ...prev,
          fallbackLevel: level
        }));
        
        toast({
          title: "Fallback Level Updated",
          description: `Recovery fallback level set to ${level}`,
        });
      }
    } catch (error) {
      console.error("Error setting fallback level:", error);
      toast({
        title: "Error",
        description: "Failed to update fallback level",
        variant: "destructive"
      });
    }
  };
  
  // Initialize diagnostic tests
  const initializeDiagnosticTests = () => {
    const diagnosticTests: DiagnosticTest[] = [
      {
        name: "Database Connection",
        status: "pending",
        runTest: async () => {
          try {
            const test = tests.find(t => t.name === "Database Connection");
            if (test) test.status = "running";
            setTests([...tests]);
            
            const { data, error } = await supabase.from("shop_products").select("id").limit(1);
            
            if (error) throw error;
            
            const updatedTests = tests.map(t => {
              if (t.name === "Database Connection") {
                return { 
                  ...t, 
                  status: "success",
                  details: { connectionSuccessful: true },
                  message: "Connection to shop_products table successful"
                };
              }
              return t;
            });
            
            setTests(updatedTests);
            setLastUpdated(new Date());
          } catch (error) {
            console.error("Database connection test failed:", error);
            const updatedTests = tests.map(t => {
              if (t.name === "Database Connection") {
                return { 
                  ...t, 
                  status: "error",
                  details: { error },
                  message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`
                };
              }
              return t;
            });
            
            setTests(updatedTests);
            setLastUpdated(new Date());
          }
        }
      },
      {
        name: "Authentication Status",
        status: "pending",
        runTest: async () => {
          try {
            const test = tests.find(t => t.name === "Authentication Status");
            if (test) test.status = "running";
            setTests([...tests]);
            
            const authStatus = getAuthStatus();
            
            const updatedTests = tests.map(t => {
              if (t.name === "Authentication Status") {
                return { 
                  ...t, 
                  status: "success",
                  details: { ...authStatus },
                  message: authStatus.isAuthenticated ? 
                    `Authenticated (Role: ${authStatus.role})` : 
                    "Not authenticated"
                };
              }
              return t;
            });
            
            setTests(updatedTests);
            setLastUpdated(new Date());
          } catch (error) {
            console.error("Auth status test failed:", error);
            const updatedTests = tests.map(t => {
              if (t.name === "Authentication Status") {
                return { 
                  ...t, 
                  status: "error",
                  details: { error },
                  message: `Auth check failed: ${error instanceof Error ? error.message : String(error)}`
                };
              }
              return t;
            });
            
            setTests(updatedTests);
            setLastUpdated(new Date());
          }
        }
      },
      {
        name: "Row-Level Security",
        status: "pending",
        runTest: async () => {
          try {
            const test = tests.find(t => t.name === "Row-Level Security");
            if (test) test.status = "running";
            setTests([...tests]);
            
            // Use the new function to get RLS policies
            const { data, error } = await supabase.rpc('get_policies_for_table', { 
              table_name: 'shop_products' 
            });
            
            if (error) throw error;
            
            // Check if we received policies
            const hasRlsPolicies = Array.isArray(data) && data.length > 0;
            
            // Update test status based on result
            const updatedTests = tests.map(t => {
              if (t.name === "Row-Level Security") {
                if (hasRlsPolicies) {
                  return { 
                    ...t, 
                    status: "success",
                    details: { policies: data },
                    message: `Found ${data.length} RLS policies on shop_products table`
                  };
                } else {
                  return { 
                    ...t, 
                    status: "warning",
                    details: { policies: [] },
                    message: "No RLS policies found for shop_products table"
                  };
                }
              }
              return t;
            });
            
            setTests(updatedTests);
            setLastUpdated(new Date());
          } catch (error) {
            console.error("RLS test failed:", error);
            const updatedTests = tests.map(t => {
              if (t.name === "Row-Level Security") {
                return { 
                  ...t, 
                  status: "error",
                  details: { error },
                  message: `RLS check failed: ${error instanceof Error ? error.message : String(error)}`
                };
              }
              return t;
            });
            
            setTests(updatedTests);
            setLastUpdated(new Date());
          }
        }
      },
      {
        name: "System Settings",
        status: "pending",
        runTest: async () => {
          try {
            const test = tests.find(t => t.name === "System Settings");
            if (test) test.status = "running";
            setTests([...tests]);
            
            // Try to load system settings
            const settings = await getShopSystemSettings();
            
            const updatedTests = tests.map(t => {
              if (t.name === "System Settings") {
                return { 
                  ...t, 
                  status: "success",
                  details: settings,
                  message: "System settings loaded successfully"
                };
              }
              return t;
            });
            
            setTests(updatedTests);
            setLastUpdated(new Date());
          } catch (error) {
            console.error("System settings test failed:", error);
            const updatedTests = tests.map(t => {
              if (t.name === "System Settings") {
                return { 
                  ...t, 
                  status: "error",
                  details: { error },
                  message: `Settings check failed: ${error instanceof Error ? error.message : String(error)}`
                };
              }
              return t;
            });
            
            setTests(updatedTests);
            setLastUpdated(new Date());
          }
        }
      },
    ];
    
    setTests(diagnosticTests);
  };
  
  // Run all diagnostic tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    
    try {
      // Reset tests
      const resetTests = tests.map(test => ({
        ...test,
        status: 'pending',
        message: undefined,
        details: undefined
      }));
      
      setTests(resetTests);
      
      // Run each test in sequence
      for (const test of resetTests) {
        await test.runTest();
      }
    } catch (error) {
      console.error("Error running tests:", error);
      toast({
        title: "Error",
        description: "Failed to run all diagnostic tests",
        variant: "destructive"
      });
    } finally {
      setIsRunningTests(false);
      setLastUpdated(new Date());
    }
  };
  
  // Status icon component
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Info className="h-5 w-5 text-gray-400" />;
    }
  };
  
  if (isLoadingSettings) {
    return (
      <Card className="mb-6 bg-white border-emerge-gold/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-emerge-gold mr-2" />
            <span>Loading diagnostic tools...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-white border-emerge-gold/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-6">
        <CardTitle className="text-md font-medium flex items-center text-emerge-gold">
          <Info className="h-5 w-5 mr-2" />
          Shop Diagnostic Panel
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs h-8"
          >
            {isExpanded ? "Minimize" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="px-6 pb-4">
          <div className="mb-4 flex justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">System Status</p>
              <div className="flex items-center space-x-2">
                <Badge variant={systemSettings?.recoveryMode ? "destructive" : "default"}>
                  {systemSettings?.recoveryMode ? "Recovery Mode" : "Normal Mode"}
                </Badge>
                {systemSettings?.diagnosticsEnabled && (
                  <Badge variant="outline">Diagnostics Active</Badge>
                )}
                {lastUpdated && (
                  <span className="text-xs text-gray-500">
                    Last check: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleDiagnostics}
                className="text-xs h-8"
              >
                {systemSettings?.diagnosticsEnabled ? "Disable" : "Enable"} Diagnostics
              </Button>
              <Button 
                variant={systemSettings?.recoveryMode ? "destructive" : "outline"}
                size="sm" 
                onClick={handleToggleRecovery}
                className="text-xs h-8"
              >
                {systemSettings?.recoveryMode ? "Exit" : "Enter"} Recovery Mode
              </Button>
            </div>
          </div>
          
          {systemSettings?.recoveryMode && (
            <div className="mb-4 p-3 border rounded-md bg-red-50 border-red-200">
              <p className="text-sm font-medium text-red-800">Recovery Mode Settings</p>
              <div className="flex items-center space-x-2 mt-2">
                <Button 
                  variant={systemSettings?.fallbackLevel === 'minimal' ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => setFallbackLevel('minimal')}
                  className="text-xs h-7"
                >
                  Minimal
                </Button>
                <Button 
                  variant={systemSettings?.fallbackLevel === 'medium' ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => setFallbackLevel('medium')}
                  className="text-xs h-7"
                >
                  Medium
                </Button>
                <Button 
                  variant={systemSettings?.fallbackLevel === 'full' ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => setFallbackLevel('full')}
                  className="text-xs h-7"
                >
                  Full
                </Button>
                <span className="text-xs text-gray-600">
                  Current level: <strong>{systemSettings?.fallbackLevel}</strong>
                </span>
              </div>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="tests">Diagnostic Tests</TabsTrigger>
              <TabsTrigger value="info">System Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tests" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Shop Diagnostic Tests</h3>
                <Button 
                  size="sm" 
                  onClick={runAllTests}
                  disabled={isRunningTests}
                  className="text-xs h-8"
                >
                  {isRunningTests ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Running...
                    </>
                  ) : "Run All Tests"}
                </Button>
              </div>
              
              <div className="space-y-2">
                {tests.map((test, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-md bg-white"
                  >
                    <div className="flex items-center">
                      <StatusIcon status={test.status} />
                      <span className="ml-2 font-medium text-sm">
                        {test.name}
                      </span>
                      {test.message && (
                        <span className="ml-3 text-xs text-gray-500">
                          {test.message}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => test.runTest()}
                      disabled={test.status === 'running'}
                      className="text-xs h-7"
                    >
                      {test.status === 'running' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : "Run"}
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="info">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Shop System Information</h3>
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200 text-sm">
                        <tr>
                          <td className="px-4 py-2 font-medium bg-gray-50 w-1/3">Diagnostics Mode</td>
                          <td className="px-4 py-2">
                            {systemSettings?.diagnosticsEnabled ? (
                              <span className="text-green-600 font-medium">Enabled</span>
                            ) : (
                              <span className="text-gray-600">Disabled</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-medium bg-gray-50">Recovery Mode</td>
                          <td className="px-4 py-2">
                            {systemSettings?.recoveryMode ? (
                              <span className="text-red-600 font-medium">Active ({systemSettings.fallbackLevel})</span>
                            ) : (
                              <span className="text-green-600">Inactive</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-medium bg-gray-50">Live Sync</td>
                          <td className="px-4 py-2">
                            {systemSettings?.liveSync ? (
                              <span className="text-green-600">Enabled</span>
                            ) : (
                              <span className="text-gray-600">Disabled</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-medium bg-gray-50">Last Data Seed</td>
                          <td className="px-4 py-2">
                            {systemSettings?.lastSeededDate ? (
                              <span>{new Date(systemSettings.lastSeededDate).toLocaleString()}</span>
                            ) : (
                              <span className="text-gray-500">Never</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-medium bg-gray-50">Auth Status</td>
                          <td className="px-4 py-2">
                            {getAuthStatus().isAuthenticated ? (
                              <span className="text-green-600">Authenticated (Role: {getAuthStatus().role})</span>
                            ) : (
                              <span className="text-yellow-600">Not authenticated</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};

export default ShopDiagnosticPanel;
