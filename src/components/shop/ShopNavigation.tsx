
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUnreadNotificationCount } from '@/services/designerProductService';
import { Bell, ChevronDown, LayoutDashboard, Package, Settings, ShoppingBag } from 'lucide-react';

const ShopNavigation: React.FC = () => {
  const { userRole, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isDesigner = userRole === 'designer';
  const isAdminOrEditor = userRole === 'admin' || userRole === 'editor';
  
  useEffect(() => {
    if (isAuthenticated && isDesigner) {
      const fetchUnreadCount = async () => {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      };
      
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isDesigner]);
  
  if (isLoading) return null;
  
  return (
    <div className="flex items-center space-x-2">
      <Link to="/shop">
        <Button variant={location.pathname === '/shop' ? 'default' : 'ghost'} size="sm">
          <ShoppingBag className="h-4 w-4 mr-1" />
          Shop
        </Button>
      </Link>
      
      {isDesigner && (
        <Link to="/my-products">
          <Button variant={location.pathname === '/my-products' ? 'default' : 'ghost'} size="sm" className="relative">
            <Package className="h-4 w-4 mr-1" />
            My Products
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>
      )}
      
      {isAdminOrEditor && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Admin
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Shop Management</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/product-approvals" className="flex items-center w-full cursor-pointer">
                <Bell className="h-4 w-4 mr-2" />
                Product Approvals
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/product-management" className="flex items-center w-full cursor-pointer">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Product Management
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ShopNavigation;
