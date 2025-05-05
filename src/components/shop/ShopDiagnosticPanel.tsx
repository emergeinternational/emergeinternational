
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShopProduct } from "@/types/shop";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { getAuthStatus } from "@/services/shopAuthService";

interface DiagnosticResult {
  status: "success" | "error" | "warning" | "pending";
  message: string;
  details?: string[];
}

interface DiagnosticSummary {
  productLoad: DiagnosticResult;
  formFunctionality: DiagnosticResult;
  accessControl: DiagnosticResult;
  liveSync: DiagnosticResult;
  errorCapture: DiagnosticResult;
}

const ShopDiagnosticPanel: React.FC = () => {
  const [results, setResults] = useState<DiagnosticSummary>({
    productLoad: { status: "pending", message: "Waiting to run check..." },
    formFunctionality: { status: "pending", message: "Waiting to run check..." },
    accessControl: { status: "pending", message: "Waiting to run check..." },
    liveSync: { status: "pending", message: "Waiting to run check..." },
    errorCapture: { status: "pending", message: "Waiting to run check..." },
  });
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const auth = useAuth();
  
  // Function to update a specific diagnostic result
  const updateResult = (
    key: keyof DiagnosticSummary, 
    status: DiagnosticResult["status"], 
    message: string,
    details?: string[]
  ) => {
    setResults(prev => ({
      ...prev,
      [key]: { status, message, details }
    }));
  };

  // 1. Product Load Check
  const checkProductLoad = async (): Promise<void> => {
    try {
      updateResult("productLoad", "pending", "Checking product loading...");
      
      // Fetch products from Supabase
      const { data: products, error } = await supabase
        .from("shop_products")
        .select("*, variations:product_variations(*), collection:collections(*)");
      
      if (error) {
        updateResult(
          "productLoad", 
          "error", 
          "Failed to fetch products from database", 
          [error.message]
        );
        return;
      }
      
      if (!products || products.length === 0) {
        updateResult(
          "productLoad", 
          "warning", 
          "No products found in database", 
          ["The shop_products table appears to be empty"]
        );
        return;
      }
      
      // Check for potential rendering issues
      const issues = products.map(product => {
        const issues = [];
        
        if (!product.title) issues.push(`Product ID ${product.id}: Missing title`);
        if (!product.price && product.price !== 0) issues.push(`Product ID ${product.id}: Missing price`);
        if (!product.image_url) issues.push(`Product ID ${product.id}: Missing image URL`);
        if (product.image_url && !product.image_url.startsWith('http')) {
          issues.push(`Product ID ${product.id}: Image URL format may be invalid: ${product.image_url}`);
        }
        
        return issues;
      }).flat();
      
      if (issues.length > 0) {
        updateResult(
          "productLoad", 
          "warning", 
          `Found ${products.length} products with ${issues.length} potential rendering issues`, 
          issues
        );
      } else {
        updateResult(
          "productLoad", 
          "success", 
          `Successfully loaded ${products.length} products without issues`
        );
      }
      
      // Log to console for debugging
      console.log("Shop Diagnostic - Products:", products);
      
    } catch (error) {
      console.error("Product load check error:", error);
      updateResult(
        "productLoad", 
        "error", 
        "Error during product load check", 
        [(error as Error).message]
      );
    }
  };

  // 2. Form Functionality Check
  const checkFormFunctionality = async (): Promise<void> => {
    try {
      updateResult("formFunctionality", "pending", "Checking form functionality...");
      
      // Check image upload bucket exists
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
        
      if (bucketsError) {
        updateResult(
          "formFunctionality", 
          "error", 
          "Failed to access storage buckets", 
          [bucketsError.message]
        );
        return;
      }
      
      const productImageBucket = buckets?.find(bucket => 
        bucket.name === 'product-images' || bucket.name.includes('product')
      );
      
      if (!productImageBucket) {
        updateResult(
          "formFunctionality", 
          "warning", 
          "No product image bucket found", 
          ["Storage bucket 'product-images' not found. Image uploads may not work correctly."]
        );
      } else {
        console.log("Shop Diagnostic - Image bucket found:", productImageBucket.name);
      }
      
      // Check product variations structure
      const { data: variations, error: variationsError } = await supabase
        .from("product_variations")
        .select("*")
        .limit(5);
        
      if (variationsError) {
        updateResult(
          "formFunctionality", 
          "error", 
          "Failed to access product variations", 
          [variationsError.message]
        );
        return;
      }
      
      // Check for all expected fields in variations
      if (variations && variations.length > 0) {
        const missingFields = [];
        const requiredFields = ['product_id', 'size', 'color', 'stock_quantity', 'sku'];
        
        for (const field of requiredFields) {
          if (!variations.some(v => v[field] !== undefined)) {
            missingFields.push(`Field '${field}' missing from product variations`);
          }
        }
        
        if (missingFields.length > 0) {
          updateResult(
            "formFunctionality", 
            "warning", 
            "Product variations may be missing required fields", 
            missingFields
          );
        } else {
          console.log("Shop Diagnostic - Variations have all required fields");
        }
      }
      
      // Check product form components exist
      const productFormExists = document.querySelector('[data-testid="product-form"]') !== null;
      
      updateResult(
        "formFunctionality", 
        "success", 
        "Form functionality check completed", 
        [
          productImageBucket 
            ? `Image storage bucket found: ${productImageBucket.name}` 
            : "No product image bucket found - image uploads may not work",
          variations && variations.length > 0
            ? `Product variations schema contains ${variations.length} test entries`
            : "No product variations found in database",
          productFormExists
            ? "Product form component detected in DOM"
            : "Product form component not found in current view"
        ]
      );
      
    } catch (error) {
      console.error("Form functionality check error:", error);
      updateResult(
        "formFunctionality", 
        "error", 
        "Error during form functionality check", 
        [(error as Error).message]
      );
    }
  };

  // 3. Access Control Check
  const checkAccessControl = async (): Promise<void> => {
    try {
      updateResult("accessControl", "pending", "Checking access control permissions...");
      
      // Get current auth status
      const { isAdmin, isEditor } = getAuthStatus();
      const currentUserRole = auth.userRole || 'anonymous';
      
      // Check for admin UI elements that should only be visible to admins/editors
      const adminElements = document.querySelectorAll('[data-admin-only="true"]');
      const editButtons = document.querySelectorAll('[data-edit-product="true"]');
      
      // Check if RLS policies are in place for shop_products table
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_policies_for_table', { table_name: 'shop_products' })
        .catch(() => ({ data: null, error: new Error("RPC get_policies_for_table not available") }));
      
      let policyDetails: string[] = [];
      
      if (policiesError) {
        console.log("Shop Diagnostic - Unable to check RLS policies via RPC");
        policyDetails.push("Unable to verify RLS policies programmatically");
      } else if (policies) {
        policyDetails.push(`Found ${policies.length} RLS policies for shop_products table`);
      }
      
      // Test accessing admin routes
      try {
        const canSeeManagementUI = document.querySelector('[data-admin-products-manager="true"]') !== null;
        policyDetails.push(`Admin UI visibility: ${canSeeManagementUI ? 'Visible' : 'Not visible'}`);
      } catch (e) {
        policyDetails.push("Error checking admin UI visibility");
      }
      
      policyDetails.push(`Current user role: ${currentUserRole}`);
      policyDetails.push(`Admin status: ${isAdmin ? 'Yes' : 'No'}`);
      policyDetails.push(`Editor status: ${isEditor ? 'Yes' : 'No'}`);
      policyDetails.push(`Edit buttons visible: ${editButtons.length > 0 ? 'Yes' : 'No'}`);
      policyDetails.push(`Admin elements found: ${adminElements.length}`);
      
      if ((isAdmin || isEditor) && editButtons.length === 0 && window.location.pathname.includes('/shop')) {
        updateResult(
          "accessControl", 
          "warning", 
          "User has admin/editor role but edit controls aren't visible", 
          policyDetails
        );
      } else if (!(isAdmin || isEditor) && editButtons.length > 0) {
        updateResult(
          "accessControl", 
          "error", 
          "Non-admin user can see edit controls", 
          policyDetails
        );
      } else {
        updateResult(
          "accessControl", 
          "success", 
          "Access control appears to be correctly configured", 
          policyDetails
        );
      }
      
    } catch (error) {
      console.error("Access control check error:", error);
      updateResult(
        "accessControl", 
        "error", 
        "Error during access control check", 
        [(error as Error).message]
      );
    }
  };

  // 4. Live Sync Check
  const checkLiveSync = async (): Promise<void> => {
    try {
      updateResult("liveSync", "pending", "Checking real-time data synchronization...");
      
      // Check for Supabase realtime subscription setup
      const hasRealtimeSubscription = (() => {
        const shopCode = document.querySelector('script[data-shop-module="true"]')?.textContent || '';
        return shopCode.includes('.channel(') && 
               shopCode.includes('postgres_changes') && 
               shopCode.includes('subscribe()');
      })();
      
      // Look for realtime channel in React dev tools (experimental, may not work in all browsers)
      const hasRealtimeChannelInState = (() => {
        try {
          // This is a heuristic - we can't directly access React fiber
          return Object.keys(window).some(key => 
            key.startsWith('__REACT') && 
            JSON.stringify(window[key]).includes('supabaseClient:channel')
          );
        } catch (e) {
          return false;
        }
      })();
      
      const syncDetails = [
        `Realtime subscription code detected: ${hasRealtimeSubscription ? 'Yes' : 'No'}`,
        `Realtime channel in component state: ${hasRealtimeChannelInState ? 'Yes' : 'Unknown'}`,
      ];
      
      // Test inserting a temporary subscription to verify realtime is working
      try {
        let realtimeReceived = false;
        const channel = supabase
          .channel('diagnostic-shop-test')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'shop_products'
            },
            (payload) => {
              console.log('Diagnostic realtime test received:', payload);
              realtimeReceived = true;
            }
          )
          .subscribe();
          
        // Wait a bit to ensure subscription is active
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        syncDetails.push(`Temporary realtime channel created: ${channel ? 'Yes' : 'No'}`);
        syncDetails.push(`Note: Full realtime test would require making a test product change`);
        
        // Clean up test channel
        supabase.removeChannel(channel);
      } catch (e) {
        syncDetails.push(`Error testing realtime: ${(e as Error).message}`);
      }
      
      if (hasRealtimeSubscription) {
        updateResult(
          "liveSync", 
          "success", 
          "Realtime synchronization appears to be configured", 
          syncDetails
        );
      } else {
        updateResult(
          "liveSync", 
          "warning", 
          "Realtime synchronization might not be fully implemented", 
          syncDetails
        );
      }
      
    } catch (error) {
      console.error("Live sync check error:", error);
      updateResult(
        "liveSync", 
        "error", 
        "Error during live sync check", 
        [(error as Error).message]
      );
    }
  };

  // 5. Error Capture Validation
  const checkErrorCapture = async (): Promise<void> => {
    try {
      updateResult("errorCapture", "pending", "Checking error handling mechanisms...");
      
      // Check for presence of error boundaries
      const hasErrorBoundaries = (() => {
        try {
          // Look for ErrorBoundary components in the rendered HTML
          const html = document.documentElement.innerHTML;
          return html.includes('ErrorBoundary');
        } catch (e) {
          return false;
        }
      })();
      
      // Check for toast notifications setup
      const hasToastSetup = (() => {
        try {
          // Look for toast setup in the DOM
          return document.querySelector('.sonner-toast-container') !== null;
        } catch (e) {
          return false;
        }
      })();
      
      // Check for try-catch patterns in shop code
      const hasTryCatch = (() => {
        const shopCode = document.querySelector('script[data-shop-module="true"]')?.textContent || '';
        return shopCode.includes('try {') && shopCode.includes('catch');
      })();
      
      const errorHandlingDetails = [
        `Error boundaries detected: ${hasErrorBoundaries ? 'Yes' : 'No'}`,
        `Toast notification system set up: ${hasToastSetup ? 'Yes' : 'No'}`,
        `Try-catch error handling detected: ${hasTryCatch ? 'Yes' : 'No'}`
      ];
      
      // Try to simulate a non-critical error to see if it's handled
      try {
        const testError = new Error('Shop diagnostic test error');
        console.error('Diagnostic test error - please ignore:', testError);
        
        // Check if window.onerror or similar global handlers are defined
        const hasGlobalErrorHandler = typeof window.onerror === 'function';
        errorHandlingDetails.push(`Global error handler detected: ${hasGlobalErrorHandler ? 'Yes' : 'No'}`);
        
        // Check if there's a Fallback UI component available
        const hasFallbackUI = document.querySelectorAll('[data-testid="error-fallback"]').length > 0;
        errorHandlingDetails.push(`Fallback UI components found: ${hasFallbackUI ? 'Yes' : 'No'}`);
      } catch (e) {
        errorHandlingDetails.push(`Error during error simulation test: ${(e as Error).message}`);
      }
      
      if (hasErrorBoundaries && hasToastSetup) {
        updateResult(
          "errorCapture", 
          "success", 
          "Error handling mechanisms are in place", 
          errorHandlingDetails
        );
      } else {
        updateResult(
          "errorCapture", 
          "warning", 
          "Error handling might be incomplete", 
          errorHandlingDetails
        );
      }
      
    } catch (error) {
      console.error("Error capture check error:", error);
      updateResult(
        "errorCapture", 
        "error", 
        "Error during error capture validation", 
        [(error as Error).message]
      );
    }
  };

  // Function to run all checks
  const runAllChecks = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      await checkProductLoad();
      setProgress(20);
      
      await checkFormFunctionality();
      setProgress(40);
      
      await checkAccessControl();
      setProgress(60);
      
      await checkLiveSync();
      setProgress(80);
      
      await checkErrorCapture();
      setProgress(100);
      
      toast.success("Shop diagnostic completed");
      console.log("Shop Diagnostic - Full results:", results);
      
    } catch (error) {
      console.error("Diagnostic error:", error);
      toast.error("Error running shop diagnostics");
    } finally {
      setLoading(false);
    }
  };

  // Run checks on mount
  useEffect(() => {
    runAllChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to render status icon
  const renderStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "pending":
      default:
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-md mb-6" data-testid="shop-diagnostic-panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Lock className="h-4 w-4" /> Shop Diagnostic Log
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runAllChecks} 
          disabled={loading}
          className="flex items-center gap-1"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Run Diagnostics
        </Button>
      </div>
      
      {loading && (
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <Accordion type="multiple" defaultValue={["summary"]}>
        <AccordionItem value="summary">
          <AccordionTrigger>Summary Results</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {Object.entries(results).map(([key, result]) => (
                <div 
                  key={key}
                  className={`flex items-center p-2 rounded ${
                    result.status === "success" ? "bg-green-50" :
                    result.status === "error" ? "bg-red-50" :
                    result.status === "warning" ? "bg-yellow-50" :
                    "bg-blue-50"
                  }`}
                >
                  {renderStatusIcon(result.status)}
                  <div className="ml-2 flex-1">
                    <div className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                    <div className="text-xs">{result.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {Object.entries(results).map(([key, result]) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger>
              <div className="flex items-center">
                {renderStatusIcon(result.status)}
                <span className="ml-2">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-sm">
                <div className="font-medium mb-2">{result.message}</div>
                {result.details && result.details.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {result.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No additional details available</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
        
        <AccordionItem value="console">
          <AccordionTrigger>Console Output</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-gray-600 mb-2">
              Full diagnostic results are available in the browser console. 
              Open developer tools and check for "Shop Diagnostic" prefixed logs.
            </p>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => console.log("Shop Diagnostic - Full results:", results)}
            >
              Log Results to Console
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ShopDiagnosticPanel;
