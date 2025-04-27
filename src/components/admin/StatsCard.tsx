
import React from 'react';

export interface StatsCardProps {
  title: string;
  value: string;
  change: string;
}

const StatsCard = ({ title, value, change }: StatsCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{change}</p>
    </div>
  );
};

export default StatsCard;
