import React from 'react';
import { Badge } from "@/components/ui/badge";

// Replace the Badge variants that are causing issues
// Instead of using:
// <Badge variant="success">Active</Badge>
// Use:
// <Badge variant="secondary">Active</Badge>

// For example:
export const renderStatusBadge = (status: string) => {
  if (status === 'active') {
    return <Badge variant="secondary">Active</Badge>;  // Changed from "success" to "secondary"
  } else if (status === 'suspended') {
    return <Badge variant="destructive">Suspended</Badge>;
  } else {
    return <Badge variant="outline">Pending</Badge>;
  }
};
