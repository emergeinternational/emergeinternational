
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PasswordResetFormProps {
  isSubmitting: boolean;
  onResetSuccess: () => void;
}

export const PasswordResetForm = ({
  isSubmitting,
  onResetSuccess,
}: PasswordResetFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      toast({
        title: "New Password is required",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;

      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password.",
      });

      onResetSuccess();
    } catch (error) {
      toast({
        title: "Password Reset Error",
        description: error instanceof Error ? error.message : "Could not reset password",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handlePasswordReset} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="newPassword" className="block text-gray-300 text-sm">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="emerge-input"
          placeholder="Enter new password"
          disabled={isSubmitting}
        />
      </div>
      <button 
        type="submit" 
        className="emerge-button-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating..." : "Reset Password"}
      </button>
    </form>
  );
};
