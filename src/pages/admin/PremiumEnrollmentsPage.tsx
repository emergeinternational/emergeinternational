
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/layouts/AdminLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from 'date-fns';
import { getAdminPremiumEnrollments, PremiumEnrollment } from "@/services/premiumCourseService";

const PremiumEnrollmentsPage = () => {
  const { hasRole } = useAuth();
  const [enrollments, setEnrollments] = useState<PremiumEnrollment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [courseTitle, setCourseTitle] = useState('');
  const [activeFilter, setActiveFilter] = useState<'active' | 'inactive' | ''>('');

  const pageSize = 20;

  useEffect(() => {
    if (!hasRole(['admin'])) return;

    const fetchEnrollments = async () => {
      const { enrollments, totalCount } = await getAdminPremiumEnrollments({
        page,
        pageSize,
        courseTitle,
        activeFilter: activeFilter || undefined
      });
      setEnrollments(enrollments);
      setTotalCount(totalCount);
    };

    fetchEnrollments();
  }, [page, courseTitle, activeFilter]);

  if (!hasRole(['admin'])) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Premium Course Enrollments</h1>
        
        <div className="flex space-x-4 mb-6">
          <Input 
            placeholder="Filter by Course Title" 
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="w-1/3"
          />
          
          <Select 
            value={activeFilter} 
            onValueChange={(value: 'active' | 'inactive' | '') => setActiveFilter(value)}
          >
            <SelectTrigger className="w-1/4">
              <SelectValue placeholder="Activity Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Enrollments</SelectItem>
              <SelectItem value="active">Active Enrollments</SelectItem>
              <SelectItem value="inactive">Inactive Enrollments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Title</TableHead>
              <TableHead>User Email</TableHead>
              <TableHead>Enrollment Date</TableHead>
              <TableHead>Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>{enrollment.course?.title || 'N/A'}</TableCell>
                <TableCell>{enrollment.user?.email || 'N/A'}</TableCell>
                <TableCell>
                  {format(new Date(enrollment.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(enrollment.last_activity_date), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-between items-center mt-4">
          <span>Total Enrollments: {totalCount}</span>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setPage(p => p + 1)} 
              disabled={page * pageSize >= totalCount}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PremiumEnrollmentsPage;
