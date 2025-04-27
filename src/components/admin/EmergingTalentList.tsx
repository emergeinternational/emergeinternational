import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowUpDown } from "lucide-react";
import { DateRangeFilter } from "./talents/DateRangeFilter";
import { format } from "date-fns";

interface EmergingTalent {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  age: number | null;
  category: string;
  gender: string;
  instagram: string | null;
  telegram: string | null;
  talent_description: string | null;
  measurements: Record<string, string> | null;
  portfolio_url: string | null;
  created_at: string;
}

const EmergingTalentList = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  const { data: submissions, isLoading, refetch } = useQuery({
    queryKey: ['emerge-submissions', startDate, endDate, sortDirection],
    queryFn: async () => {
      let query = supabase
        .from('emerge_submissions')
        .select('*')
        .order('created_at', { ascending: sortDirection === 'asc' });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('created_at', nextDay.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching submissions:", error);
        throw error;
      }

      return data as EmergingTalent[];
    }
  });

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
      toast({
        title: "Data refreshed",
        description: "The submissions list has been updated"
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh failed",
        description: "There was an error updating the submissions list",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Talent Submissions</h2>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing || isLoading ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSort}
          className="flex items-center gap-1"
        >
          <ArrowUpDown className="h-4 w-4" />
          Sort by Date ({sortDirection === 'asc' ? 'Oldest first' : 'Newest first'})
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Social Media</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading || isRefreshing ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                Loading submissions...
              </TableCell>
            </TableRow>
          ) : !submissions?.length ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No submissions found
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">
                  <div>
                    {submission.full_name}
                    <div className="text-sm text-gray-500">
                      Submitted on {format(new Date(submission.created_at), "PPp")}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{submission.category}</TableCell>
                <TableCell>{submission.gender}</TableCell>
                <TableCell>{submission.age}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{submission.email}</div>
                    {submission.phone_number && (
                      <div className="text-sm text-gray-500">{submission.phone_number}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {submission.instagram && (
                      <div className="text-sm">Instagram: {submission.instagram}</div>
                    )}
                    {submission.telegram && (
                      <div className="text-sm">Telegram: {submission.telegram}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="text-sm truncate max-w-xs">
                      {submission.talent_description}
                    </div>
                    {submission.category === "Model" && submission.measurements && (
                      <div className="text-xs text-gray-500">
                        Measurements provided
                      </div>
                    )}
                    {submission.category === "Designer" && submission.portfolio_url && (
                      <a 
                        href={submission.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View Portfolio
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmergingTalentList;
