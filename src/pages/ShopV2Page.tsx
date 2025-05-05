
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import ShopV2 from '@/components/shopV2/ShopV2';
import { useAuth } from '@/hooks/useAuth';

const ShopV2Page: React.FC = () => {
  const { user, profile } = useAuth();
  
  return (
    <MainLayout>
      <ShopV2 
        userRole={profile?.role}
      />
    </MainLayout>
  );
};

export default ShopV2Page;
