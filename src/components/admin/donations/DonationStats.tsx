
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, CreditCard } from "lucide-react";

interface DonationStatsProps {
  stats: {
    total: number;
    average: number;
    count: number;
  };
}

const DonationStats = ({ stats }: DonationStatsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Donations</p>
            <h3 className="text-2xl font-bold">{formatCurrency(stats.total)}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Average Donation</p>
            <h3 className="text-2xl font-bold">{formatCurrency(stats.average)}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Donors</p>
            <h3 className="text-2xl font-bold">{stats.count}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationStats;
