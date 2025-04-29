
import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PageLockProps {
  pageId: string;
  onLockStatusChange: (isLocked: boolean) => void;
  initialLockState?: boolean;
  userRole?: string;
}

const PageLock: React.FC<PageLockProps> = ({ 
  pageId,
  onLockStatusChange,
  initialLockState = true,
  userRole = 'admin' // Default to admin role
}) => {
  const [isLocked, setIsLocked] = useState(initialLockState);
  const { toast } = useToast();

  // On mount, check session storage for lock status
  useEffect(() => {
    const storedLockStatus = sessionStorage.getItem(`pageLock_${pageId}`);
    if (storedLockStatus !== null) {
      const parsedStatus = JSON.parse(storedLockStatus);
      setIsLocked(parsedStatus);
      onLockStatusChange(parsedStatus);
    } else {
      // Set default lock state in session storage if not present
      sessionStorage.setItem(`pageLock_${pageId}`, JSON.stringify(initialLockState));
    }
  }, [pageId, initialLockState, onLockStatusChange]);

  const toggleLock = () => {
    // Only admins and editors can toggle lock
    if (userRole !== 'admin' && userRole !== 'editor') {
      toast({
        title: "Permission denied",
        description: "Only admins and editors can change page lock status.",
        variant: "destructive",
      });
      return;
    }

    const newLockState = !isLocked;

    // Confirm before unlocking
    if (isLocked && !confirm('Are you sure you want to unlock this page? This will allow editing of content.')) {
      return;
    }

    setIsLocked(newLockState);
    sessionStorage.setItem(`pageLock_${pageId}`, JSON.stringify(newLockState));
    onLockStatusChange(newLockState);

    toast({
      title: newLockState ? "Page locked" : "Page unlocked",
      description: newLockState 
        ? "The page is now locked for safety." 
        : "The page is now unlocked for editing.",
      variant: newLockState ? "default" : "warning",
    });
  };

  return (
    <Button 
      variant={isLocked ? "default" : "warning"}
      className="flex items-center gap-2"
      onClick={toggleLock}
      title={isLocked ? "Unlock page to enable editing" : "Lock page to prevent changes"}
    >
      {isLocked ? (
        <>
          <Unlock className="h-4 w-4" />
          Unlock Page
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          Lock Page
        </>
      )}
    </Button>
  );
};

export default PageLock;
