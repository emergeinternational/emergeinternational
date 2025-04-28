
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrdersRealtime = (onOrderChange?: () => void) => {
  const { toast } = useToast();
  
  useEffect(() => {
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
