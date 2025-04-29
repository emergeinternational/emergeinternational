
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PageLockProps {
  userRole: string | null;
  pageId: string;
  onLockStatusChange: (status: boolean) => void;
}

const PageLock: React.FC<PageLockProps> = ({ userRole, pageId, onLockStatusChange }) => {
  const [isLocked, setIsLocked] = useState(true);
  const { toast } = useToast();
  
  // Fetch the lock status from session storage on component mount
  useEffect(() => {
    const lockStatus = sessionStorage.getItem(`page_lock_${pageId}`);
    if (lockStatus !== null) {
      setIsLocked(JSON.parse(lockStatus));
      onLockStatusChange(JSON.parse(lockStatus));
    }
  }, [pageId, onLockStatusChange]);

  // Handle unlocking of the page with confirmation
  const handleUnlock = () => {
    if (userRole === 'admin' || userRole === 'editor') {
      const confirmation = window.confirm('Are you sure you want to unlock this page for editing?');
      if (confirmation) {
        setIsLocked(false);
        sessionStorage.setItem(`page_lock_${pageId}`, JSON.stringify(false));
        onLockStatusChange(false);
        toast({
          title: "Page unlocked",
          description: "You can now edit content on this page"
        });
      }
    } else {
      toast({
        title: "Permission denied",
        description: "You don't have permission to unlock this page",
        variant: "destructive"
      });
    }
  };

  // Handle locking the page again
  const handleLock = () => {
    setIsLocked(true);
    sessionStorage.setItem(`page_lock_${pageId}`, JSON.stringify(true));
    onLockStatusChange(true);
    toast({
      title: "Page locked",
      description: "This page is now locked for editing"
    });
  };

  return (
    <div className="mb-4 flex items-center justify-between bg-muted p-3 rounded-md">
      <div className="flex items-center gap-2">
        {isLocked ? (
          <Lock className="h-4 w-4 text-amber-500" />
        ) : (
          <Unlock className="h-4 w-4 text-green-500" />
        )}
        <span className="text-sm font-medium">Status:</span>
        <Badge variant={isLocked ? "outline" : "secondary"}>
          {isLocked ? 'Locked' : 'Unlocked'}
        </Badge>
      </div>
      
      {(userRole === 'admin' || userRole === 'editor') && (
        <Button 
          variant={isLocked ? "outline" : "secondary"} 
          size="sm" 
          onClick={isLocked ? handleUnlock : handleLock}
        >
          {isLocked ? 'Unlock Page' : 'Lock Page'}
        </Button>
      )}
      
      {isLocked && userRole !== 'admin' && userRole !== 'editor' && (
        <Alert variant="warning" className="p-2 text-sm max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This page is currently locked for editing
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PageLock;
