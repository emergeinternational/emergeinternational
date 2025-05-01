
import React, { useState } from 'react';
import AdminLayout from "../../layouts/AdminLayout";
import ScrapedCoursesQueue from "../../components/admin/ScrapedCoursesQueue";
import { Toaster } from "@/components/ui/toaster";
import PageLock from "../../components/admin/PageLock";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ScrapedCoursesPage = () => {
  const [pageLocked, setPageLocked] = useState(true);
  const { userRole, hasRole } = useAuth();
  const [isTriggering, setIsTriggering] = useState(false);

  const handleLockStatusChange = (isLocked: boolean) => {
    setPageLocked(isLocked);
  };

  const handleManualScrape = async () => {
    if (pageLocked) {
      alert("Please unlock the page to run a manual scrape");
      return;
    }
    
    if (!hasRole(['admin', 'editor'])) {
      alert("You don't have permission to run a manual scrape");
      return;
    }
    
    setIsTriggering(true);
    
    try {
      // This would typically call your scraper API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert("Scraper triggered successfully. New courses should appear shortly.");
    } catch (error) {
      alert("Error triggering scraper. Please try again.");
      console.error("Scraper error:", error);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Course Content Approval</h1>
            <p className="text-sm text-gray-500">
              Review and approve automatically scraped course content
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleManualScrape} 
              disabled={pageLocked || isTriggering}
              className="flex items-center gap-2"
            >
              {isTriggering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>Run Manual Scrape</>
              )}
            </Button>
            
            <PageLock 
              userRole={userRole} 
              pageId="scrapedCoursesPage" 
              onLockStatusChange={handleLockStatusChange} 
            />
          </div>
        </div>
        
        {pageLocked && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              This page is currently locked. Only viewing is available.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scraped Course Approval</CardTitle>
              <CardDescription>
                Review and approve or reject courses scraped from various sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrapedCoursesQueue />
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default ScrapedCoursesPage;
