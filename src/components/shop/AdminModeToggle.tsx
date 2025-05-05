
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AdminModeToggleProps {
  isAdmin: boolean;
  onChange: (value: boolean) => void;
}

const AdminModeToggle: React.FC<AdminModeToggleProps> = ({ isAdmin, onChange }) => {
  return (
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6">
      <div className="flex items-center space-x-2">
        <Switch 
          id="admin-mode" 
          checked={isAdmin} 
          onCheckedChange={onChange}
        />
        <Label htmlFor="admin-mode" className="font-medium">
          Shop Admin Mode {isAdmin ? "(Enabled)" : "(Disabled)"}
        </Label>
      </div>
      {isAdmin && (
        <p className="text-sm text-amber-700 mt-2">
          Admin mode is active. You can now add, edit, and delete products.
        </p>
      )}
    </div>
  );
};

export default AdminModeToggle;
