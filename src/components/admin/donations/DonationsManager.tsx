
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DonationsTable from './DonationsTable';
import DonationDetailsDialog from './DonationDetailsDialog';
import DonationStats from './DonationStats';

interface DonationsManagerProps {
  isLocked?: boolean;
}

const DonationsManager: React.FC<DonationsManagerProps> = ({ isLocked = false }) => {
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDonations();
    
    const channel = supabase
      .channel('donations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'donations'
        },
        (payload) => {
          console.log('Donation change detected:', payload);
          fetchDonations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          donor:donor_id (
            id, 
            full_name, 
            email, 
            phone
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the donations to get donor info
      const processedDonations = data.map(donation => {
        // If donor relation isn't found, use empty values for full_name and email
        const donorFullName = donation.donor ? donation.donor.full_name : 'Unknown Donor';
        const donorEmail = donation.donor ? donation.donor.email : 'No email available';
        
        return {
          ...donation,
          donor_name: donorFullName,
          donor_email: donorEmail
        };
      });
      
      setDonations(processedDonations);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast({
        title: "Error loading donations",
        description: error instanceof Error ? error.message : "Failed to load donations data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewDetails = (donation: any) => {
    setSelectedDonation(donation);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
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
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          donation={selectedDonation}
          isLocked={isLocked}
        />
      )}
    </div>
  );
};

export default DonationsManager;
