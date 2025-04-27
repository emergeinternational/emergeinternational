
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import QRCode from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface Ticket {
  id: string;
  event_id: string;
  user_id: string;
  ticket_type: string;
  amount: number;
  payment_status: 'pending' | 'approved' | 'rejected';
  payment_proof_url?: string | null;
  created_at: string;
  qr_code?: string | null;
  qr_code_active?: boolean;
  events?: {
    name: string;
    date: string;
    location: string | null;
  };
}

const UserTickets = () => {
  const { user } = useAuth();

  const { data: tickets } = useQuery({
    queryKey: ['user-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events:event_id (
            name,
            date,
            location
          )
        `)
        .eq('user_id', user?.id)
        .eq('payment_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Ticket[];
    },
    enabled: !!user,
  });

  if (!tickets?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tickets found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Event Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {ticket.events?.name}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Date: {new Date(ticket.events?.date).toLocaleDateString()}</p>
                      <p>Location: {ticket.events?.location}</p>
                      <p>Ticket Type: {ticket.ticket_type}</p>
                    </div>
                  </div>
                  
                  {ticket.qr_code && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white p-2 rounded-lg">
                        <QRCode 
                          value={ticket.qr_code}
                          size={150}
                          level="H"
                          className={!ticket.qr_code_active ? "opacity-50" : ""}
                        />
                      </div>
                      <Badge
                        variant={ticket.qr_code_active ? "default" : "destructive"}
                      >
                        {ticket.qr_code_active ? "Active" : "Used"}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserTickets;
