
import React from 'react';
import MainLayout from "@/layouts/MainLayout";

const Home = () => {
  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <h1 className="text-3xl font-bold mb-6">Welcome to Emerge</h1>
        <p className="text-lg mb-4">
          An innovative platform for education and talent development.
        </p>
      </div>
    </MainLayout>
  );
};

export default Home;
