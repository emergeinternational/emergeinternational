
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getProducts } from '@/services/shopService';
import { getShopSystemSettings } from '@/services/shopSystemService';
import { getAuthStatus } from '@/services/shopAuthService';
import { DiagnosticTest, DiagnosticStatus, DiagnosticTestResult, RLSPolicy } from '@/types/shop';

interface ShopDiagnosticPanelProps {
  onResults?: (results: any) => void;
}

const ShopDiagnosticPanel: React.FC<ShopDiagnosticPanelProps> = ({ onResults }) => {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  const [runStartTime, setRunStartTime] = useState<Date | null>(null);
  const [runEndTime, setRunEndTime] = useState<Date | null>(null);

  // Initialize tests
  useEffect(() => {
    const baseTests: DiagnosticTest[] = [
      {
        name: 'Supabase Connection',
        message: 'Checking Supabase connection...',
        status: 'pending',
        details: {},
        runTest: async () => {
          try {
            const { data, error } = await supabase.from('shop_products').select('count(*)').limit(1).single();
            
            if (error) {
              throw error;
            }
            
            const result: DiagnosticTestResult = {
              status: 'success',
              details: { connectionSuccessful: true }
            };
            updateTestResult('Supabase Connection', result);
          } catch (error) {
            const result: DiagnosticTestResult = {
              status: 'error',
              details: { error }
            };
            updateTestResult('Supabase Connection', result);
          }
        }
      },
      {
        name: 'Product Fetch',
        message: 'Testing product retrieval...',
        status: 'pending',
        details: {},
        runTest: async () => {
          try {
            const products = await getProducts();
            
            const result: DiagnosticTestResult = {
              status: products.length > 0 ? 'success' : 'warning',
              details: { 
                count: products.length,
                products: products.slice(0, 3),
                hasPublishedProducts: products.some(p => p.status === 'published'),
                hasMissingImages: products.some(p => !p.image_url)
              }
            };
            
            updateTestResult('Product Fetch', result);
          } catch (error) {
            const result: DiagnosticTestResult = {
              status: 'error',
              details: { error }
            };
            updateTestResult('Product Fetch', result);
          }
        }
      },
      {
        name: 'Authentication Status',
        message: 'Checking user authentication...',
        status: 'pending',
        details: {},
        runTest: async () => {
          try {
            const { isAuthenticated, isAdmin, isEditor, role } = getAuthStatus();
            
            const result: DiagnosticTestResult = {
              status: isAuthenticated ? 'success' : 'warning',
              details: { isAuthenticated, isAdmin, isEditor, role }
            };
            
            updateTestResult('Authentication Status', result);
          } catch (error) {
            const result: DiagnosticTestResult = {
              status: 'error',
              details: { error }
            };
            updateTestResult('Authentication Status', result);
          }
        }
      },
      {
        name: 'System Settings',
        message: 'Checking shop system settings...',
        status: 'pending',
        details: {},
        runTest: async () => {
          try {
            const settings = await getShopSystemSettings();
            
            const result: DiagnosticTestResult = {
              status: 'success',
              details: { settings }
            };
            
            updateTestResult('System Settings', result);
          } catch (error) {
            const result: DiagnosticTestResult = {
              status: 'error',
              details: { error }
            };
            updateTestResult('System Settings', result);
          }
        }
      },
      {
        name: 'Row Level Security',
        message: 'Checking RLS policies...',
        status: 'pending',
        details: {},
        runTest: async () => {
          try {
            const { data, error } = await supabase.rpc('get_policies_for_table', {
              table_name: 'shop_products'
            });
            
            if (error) throw error;
            
            const policies = data as RLSPolicy[];
            
            const result: DiagnosticTestResult = {
              status: policies.length > 0 ? 'success' : 'warning',
              details: { policies }
            };
            
            updateTestResult('Row Level Security', result);
          } catch (error) {
            const result: DiagnosticTestResult = {
              status: 'error',
              details: { error }
            };
            updateTestResult('Row Level Security', result);
          }
        }
      }
    ];
    
    setTests(baseTests);
  }, []);

  const updateTestResult = (testName: string, result: DiagnosticTestResult) => {
    setTests(prevTests => 
      prevTests.map(test => 
        test.name === testName 
          ? { ...test, status: result.status, details: result.details } 
          : test
      )
    );
  };

  const runAllTests = async () => {
    try {
      setRunningTests(true);
      setRunStartTime(new Date());
      setRunEndTime(null);
      
      // Reset all tests to pending
      setTests(prevTests => 
        prevTests.map(test => ({ ...test, status: 'pending' as DiagnosticStatus, details: {} }))
      );
      
      // Run all tests in sequence
      for (const test of tests) {
        await test.runTest();
      }
      
      // Notify completion
      const endTime = new Date();
      setRunEndTime(endTime);
      const duration = endTime.getTime() - (runStartTime?.getTime() || endTime.getTime());
      
      toast.success(`All diagnostic tests completed in ${duration}ms`);
      
      // Send results if callback provided
      if (onResults) {
        onResults({
          results: tests,
          startTime: runStartTime,
          endTime,
          duration
        });
      }
    } catch (error) {
      console.error("Error running diagnostic tests:", error);
      toast.error("Failed to run some diagnostic tests");
    } finally {
      setRunningTests(false);
    }
  };

  const getStatusIcon = (status: DiagnosticStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStatusColor = (status: DiagnosticStatus) => {
    switch (status) {
      case 'success': return 'bg-green-50 text-green-700 border-green-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'running': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (status: DiagnosticStatus) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-amber-100 text-amber-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-emerge-gold">
      <CardHeader className="bg-emerge-gold/10">
        <CardTitle className="text-emerge-gold flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Shop Diagnostic Panel
        </CardTitle>
        <CardDescription>
          Run diagnostics to identify issues with the shop system
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <Button 
              onClick={runAllTests} 
              disabled={runningTests}
              className="bg-emerge-gold hover:bg-emerge-gold/90 text-white"
            >
              {runningTests && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Run All Tests
            </Button>
          </div>
          
          {runEndTime && (
            <div className="text-xs text-gray-500">
              Last run: {runEndTime.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {tests.map((test, index) => (
            <Accordion key={index} type="single" collapsible>
              <AccordionItem value={`item-${index}`} className={`border rounded-md ${getStatusColor(test.status)}`}>
                <AccordionTrigger className="px-4 py-2 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      {getStatusIcon(test.status)}
                      <span className="ml-2">{test.name}</span>
                    </div>
                    <Badge className={getStatusBadge(test.status)}>
                      {test.status.toUpperCase()}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 bg-white rounded-b-md">
                  <div className="text-sm">{test.message}</div>
                  {test.details && Object.keys(test.details).length > 0 && (
                    <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopDiagnosticPanel;
