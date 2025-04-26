
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserEnrollments, getUserCertificates, checkCategoryCompletion } from "@/services/courseService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CertificateCard } from "./CertificateCard";
import { CourseProgressCard } from "./CourseProgressCard";
import { MedalIcon, BookOpenCheck, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function LearningDashboard() {
  const [activeTab, setActiveTab] = useState('in-progress');
  const { toast } = useToast();

  const { 
    data: enrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError
  } = useQuery({
    queryKey: ["userEnrollments"],
    queryFn: getUserEnrollments
  });

  const {
    data: certificates,
    isLoading: isLoadingCertificates,
    error: certificatesError
  } = useQuery({
    queryKey: ["userCertificates"],
    queryFn: getUserCertificates
  });

  // Check if user has completed all courses in each category
  const { data: categoryCompletions } = useQuery({
    queryKey: ["categoryCompletions", enrollments],
    queryFn: async () => {
      if (!enrollments) return {};
      
      // Get unique category IDs from enrollments
      const categoryIds = [...new Set(enrollments
        .filter(e => e.status === 'completed')
        .map(e => e.courseId)
      )];
      
      const completions: Record<string, boolean> = {};
      for (const categoryId of categoryIds) {
        completions[categoryId] = await checkCategoryCompletion(categoryId);
      }
      
      return completions;
    },
    enabled: !!enrollments
  });

  if (enrollmentsError) {
    toast({
      title: "Error",
      description: "Failed to load your course progress. Please try again.",
      variant: "destructive"
    });
  }
  
  if (certificatesError) {
    toast({
      title: "Error",
      description: "Failed to load your certificates. Please try again.",
      variant: "destructive"
    });
  }

  const inProgressCourses = enrollments?.filter(
    enrollment => enrollment.status === 'not_started' || enrollment.status === 'in_progress'
  ) || [];
  
  const completedCourses = enrollments?.filter(
    enrollment => enrollment.status === 'completed'
  ) || [];

  return (
    <div className="bg-emerge-darkBg/50 rounded-lg border border-gray-800 p-6">
      <h2 className="text-2xl font-serif text-emerge-gold mb-6">Your Learning Journey</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 border-b w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="in-progress"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-emerge-gold data-[state=active]:bg-transparent"
          >
            <BookOpenCheck className="h-4 w-4 mr-2" />
            In Progress
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-emerge-gold data-[state=active]:bg-transparent"
          >
            <MedalIcon className="h-4 w-4 mr-2" />
            Completed
          </TabsTrigger>
          <TabsTrigger 
            value="certificates"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-emerge-gold data-[state=active]:bg-transparent"
          >
            <Award className="h-4 w-4 mr-2" />
            Certificates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="in-progress" className="space-y-4">
          {isLoadingEnrollments ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-gray-800/50 rounded"></div>
              ))}
            </div>
          ) : inProgressCourses.length > 0 ? (
            <>
              {inProgressCourses.map(enrollment => (
                <CourseProgressCard 
                  key={enrollment.id} 
                  enrollment={enrollment} 
                />
              ))}
            </>
          ) : (
            <Alert>
              <AlertDescription>
                You're not currently enrolled in any courses. Browse our catalog to start learning!
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {isLoadingEnrollments ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-gray-800/50 rounded"></div>
              ))}
            </div>
          ) : completedCourses.length > 0 ? (
            <>
              {completedCourses.map(enrollment => (
                <CourseProgressCard 
                  key={enrollment.id} 
                  enrollment={enrollment} 
                />
              ))}
            </>
          ) : (
            <Alert>
              <AlertDescription>
                You haven't completed any courses yet. Keep learning to earn certificates!
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="certificates" className="space-y-4">
          {isLoadingCertificates ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-gray-800/50 rounded"></div>
              ))}
            </div>
          ) : certificates && certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map(certificate => (
                <CertificateCard 
                  key={certificate.id} 
                  certificate={certificate} 
                />
              ))}
              
              {/* Display category mastery certificates if available */}
              {categoryCompletions && Object.entries(categoryCompletions)
                .filter(([_, isComplete]) => isComplete)
                .map(([categoryId]) => (
                  <CertificateCard
                    key={`category-${categoryId}`}
                    certificate={{
                      id: `category-${categoryId}`,
                      userId: '',
                      categoryId: categoryId,
                      issueDate: new Date().toISOString(),
                      type: 'category',
                      title: 'Emerge International Certificate',
                      downloadUrl: `/api/certificates/category/${categoryId}`
                    }}
                  />
                ))
              }
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Complete courses to earn certificates that showcase your accomplishments!
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
