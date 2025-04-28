
import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect to the proper OrdersPage component
const Orders = () => {
  return <Navigate to="/admin/orders" replace />;
};

export default Orders;
