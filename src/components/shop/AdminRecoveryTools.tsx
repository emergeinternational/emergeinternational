
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DatabaseZap, 
  Loader2,
  Download,
  Upload,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthStatus } from "@/services/shopAuthService";
import { generateMockProducts, toggleRecoveryMode } from "@/services/shopSystemService";
import { supabase } from "@/integrations/supabase/client";

/**
 * Admin-only component that provides recovery tools for the shop
 * including data seeding and recovery mode controls
 */
const AdminRecoveryTools: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [seedCount, setSeedCount] = useState(5);
  const { toast } = useToast();
  const { isAdmin } = getAuthStatus();
  
  // If not admin, don't render anything
  if (!isAdmin) {
    return null;
  }
  
  // Handle generating mock products
  const handleGenerateMockProducts = async () => {
    try {
      setIsLoading(true);
      
      // Validate seed count
      if (seedCount < 1 || seedCount > 50) {
        toast({
          title: "Invalid count",
          description: "Please enter a value between 1 and 50",
          variant: "destructive"
        });
        return;
      }
      
      const success = await generateMockProducts(seedCount);
      
      if (success) {
        toast({
          title: "Mock products generated",
          description: `Successfully created ${seedCount} mock products`,
        });
      } else {
        throw new Error("Failed to generate mock products");
      }
    } catch (error) {
      console.error("Error generating mock products:", error);
      toast({
        title: "Error",
        description: "Failed to generate mock products",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle enabling emergency recovery mode
  const handleEnableEmergencyRecovery = async () => {
    try {
      setIsLoading(true);
      
      // Enable recovery mode with 'full' fallback level
      const success = await toggleRecoveryMode(true, 'full');
      
      if (success) {
        toast({
          title: "Emergency Recovery Mode",
          description: "Full recovery mode has been enabled",
        });
      } else {
        throw new Error("Failed to enable emergency recovery mode");
      }
    } catch (error) {
      console.error("Error enabling emergency recovery:", error);
      toast({
        title: "Error",
        description: "Failed to enable emergency recovery",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a product snapshot
  const handleCreateSnapshot = async () => {
    try {
      setIsLoading(true);
      
      // Call the RPC function to create a snapshot
      const { data, error } = await supabase.rpc('create_product_snapshot');
      
      if (error) throw error;
      
      toast({
        title: "Snapshot Created",
        description: "Successfully created product snapshot",
      });
    } catch (error) {
      console.error("Error creating snapshot:", error);
      toast({
        title: "Error",
        description: "Failed to create product snapshot",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-4 border border-yellow-300 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="font-medium text-yellow-800">Admin Shop Recovery Tools</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Mock Data Generator */}
          <div className="space-y-2 bg-white p-3 rounded-md border border-gray-200 shadow-sm">
            <h4 className="text-sm font-medium flex items-center">
              <DatabaseZap className="h-4 w-4 mr-1 text-blue-500" />
              Mockup Data Generator
            </h4>
            <div className="flex items-center space-x-2">
              <div className="space-y-1 flex-1">
                <Label htmlFor="seedCount" className="text-xs">Number of products</Label>
                <Input
                  id="seedCount"
                  type="number"
                  min={1}
                  max={50}
                  value={seedCount}
                  onChange={(e) => setSeedCount(parseInt(e.target.value) || 5)}
                  className="h-8"
                />
              </div>
              <Button 
                size="sm" 
                onClick={handleGenerateMockProducts}
                disabled={isLoading}
                className="mt-5"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : "Generate"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Generates mock products to populate the shop
            </p>
          </div>
          
          {/* Create Product Snapshot */}
          <div className="space-y-2 bg-white p-3 rounded-md border border-gray-200 shadow-sm">
            <h4 className="text-sm font-medium flex items-center">
              <Download className="h-4 w-4 mr-1 text-green-500" />
              Create Product Snapshot
            </h4>
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={handleCreateSnapshot}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : "Backup Now"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Creates a JSON backup of all products
            </p>
          </div>
          
          {/* Emergency Recovery Mode */}
          <div className="space-y-2 bg-white p-3 rounded-md border border-gray-200 shadow-sm">
            <h4 className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
              Emergency Recovery
            </h4>
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={handleEnableEmergencyRecovery}
                disabled={isLoading}
                variant="destructive"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : "Enable Recovery"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Activates full fallback rendering mode
            </p>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          These tools are only visible to administrators. They help recover from data loss or UI rendering issues.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminRecoveryTools;
