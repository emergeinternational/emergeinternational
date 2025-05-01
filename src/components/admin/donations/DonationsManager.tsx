
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DonationStats from "./DonationStats";
import DonationsTable from "./DonationsTable";
import DonationDetailsDialog from "./DonationDetailsDialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DonationsManagerProps {
  isLocked: boolean;
}

const DonationsManager: React.FC<DonationsManagerProps> = ({ isLocked }) => {
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("donations")
        .select(`
          *,
          donors (
            full_name,
            email,
            phone,
            total_donations
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDonations(data || []);
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast({
        title: "Error",
        description: "Failed to load donations data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleViewDetails = (donation: any) => {
    setSelectedDonation(donation);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Donations Dashboard</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDonations}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <DonationStats donations={donations} isLoading={isLoading} />

      <DonationsTable 
        donations={donations} 
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onRefresh={fetchDonations}
        isLocked={isLocked}
      />

      {selectedDonation && (
        <DonationDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          donation={selectedDonation}
          isLocked={isLocked}
        />
      )}
    </div>
  );
};

export default DonationsManager;
