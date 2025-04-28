
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrdersRealtime = (onOrderChange?: () => void) => {
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  useEffect(() => {
    // Set up Realtime subscription for orders
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        (payload) => {
          // Handle different events
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Order',
              description: `Order #${payload.new.id.slice(0, 8)} has been created`,
            });
          } else if (payload.eventType === 'UPDATE') {
            // Compare old and new status
            if (payload.old.status !== payload.new.status) {
              toast({
                title: 'Order Status Updated',
                description: `Order #${payload.new.id.slice(0, 8)} status changed to ${payload.new.status}`,
              });
            }
          }

          // If callback is provided, trigger it to refresh data
          if (onOrderChange) {
            onOrderChange();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
        }
      });

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onOrderChange, toast]);

  return { isSubscribed };
};
