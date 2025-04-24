
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface PasswordResetFormProps {
  isSubmitting: boolean;
  onResetSuccess: () => void;
}

export const PasswordResetForm = ({
  isSubmitting: initialSubmitting,
  onResetSuccess,
}: PasswordResetFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(initialSubmitting);
  const { toast } = useToast();
  const { resetPassword } = useAuth();

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

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Attempting to reset password");
      await resetPassword(newPassword);
      console.log("Password reset successful");
      onResetSuccess();
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Password Reset Error",
        description: error instanceof Error ? error.message : "Could not reset password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
          autoComplete="new-password"
        />
        <p className="text-xs text-gray-400">Must be at least 6 characters long</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-gray-300 text-sm">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="emerge-input"
          placeholder="Confirm new password"
          disabled={isSubmitting}
          autoComplete="new-password"
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
