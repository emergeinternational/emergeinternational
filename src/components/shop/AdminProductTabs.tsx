
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductsManager from "./ProductsManager";
import CollectionsManager from "./CollectionsManager";

interface AdminProductTabsProps {
  isLocked?: boolean;
}

const AdminProductTabs: React.FC<AdminProductTabsProps> = ({ isLocked = false }) => {
  return (
    <Tabs defaultValue="products" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="collections">Collections</TabsTrigger>
      </TabsList>
      
      <TabsContent value="products">
        <ProductsManager isLocked={isLocked} />
      </TabsContent>
      
      <TabsContent value="collections">
        <CollectionsManager isLocked={isLocked} />
      </TabsContent>
    </Tabs>
  );
};

export default AdminProductTabs;
