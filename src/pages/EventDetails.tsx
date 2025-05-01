
import React from 'react';
import MainLayout from "../layouts/MainLayout";
import { useParams, Link } from "react-router-dom";

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <MainLayout>
      <div className="emerge-container py-16">
        <Link to="/events" className="text-emerge-gold hover:underline mb-4 inline-block">
          &lt; Back to Events
        </Link>
        <h1 className="text-3xl font-bold mb-6">Event Details</h1>
        <p className="mb-4">Event ID: {eventId}</p>
        <p className="text-gray-500">Event details will be loaded here. This is a placeholder component.</p>
      </div>
    </MainLayout>
  );
};

export default EventDetails;
