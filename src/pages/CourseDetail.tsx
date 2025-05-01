import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Check, Clock } from 'lucide-react';
import { getCourse, markCourseAsCompleted, getCourseProgress } from '@/services/courseService';

interface CourseProgress {
  id?: string;
  user_id: string;
  course_id: string;
  progress: number;
  status?: string;
  date_started?: string;
  date_completed?: string;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;
      setIsLoading(true);
      try {
        const courseData = await getCourse(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  useEffect(() => {
    const fetchCourseProgress = async () => {
      if (!courseId) return;
      try {
        const progressData = await getCourseProgress(courseId);
        setCourseProgress(progressData);
        setIsCompleted(progressData?.status === 'completed');
      } catch (error) {
        console.error("Error fetching course progress:", error);
      }
    };

    fetchCourseProgress();
  }, [courseId]);

  const handleMarkAsCompleted = async () => {
    if (!courseId) return;
    try {
      await markCourseAsCompleted(courseId);
      setIsCompleted(true);
    } catch (error) {
      console.error("Error marking course as completed:", error);
    }
  };

  if (isLoading) {
    return <MainLayout>Loading course details...</MainLayout>;
  }

  if (!course) {
    return <MainLayout>Course not found.</MainLayout>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8">
            <Link to="/courses" className="inline-block mb-4">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
            </Link>

            <h1 className="text-3xl font-semibold mb-4">{course.title}</h1>

            {course.image_url && (
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-64 object-cover rounded-md mb-4"
              />
            )}

            <div className="flex items-center text-gray-600 mb-4">
              <Clock className="mr-2 h-4 w-4" />
              <span>Duration: {course.duration || 'N/A'}</span>
            </div>

            <p className="text-gray-700 mb-4">{course.summary || 'No summary available.'}</p>

            {course.content && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Course Content</h2>
                <div dangerouslySetInnerHTML={{ __html: course.content }} />
              </div>
            )}

            {course.video_embed_url && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Video Preview</h2>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={course.video_embed_url}
                    title="Course Video"
                    allowFullScreen
                    className="rounded-md"
                  ></iframe>
                </div>
              </div>
            )}

            {course.external_link && (
              <Button asChild>
                <a href={course.external_link} target="_blank" rel="noopener noreferrer">
                  Enroll Now
                </a>
              </Button>
            )}

            {!isCompleted && (
              <Button onClick={handleMarkAsCompleted} className="mt-4">
                Mark as Completed
              </Button>
            )}

            {isCompleted && (
              <div className="flex items-center mt-4 text-green-600">
                <Check className="mr-2 h-4 w-4" />
                <span>Course Completed</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CourseDetail;
