
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrderStatusChange {
  id: string;
  status?: string;
  payment_status?: string;
}

export const useOrdersRealtime = (onOrderChange?: () => void) => {
  const { toast } = useToast();
  
  useEffect(() => {
    // Enable realtime subscription for the orders table
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        (payload) => {
          // Show different toasts based on the event type
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Order Received",
              description: `Order #${payload.new.id.slice(0, 8)} has been created`,
            });
          } else if (payload.eventType === 'UPDATE') {
            // Show toast only for status changes
            if (payload.old.status !== payload.new.status) {
              toast({
                title: "Order Status Updated",
                description: `Order #${payload.new.id.slice(0, 8)} status changed to ${payload.new.status}`,
              });
            }
            
            // Show toast for payment status changes
            if (payload.old.payment_status !== payload.new.payment_status && payload.new.payment_status) {
              toast({
                title: "Payment Status Updated",
                description: `Order #${payload.new.id.slice(0, 8)} payment status is now ${payload.new.payment_status}`,
              });
            }
          }

          // Trigger callback to refresh data if provided
          if (onOrderChange) {
            onOrderChange();
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onOrderChange, toast]);
};
