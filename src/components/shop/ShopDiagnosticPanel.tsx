
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  Database, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  TableProperties
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DiagnosticStatus, DiagnosticTest, RLSPolicy } from "@/types/shop";
import { runShopDiagnostics, getRLSPolicies } from "@/services/shopSystemService";
import { getAuthStatus } from "@/services/shopAuthService";

const ShopDiagnosticPanel: React.FC = () => {
  const [diagnosisRunning, setDiagnosisRunning] = useState(false);
  const [testResults, setTestResults] = useState<Map<string, DiagnosticStatus>>(new Map());
  const [rlsPolicies, setRLSPolicies] = useState<Record<string, RLSPolicy[]>>({});
  const [selectedTable, setSelectedTable] = useState('shop_products');
  
  // Tables to check policies for
  const shopTables = [
    'shop_products',
    'product_variations',
    'collections',
    'shop_metadata',
    'shop_product_snapshots',
    'shop_system_settings'
  ];

  // Get auth status to check permissions
  const authStatus = getAuthStatus();
  const isAdmin = authStatus.isAdmin;

  // Define diagnostic tests
  const diagnosticTests: DiagnosticTest[] = [
    {
      name: 'auth_check',
      message: 'Verifying user authentication',
      status: 'pending',
      details: null,
      runTest: async () => {
        // This tests the auth session
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          throw new Error('No active session found');
        }
      }
    },
    {
      name: 'products_query',
      message: 'Testing products table access',
      status: 'pending',
      details: null,
      runTest: async () => {
        const { error } = await supabase
          .from('shop_products')
          .select('id')
          .limit(1);
          
        if (error) throw error;
      }
    },
    {
      name: 'variations_query',
      message: 'Testing variations table access',
      status: 'pending',
      details: null,
      runTest: async () => {
        const { error } = await supabase
          .from('product_variations')
          .select('id')
          .limit(1);
          
        if (error) throw error;
      }
    },
    {
      name: 'collections_query',
      message: 'Testing collections table access',
      status: 'pending',
      details: null,
      runTest: async () => {
        const { error } = await supabase
          .from('collections')
          .select('id')
          .limit(1);
          
        if (error) throw error;
      }
    }
  ];

  // Only run diagnostics if user is admin - as a defensive measure
  const runDiagnostics = async () => {
    if (!isAdmin) {
      console.error("Non-admin user attempted to run diagnostics");
      toast.error("You don't have permission to run diagnostics");
      return;
    }
    
    setDiagnosisRunning(true);
    try {
      const results = await runShopDiagnostics(diagnosticTests);
      setTestResults(results);
      toast.success("Diagnostics completed");
    } catch (error) {
      console.error("Error running diagnostics:", error);
      toast.error("Failed to run diagnostics");
    } finally {
      setDiagnosisRunning(false);
    }
  };

  // Get RLS policies for selected table
  const fetchRLSPolicies = async (tableName: string) => {
    if (!isAdmin) {
      console.error("Non-admin user attempted to view RLS policies");
      return;
    }
    
    try {
      const policies = await getRLSPolicies(tableName);
      setRLSPolicies(prev => ({
        ...prev,
        [tableName]: policies
      }));
    } catch (error) {
      console.error(`Error fetching RLS policies for ${tableName}:`, error);
    }
  };

  // Fetch RLS policies for selected table
  useEffect(() => {
    if (isAdmin && selectedTable) {
      fetchRLSPolicies(selectedTable);
    }
  }, [isAdmin, selectedTable]);

  // Status icon for test results
  const StatusIcon = ({ status }: { status: DiagnosticStatus }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-lg flex items-center">
          <Database className="h-5 w-5 mr-2 text-slate-500" />
          Shop System Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="tests">
          <TabsList className="mb-4">
            <TabsTrigger value="tests">Diagnostics</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="rls">RLS Policies</TabsTrigger>
          </TabsList>
          
          {/* Diagnostic Tests Tab */}
          <TabsContent value="tests">
            <div className="flex justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={runDiagnostics}
                disabled={diagnosisRunning}
                className="flex items-center"
              >
                {diagnosisRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Run Diagnostics
              </Button>
            </div>
            
            <div className="space-y-3">
              {diagnosticTests.map(test => (
                <div 
                  key={test.name} 
                  className="p-3 border rounded-md flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{test.message}</div>
                    <div className="text-sm text-gray-500">{test.name}</div>
                  </div>
                  <div>
                    <StatusIcon status={testResults.get(test.name) || 'pending'} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-3">
              <div className="p-3 border rounded-md">
                <div className="flex items-center mb-2">
                  <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                  <div className="font-medium">Authentication Status</div>
                </div>
                
                <div className="ml-7 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>User authenticated:</span>
                    <span className="font-mono">{authStatus.isAuthenticated ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Admin permissions:</span>
                    <span className="font-mono">{authStatus.isAdmin ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Editor permissions:</span>
                    <span className="font-mono">{authStatus.isEditor ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border rounded-md">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 mr-2 text-blue-500" />
                  <div className="font-medium">Access Control</div>
                </div>
                
                <div className="ml-7 space-y-2 text-sm">
                  <p>Role-based permissions are enforced for the following operations:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>View products (public)</li>
                    <li>Edit products (editors + admins)</li>
                    <li>Delete products (editors + admins)</li>
                    <li>Create products (editors + admins)</li>
                    <li>Access diagnostics (admins only)</li>
                    <li>System settings (admins only)</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* RLS Policies Tab */}
          <TabsContent value="rls">
            <div className="mb-4">
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
              >
                {shopTables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <TableProperties className="h-5 w-5 mr-2 text-slate-500" />
                <h3 className="font-medium">Policies for {selectedTable}</h3>
              </div>
              
              {rlsPolicies[selectedTable]?.length ? (
                rlsPolicies[selectedTable].map((policy, index) => (
                  <div key={index} className="p-3 border rounded-md text-sm">
                    <div className="font-medium mb-1">{policy.policyname}</div>
                    <div className="grid grid-cols-2 gap-1">
                      <span className="text-gray-500">Operation:</span>
                      <span>{policy.cmd}</span>
                      
                      <span className="text-gray-500">Roles:</span>
                      <span>{policy.roles?.join(', ') || 'all'}</span>
                      
                      <span className="text-gray-500">Type:</span>
                      <span>{policy.permissive}</span>
                      
                      <span className="text-gray-500">USING condition:</span>
                      <div className="bg-gray-100 p-1 rounded font-mono text-xs overflow-x-auto">
                        {policy.qual || 'true'}
                      </div>
                      
                      {policy.with_check && (
                        <>
                          <span className="text-gray-500">WITH CHECK:</span>
                          <div className="bg-gray-100 p-1 rounded font-mono text-xs overflow-x-auto">
                            {policy.with_check}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 border rounded-md text-sm text-gray-500">
                  {rlsPolicies[selectedTable] ? 'No policies found' : 'Loading policies...'}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ShopDiagnosticPanel;
