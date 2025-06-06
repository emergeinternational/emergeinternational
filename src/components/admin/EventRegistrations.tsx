import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Eye, QrCode, Download, RefreshCw } from "lucide-react";
import QRCode from 'qrcode.react';
import { useEventsAdmin } from "@/hooks/useEvents";
import { EventRegistration, updateRegistrationStatus, toggleQrCodeStatus } from '@/services/workshopService';

const fetchEventRegistrations = async (): Promise<EventRegistration[]> => {
  const { data, error } = await supabase
    .rpc('get_event_registrations');

  if (error) throw error;
  
  const registrations: EventRegistration[] = (data || []).map((item: any) => ({
    id: item.id,
    event_id: item.event_id,
    user_id: item.user_id,
    ticket_type: item.ticket_type,
    amount: item.amount,
    payment_status: item.payment_status as 'pending' | 'approved' | 'rejected',
    payment_proof_url: item.payment_proof_url,
    created_at: item.created_at,
    updated_at: item.updated_at || item.created_at,
    qr_code: item.qr_code,
    qr_code_active: item.qr_code_active,
    profiles: item.profiles,
    events: item.events
  }));

  return registrations;
};

export const EventRegistrations = () => {
  const [selectedRegistration, setSelectedRegistration] = useState<EventRegistration | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isQrCodeDialogOpen, setIsQrCodeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: events } = useEventsAdmin();

  const { data: registrations, isLoading, refetch } = useQuery({
    queryKey: ['event-registrations'],
    queryFn: fetchEventRegistrations,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => 
      updateRegistrationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations'] });
      toast({ title: "Success", description: "Registration status updated successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const qrCodeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => 
      toggleQrCodeStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations'] });
      toast({ title: "Success", description: "QR code status updated successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update QR code status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const handleApprove = (id: string) => {
    if (confirm('Approve this registration? This will generate a QR code for the ticket.')) {
      statusMutation.mutate({ id, status: 'approved' });
    }
  };

  const handleReject = (id: string) => {
    if (confirm('Reject this registration?')) {
      statusMutation.mutate({ id, status: 'rejected' });
    }
  };

  const handleToggleQrCode = (id: string, active: boolean) => {
    qrCodeMutation.mutate({ id, active });
  };

  const openViewDialog = (registration: EventRegistration) => {
    setSelectedRegistration(registration);
    setIsViewDialogOpen(true);
  };

  const openQrCodeDialog = (registration: EventRegistration) => {
    setSelectedRegistration(registration);
    setIsQrCodeDialogOpen(true);
  };

  const downloadQrCode = () => {
    if (!selectedRegistration?.qr_code) return;
    
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qr-code-${selectedRegistration.id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    toast({ title: "Success", description: "QR code downloaded successfully!" });
  };

  const filteredRegistrations = registrations?.filter(registration => {
    if (selectedEventId !== 'all' && registration.event_id !== selectedEventId) {
      return false;
    }
    
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return registration.payment_status === 'pending';
    if (activeTab === 'approved') return registration.payment_status === 'approved';
    if (activeTab === 'rejected') return registration.payment_status === 'rejected';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getActionButtonsForRow = (registration: EventRegistration) => {
    const buttons = [];
    
    if (registration.payment_proof_url) {
      buttons.push(
        <Button 
          key="view"
          variant="outline" 
          size="sm" 
          onClick={() => openViewDialog(registration)}
          className="flex items-center"
        >
          <Eye className="h-4 w-4 mr-1" /> View Proof
        </Button>
      );
    }
    
    if (registration.payment_status === 'pending') {
      buttons.push(
        <Button 
          key="approve"
          variant="outline" 
          size="sm" 
          className="text-green-600 border-green-600 hover:bg-green-50 flex items-center"
          onClick={() => handleApprove(registration.id)}
        >
          <Check className="h-4 w-4 mr-1" /> Approve
        </Button>
      );
      
      buttons.push(
        <Button 
          key="reject"
          variant="outline" 
          size="sm" 
          className="text-red-600 border-red-600 hover:bg-red-50 flex items-center"
          onClick={() => handleReject(registration.id)}
        >
          <X className="h-4 w-4 mr-1" /> Reject
        </Button>
      );
    }
    
    if (registration.payment_status === 'approved') {
      buttons.push(
        <Button 
          key="qrcode"
          variant="outline" 
          size="sm"
          onClick={() => openQrCodeDialog(registration)}
          className="flex items-center"
        >
          <QrCode className="h-4 w-4 mr-1" /> Manage QR Code
        </Button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Event Registrations</CardTitle>
            <CardDescription>
              Manage event registrations, payments, and QR codes for attendees
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-sm mb-2">Filter by Event:</div>
            <Select
              value={selectedEventId}
              onValueChange={setSelectedEventId}
            >
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events?.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="text-center py-8">Loading registrations...</div>
            ) : registrations && registrations.length > 0 ? (
              filteredRegistrations && filteredRegistrations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Ticket Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>{registration.events?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{registration.profiles?.full_name || 'Anonymous'}</div>
                            <div className="text-sm text-gray-500">{registration.profiles?.email || 'No email'}</div>
                          </div>
                        </TableCell>
                        <TableCell>{registration.ticket_type || 'Standard'}</TableCell>
                        <TableCell>ETB {registration.amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(registration.payment_status)}</TableCell>
                        <TableCell>
                          {new Date(registration.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-2">
                            {getActionButtonsForRow(registration)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No registrations found with the selected filters.
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No registrations found for any events.</p>
                <p className="text-sm text-gray-400 mt-2">Once users register for events, they will appear here.</p>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Proof Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
            <DialogDescription>
              Review the payment screenshot submitted by the customer
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration?.payment_proof_url && (
            <div className="flex flex-col items-center gap-4">
              <img 
                src={selectedRegistration.payment_proof_url} 
                alt="Payment Proof" 
                className="rounded-md max-h-96 object-contain"
              />
              <div className="grid grid-cols-2 w-full gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Event:</p>
                  <p className="font-medium">{selectedRegistration.events?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Customer:</p>
                  <p className="font-medium">{selectedRegistration.profiles?.full_name || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount:</p>
                  <p className="font-medium">ETB {selectedRegistration.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date:</p>
                  <p className="font-medium">
                    {new Date(selectedRegistration.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {selectedRegistration.payment_status === 'pending' && (
                <div className="flex space-x-2 w-full justify-end">
                  <Button 
                    onClick={() => {
                      handleApprove(selectedRegistration.id);
                      setIsViewDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve Payment
                  </Button>
                  <Button 
                    onClick={() => {
                      handleReject(selectedRegistration.id);
                      setIsViewDialogOpen(false);
                    }}
                    variant="destructive"
                  >
                    Reject Payment
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={isQrCodeDialogOpen} onOpenChange={setIsQrCodeDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ticket QR Code</DialogTitle>
            <DialogDescription>
              Manage the QR code for this ticket
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration?.qr_code ? (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-md shadow-sm">
                <QRCode 
                  id="qr-canvas"
                  value={selectedRegistration.qr_code} 
                  size={200}
                  level="H"
                  className={selectedRegistration.qr_code_active ? "" : "opacity-50"}
                />
                {!selectedRegistration.qr_code_active && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Badge className="bg-red-500">INACTIVE</Badge>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="font-medium">Ticket ID: {selectedRegistration.id.substring(0, 8)}</p>
                <p className="text-sm text-gray-500">
                  {selectedRegistration.events?.name || 'Unknown Event'}
                </p>
                <div className="mt-2">
                  <Badge className={selectedRegistration.qr_code_active 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"}>
                    {selectedRegistration.qr_code_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex space-x-2 w-full justify-center">
                <Button 
                  variant="outline" 
                  onClick={downloadQrCode}
                >
                  <Download className="h-4 w-4 mr-2" /> Download QR
                </Button>
                <Button 
                  onClick={() => handleToggleQrCode(
                    selectedRegistration.id, 
                    !selectedRegistration.qr_code_active
                  )}
                  className={selectedRegistration.qr_code_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {selectedRegistration.qr_code_active ? "Deactivate QR" : "Activate QR"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              No QR code available for this registration.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventRegistrations;
