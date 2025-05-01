
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DonationsTable from './DonationsTable';
import DonationDetailsDialog from './DonationDetailsDialog';
import DonationStats from './DonationStats';

interface DonationsManagerProps {
  isLocked?: boolean;
}

// Define interfaces for child components to ensure type safety
interface Donation {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  donors?: {
    full_name: string;
    email: string;
  };
  [key: string]: any; // Allow for additional properties
}

const DonationsManager: React.FC<DonationsManagerProps> = ({ isLocked = false }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
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

  const handleViewDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsDetailsDialogOpen(true);
  };

  const handleRefresh = async () => {
    await fetchDonations();
  };

  return (
    <div>
      {/* Pass necessary props to match the expected interfaces */}
      <DonationStats 
        totalAmount={donations.reduce((sum, d) => sum + (d.amount || 0), 0)}
        totalCount={donations.length}
        recentCount={donations.filter(d => {
          const date = new Date(d.created_at);
          const now = new Date();
          const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
          return date >= thirtyDaysAgo;
        }).length}
        pendingCount={donations.filter(d => d.status === 'pending').length}
      />
      
      <DonationsTable 
        donations={donations} 
        isLoading={isLoading}
        onRefresh={handleRefresh}
        isLocked={isLocked}
        onViewDetails={handleViewDetails}
      />
      
      {selectedDonation && (
        <DonationDetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          donation={selectedDonation}
          isLocked={isLocked}
        />
      )}
    </div>
  );
};

export default DonationsManager;
