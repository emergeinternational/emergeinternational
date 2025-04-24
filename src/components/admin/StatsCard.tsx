
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  change: string;
}

const StatsCard = ({ label, value, change }: StatsCardProps) => {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <div className="flex justify-between items-end">
        <p className="text-2xl font-semibold">{value}</p>
        <p className={`text-sm flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
          {change}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
