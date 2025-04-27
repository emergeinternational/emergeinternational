import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CertificateManagementProps {
  certificate: {
    id: string;
    name: string;
    status: string;
  };
}

export const CertificateManagement: React.FC<CertificateManagementProps> = ({ certificate }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-xl font-medium mb-2">{certificate.name}</h3>
        <div className="space-y-2 mb-4">
          <p><strong>ID:</strong> {certificate.id}</p>
        </div>
        <div className="flex justify-end">
          <Badge variant="secondary">
            Approved
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
