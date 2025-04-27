
import React, { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { validateQRCode } from '@/services/qrCodeService';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from 'lucide-react';

export const QRCodeScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async (result: string) => {
    try {
      const isValid = await validateQRCode(result);
      
      if (isValid) {
        toast.success('Valid Ticket! Entry Granted', {
          description: `QR Code: ${result}`
        });
      } else {
        toast.error('Invalid or Expired Ticket', {
          description: 'Please check the ticket details'
        });
      }
    } catch (error) {
      toast.error('Scan Error', {
        description: 'Unable to validate ticket'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="mr-2" /> Event Entry Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isScanning ? (
          <Button 
            onClick={() => setIsScanning(true)}
            className="w-full"
          >
            Start Scanning
          </Button>
        ) : (
          <QrScanner
            onDecode={handleScan}
            onError={(error) => console.log(error?.message)}
          />
        )}
      </CardContent>
    </Card>
  );
};
