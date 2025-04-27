
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/date";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Award, CheckCircle, ExternalLink, BookOpen, AlertTriangle } from "lucide-react";

interface UserCourseDetailsProps {
  user: any;
  certificateRequirements: {
    min_courses_required: number;
    min_workshops_required: number;
  };
}

export const UserCourseDetails = ({ user, certificateRequirements = { min_courses_required: 5, min_workshops_required: 3 } }: UserCourseDetailsProps) => {
  const getUserCourseDetails = (user: any) => ({
    embeddedCoursesWatched: [
      { title: "Fashion Design 101", watchPercent: 95, date: "2023-05-15" },
      { title: "Advanced Pattern Making", watchPercent: 98, date: "2023-05-20" },
    ],
    externalCoursesVisited: [
      { title: "Digital Fashion Marketing", visitDate: "2023-05-18" },
      { title: "Sustainable Fashion", visitDate: "2023-05-25" },
    ],
    workshopsAttended: [
      { title: "Acting for Models Workshop", date: "2023-06-01" },
      { title: "Portfolio Development", date: "2023-06-15" },
    ],
  });

  // Ensure certificate requirements have default values if undefined
  const minCoursesRequired = certificateRequirements?.min_courses_required || 5;
  const minWorkshopsRequired = certificateRequirements?.min_workshops_required || 3;

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="font-medium flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-emerge-gold" />
            Online Course Progress
          </h3>
          <p className="text-lg font-bold mt-1">{user.online_courses_completed || 0} courses</p>
          <p className="text-xs text-gray-500">Minimum required: {minCoursesRequired}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-emerge-gold" />
            Workshop Attendance
          </h3>
          <p className="text-lg font-bold mt-1">{user.workshops_completed || 0} workshops</p>
          <p className="text-xs text-gray-500">Minimum required: {minWorkshopsRequired}</p>
        </div>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {/* Embedded Courses Section */}
        <AccordionItem value="embedded-courses">
          <AccordionTrigger>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Embedded Courses Watched
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Watch Percentage</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getUserCourseDetails(user).embeddedCoursesWatched.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.watchPercent}%</TableCell>
                    <TableCell>{formatDate(course.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>

        {/* External Courses Section */}
        <AccordionItem value="external-courses">
          <AccordionTrigger>
            <span className="flex items-center">
              <ExternalLink className="h-4 w-4 mr-2 text-blue-600" />
              External Courses Visited
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Visit Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getUserCourseDetails(user).externalCoursesVisited.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{formatDate(course.visitDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>

        {/* Workshops Section */}
        <AccordionItem value="workshops">
          <AccordionTrigger>
            <span className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-emerge-gold" />
              Workshops Attended
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workshop Title</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getUserCourseDetails(user).workshopsAttended.map((workshop, index) => (
                  <TableRow key={index}>
                    <TableCell>{workshop.title}</TableCell>
                    <TableCell>{formatDate(workshop.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
