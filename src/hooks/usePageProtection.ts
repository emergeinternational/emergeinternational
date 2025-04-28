
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to add protection against accidental changes to critical components
 */
export function usePageProtection(pageName: string) {
  const [isLocked, setIsLocked] = useState(true);
  const { toast } = useToast();

  const requestUnlock = (): boolean => {
    if (!isLocked) return true;
    
    const confirmation = window.confirm(
      `This will modify the ${pageName} page, which is currently protected. Are you sure you want to proceed?`
    );
    
    if (confirmation) {
      setIsLocked(false);
      
      toast({
        title: `${pageName} page unlocked`,
        description: "The page is now unlocked for changes. It will automatically lock again after page refresh.",
      });
      
      return true;
    }
    
    toast({
      title: "Action cancelled",
      description: `The ${pageName} page remains locked and protected.`,
      variant: "default"
    });
    
    return false;
  };

  const lockPage = () => {
    setIsLocked(true);
    
    toast({
      title: `${pageName} page locked`,
      description: "The page is now protected against accidental changes.",
    });
  };

  return {
    isLocked,
    requestUnlock,
    lockPage
  };
}
