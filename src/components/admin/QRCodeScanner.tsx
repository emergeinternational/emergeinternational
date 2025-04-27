
import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { validateQRCode } from '@/services/qrCodeService';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from 'lucide-react';

export const QRCodeScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async (result: string | null) => {
    if (!result) return;
    
    try {
      const isValid = await validateQRCode(result);
      
      if (isValid) {
        toast.success('Valid Ticket! Entry Granted', {
          description: `QR Code: ${result}`
        });
      } else {
        toast.error('Invalid or Already Used Ticket', {
          description: 'This ticket has either expired or been used'
        });
      }
    } catch (error) {
      toast.error('Scan Error', {
        description: 'Unable to validate ticket'
      });
    }
  };

  const handleError = (error: Error) => {
    console.error('QR Scanner error:', error);
    toast.error('Scanner Error', {
      description: 'Please ensure camera permissions are granted'
    });
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
          <Scanner
            onResult={handleScan}
            onError={handleError}
            constraints={{
              facingMode: 'environment'
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

