
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldAlert, Shield, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/types/authTypes';

interface UserRoleManagerProps {
  userId: string;
  userEmail: string;
  currentRole: string;
  onRoleUpdated: () => void;
}

export const UserRoleManager: React.FC<UserRoleManagerProps> = ({ 
  userId, 
  userEmail, 
  currentRole, 
  onRoleUpdated 
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<UserRole>(currentRole as UserRole || 'user');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateRole = async () => {
    if (!userId) return;
    
    setIsUpdating(true);
    try {
      // Update the role in the profiles table directly
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: editRole })
        .eq('id', userId);

      if (updateError) throw updateError;
      
      toast.success(`Updated ${userEmail}'s role to ${editRole}`);
      setIsEditDialogOpen(false);
      onRoleUpdated();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(`Failed to update role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500"><ShieldAlert className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'editor':
        return <Badge className="bg-amber-500"><Shield className="h-3 w-3 mr-1" />Editor</Badge>;
      case 'viewer':
        return <Badge className="bg-blue-500"><Shield className="h-3 w-3 mr-1" />Viewer</Badge>;
      default:
        return <Badge className="bg-gray-500"><User className="h-3 w-3 mr-1" />User</Badge>;
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {getRoleBadge(currentRole)}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
        >
          Edit
        </Button>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Update role for {userEmail}
            </p>
            <div>
              <label htmlFor="role" className="text-sm font-medium">
                User Role
              </label>
              <Select 
                value={editRole} 
                onValueChange={(value) => setEditRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="user">Regular User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
