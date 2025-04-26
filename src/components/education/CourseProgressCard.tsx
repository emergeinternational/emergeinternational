
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserCourseEnrollment } from "@/types/education";
import { useNavigate } from "react-router-dom";
import { Play, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface CourseProgressCardProps {
  enrollment: UserCourseEnrollment;
}

export function CourseProgressCard({ enrollment }: CourseProgressCardProps) {
  const navigate = useNavigate();
  
  const isCompleted = enrollment.status === 'completed';
  
  const handleContinue = () => {
    navigate(`/education/course/${enrollment.courseId}`);
  };
  
  return (
    <Card className="bg-white/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white truncate max-w-[300px]">
                Course Title
              </h4>
              <div className="flex items-center text-xs text-gray-400">
                {isCompleted ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-emerge-gold mr-1" />
                    Completed on {enrollment.completedAt && format(new Date(enrollment.completedAt), 'MMM d, yyyy')}
                  </>
                ) : (
                  <>Started on {format(new Date(enrollment.startedAt), 'MMM d, yyyy')}</>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">{enrollment.progressPercent}%</span>
              </div>
              <Progress value={enrollment.progressPercent} className="h-2" />
            </div>
          </div>
          
          <Button 
            onClick={handleContinue} 
            className="whitespace-nowrap"
            disabled={isCompleted}
          >
            <Play className="h-4 w-4 mr-2" />
            {isCompleted ? 'Review Course' : 'Continue Learning'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
