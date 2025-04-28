import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Donation } from "@/services/donationTypes";
import DonationsTable from "./DonationsTable";
import DonationStats from "./DonationStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import DonorsTable from "./DonorsTable";

const DonationsManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("donations");

  // Fetch all donations with donor information
  const {
    data: donations,
    isLoading: donationsLoading,
    error: donationsError,
    refetch: refetchDonations,
  } = useQuery<Donation[]>({
    queryKey: ["admin-donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select(`
          *,
          donor:donors (
            full_name,
            email,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Filter donations based on search query
  const filteredDonations = donations?.filter((donation) => {
    const donorName = donation.donor?.full_name?.toLowerCase() || "";
    const donorEmail = donation.donor?.email?.toLowerCase() || "";
    const searchLower = searchQuery.toLowerCase();
    
    return (
      donorName.includes(searchLower) ||
      donorEmail.includes(searchLower) ||
      donation.id.toLowerCase().includes(searchLower) ||
      donation.payment_method?.toLowerCase().includes(searchLower) ||
      donation.amount.toString().includes(searchLower)
    );
  });

  // Group donations by donor for the donors tab
  const donors = donations
    ? donations.reduce((acc: any[], donation: any) => {
        if (!donation.donor) return acc;
        
        const existingDonorIndex = acc.findIndex(
          (donor) => donor.user_id === donation.user_id
        );
        
        if (existingDonorIndex >= 0) {
          acc[existingDonorIndex].total_amount += donation.amount;
          acc[existingDonorIndex].donation_count += 1;
          
          if (new Date(donation.created_at) > new Date(acc[existingDonorIndex].last_donation_date)) {
            acc[existingDonorIndex].last_donation_date = donation.created_at;
          }
        } else {
          acc.push({
            user_id: donation.user_id,
            full_name: donation.donor.full_name,
            email: donation.donor.email,
            phone_number: donation.donor.phone,
            total_amount: donation.amount,
            donation_count: 1,
            last_donation_date: donation.created_at,
          });
        }
        
        return acc;
      }, [])
    : [];

  // Filter donors based on search query
  const filteredDonors = donors?.filter((donor) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      donor.full_name?.toLowerCase().includes(searchLower) ||
      donor.email?.toLowerCase().includes(searchLower) ||
      donor.phone_number?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats
  const calculateStats = () => {
    if (!donations) return { total: 0, average: 0, count: 0 };
    
    const completedDonations = donations.filter(d => d.payment_status === "completed");
    const total = completedDonations.reduce((sum, d) => sum + Number(d.amount), 0);
    const count = completedDonations.length;
    const average = count > 0 ? total / count : 0;
    
    return { total, average, count };
  };
  
  const donationStats = calculateStats();

  if (donationsError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading donations data</p>
        <Button onClick={() => refetchDonations()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Donation Stats */}
      <DonationStats stats={donationStats} />
      
      {/* Search and Filter */}
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder={`Search ${activeTab}...`}
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Tabs */}
      <Tabs 
        defaultValue="donations" 
        onValueChange={(value) => setActiveTab(value)}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="donors">Donors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="donations">
          <DonationsTable 
            donations={filteredDonations || []}
            isLoading={donationsLoading}
            onRefresh={refetchDonations}
          />
        </TabsContent>
        
        <TabsContent value="donors">
          <DonorsTable 
            donors={filteredDonors || []}
            isLoading={donationsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonationsManager;
