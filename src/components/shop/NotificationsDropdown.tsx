
import React, { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Dot,
  Loader2,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  getUserNotifications, 
  markNotificationAsRead,
  getUnreadNotificationCount,
  markAllNotificationsAsRead
} from "@/services/designerProductService";
import { ProductNotification } from "@/types/shopSubmission";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const NotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<ProductNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setIsLoading(true);
    const data = await getUserNotifications();
    setNotifications(data);
    const count = await getUnreadNotificationCount();
    setUnreadCount(count);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Refresh unread count periodically
  useEffect(() => {
    const fetchCount = async () => {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, is_read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, is_read: true }))
    );
    setUnreadCount(0);
  };

  const handleViewProduct = (notification: ProductNotification) => {
    setIsOpen(false);
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    navigate(`/my-products/${notification.product_id}`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleMarkAllAsRead}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length > 0 ? (
          <ScrollArea className="max-h-[300px]">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`relative flex items-start p-4 hover:bg-muted/50 cursor-pointer ${
                  !notification.is_read ? "bg-muted/30" : ""
                }`}
                onClick={() => handleViewProduct(notification)}
              >
                <div className="mr-4 mt-0.5 flex-shrink-0">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  {!notification.is_read && (
                    <Dot className="absolute -left-0.5 -top-0.5 h-5 w-5 text-emerge-gold" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 absolute right-2 top-2"
                    onClick={e => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center p-6">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
