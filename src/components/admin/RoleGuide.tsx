
import { Shield, UserCheck, UserX } from "lucide-react";

const RoleGuide = () => {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-lg font-medium mb-4">Role Guide</h3>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <Shield className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="font-medium">Admin</p>
            <p className="text-sm text-gray-600">Full access to all features, including user management and system settings.</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">Editor</p>
            <p className="text-sm text-gray-600">Can manage content, events, products, and view analytics.</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <UserX className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium">Viewer</p>
            <p className="text-sm text-gray-600">Can view admin dashboard and analytics, but cannot make changes.</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <span className="h-4 w-4 text-gray-600 text-xs font-bold">U</span>
          </div>
          <div>
            <p className="font-medium">User</p>
            <p className="text-sm text-gray-600">Standard user with no admin privileges.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleGuide;
