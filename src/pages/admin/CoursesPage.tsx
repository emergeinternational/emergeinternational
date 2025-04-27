
import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CourseUploadForm from '@/components/admin/CourseUploadForm';
import ScrapedCoursesQueue from '@/components/admin/ScrapedCoursesQueue';
import { Button } from '@/components/ui/button';
import { PlayCircle, PauseCircle, Settings, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const CoursesPage = () => {
  const [isScraperActive, setIsScraperActive] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { toast } = useToast();

  // Simulate starting/stopping the scraper
  const toggleScraper = () => {
    setIsScraperActive(!isScraperActive);
    
    toast({
      title: isScraperActive ? "Scraper Paused" : "Scraper Started",
      description: isScraperActive 
        ? "The course scraper has been paused." 
        : "The course scraper is now running and will collect new courses automatically.",
    });
  };

  // Simulate configuring the scraper
  const configureScraper = () => {
    setIsConfiguring(true);
    
    // Simulate configuration completion
    setTimeout(() => {
      setIsConfiguring(false);
      toast({
        title: "Scraper Configured",
        description: "The scraper settings have been updated successfully.",
      });
    }, 1500);
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Course Management</h2>
          <div className="flex space-x-2">
            <Button
              variant={isScraperActive ? "destructive" : "default"}
              className={isScraperActive ? "" : "bg-emerge-gold hover:bg-emerge-gold/90"}
              onClick={toggleScraper}
              disabled={isConfiguring}
            >
              {isScraperActive ? (
                <>
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Pause Scraper
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Scraper
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={configureScraper}
              disabled={isConfiguring}
            >
              {isConfiguring ? (
                <>
                  <span className="animate-spin mr-2">⌛</span>
                  Configuring...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </>
              )}
            </Button>
          </div>
        </div>

        <Alert className={isScraperActive ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
          <AlertTriangle className={`h-4 w-4 ${isScraperActive ? "text-green-500" : "text-amber-500"}`} />
          <AlertTitle className={isScraperActive ? "text-green-700" : "text-amber-700"}>
            {isScraperActive ? "Scraper is Active" : "Scraper is Inactive"}
          </AlertTitle>
          <AlertDescription className={isScraperActive ? "text-green-600" : "text-amber-600"}>
            {isScraperActive 
              ? "The course scraper is currently running. It will automatically collect and queue new courses for approval." 
              : "The course scraper is currently paused. No new courses will be collected automatically."}
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="manual-upload" className="space-y-4">
          <TabsList>
            <TabsTrigger value="manual-upload">Manual Upload</TabsTrigger>
            <TabsTrigger value="approval-queue">Approval Queue</TabsTrigger>
            <TabsTrigger value="scraper-logs">Scraper Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual-upload" className="space-y-4">
            <CourseUploadForm />
          </TabsContent>
          
          <TabsContent value="approval-queue">
            <ScrapedCoursesQueue />
          </TabsContent>
          
          <TabsContent value="scraper-logs">
            <Card>
              <CardHeader>
                <CardTitle>Scraper Activity Logs</CardTitle>
                <CardDescription>
                  Review the activity and performance of the course scraper
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">2025-04-27 12:34:55</span>
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">SUCCESS</span>
                      </div>
                      <p className="text-gray-700">Successfully scraped 5 new courses from YouTube</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">2025-04-27 11:22:33</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">WARNING</span>
                      </div>
                      <p className="text-gray-700">Rate limit reached for Coursera API</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">2025-04-27 10:15:42</span>
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">SUCCESS</span>
                      </div>
                      <p className="text-gray-700">Successfully scraped 3 new courses from Alison</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">2025-04-27 09:45:18</span>
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">SUCCESS</span>
                      </div>
                      <p className="text-gray-700">Successfully scraped 2 new courses from OpenLearn</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">2025-04-27 08:30:05</span>
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs">ERROR</span>
                      </div>
                      <p className="text-gray-700">Failed to process image for course ID: 7823</p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default CoursesPage;
