
import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showConfirmation, setShowConfirmation] = useState(false);
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

  const requestUnlock = () => {
    // Only admins and editors can toggle lock
    if (userRole !== 'admin' && userRole !== 'editor') {
      toast({
        title: "Permission denied",
        description: "Only admins and editors can change page lock status.",
        variant: "destructive",
      });
      return;
    }

    if (isLocked) {
      // Show confirmation before unlocking
      setShowConfirmation(true);
    } else {
      // Locking doesn't need confirmation
      toggleLock(true);
    }
  };

  const toggleLock = (newLockState: boolean) => {
    setIsLocked(newLockState);
    sessionStorage.setItem(`pageLock_${pageId}`, JSON.stringify(newLockState));
    onLockStatusChange(newLockState);

    toast({
      title: newLockState ? "Page locked" : "Page unlocked",
      description: newLockState 
        ? "The page is now locked for safety." 
        : "The page is now unlocked for editing.",
      variant: newLockState ? "default" : "destructive",
    });

    setShowConfirmation(false);
  };

  return (
    <>
      <Button 
        variant={isLocked ? "default" : "destructive"}
        className="flex items-center gap-2"
        onClick={requestUnlock}
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

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock this page?</AlertDialogTitle>
            <AlertDialogDescription>
              Unlocking this page will allow editing of content. This should only be done when necessary changes are needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => toggleLock(false)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Yes, unlock page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PageLock;
