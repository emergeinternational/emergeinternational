
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
import { RefreshCw } from "lucide-react";

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
  created_at: string;
}

const EmergingTalentList = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const { data: submissions, isLoading, refetch } = useQuery({
    queryKey: ['emerge-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emerge_submissions')
        .select('*')
        .order('created_at', { ascending: false });

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Social Media</TableHead>
            <TableHead>Description</TableHead>
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
                <TableCell className="font-medium">{submission.full_name}</TableCell>
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
                  <div className="max-w-xs truncate">
                    {submission.talent_description}
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
