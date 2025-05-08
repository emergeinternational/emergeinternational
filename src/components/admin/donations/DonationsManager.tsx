
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DonationsTable from './DonationsTable';
import DonationDetailsDialog from './DonationDetailsDialog';
import DonationStats from './DonationStats';
import { DonationStatsProps } from './DonationStats.d';
import { DonationsTableProps } from './DonationsTable.d';
import { DonationDetailsDialogProps } from './DonationDetailsDialog.d';

interface DonationsManagerProps {
  isLocked?: boolean;
}

const DonationsManager: React.FC<DonationsManagerProps> = ({ isLocked = false }) => {
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch donations on component mount
  useEffect(() => {
    fetchDonations();
    
    // Subscribe to changes
    const channel = supabase
      .channel('donation_changes')
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
          donors (full_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Fetched donations:", data);
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast({
        title: "Error loading donations",
        description: error instanceof Error ? error.message : "Failed to load donations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (donation: any) => {
    setSelectedDonation(donation);
    setIsDetailsDialogOpen(true);
  };

  const handleRefresh = async () => {
    await fetchDonations();
  };

  return (
    <div>
      <DonationStats
        donations={donations}
        isLoading={isLoading}
      />
      
      <DonationsTable 
        donations={donations} 
        isLoading={isLoading} 
        onViewDetails={handleViewDetails} 
        onRefresh={handleRefresh}
        isLocked={isLocked} 
      />
      
      {selectedDonation && (
        <DonationDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          donation={selectedDonation}
          isLocked={isLocked}
        />
      )}
    </div>
  );
};

export default DonationsManager;
