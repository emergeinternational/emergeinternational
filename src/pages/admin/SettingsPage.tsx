
import { useState } from "react";
import { Check, Save } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [automaticBackups, setAutomaticBackups] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = () => {
    setSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setSaving(false);
      
      toast({
        title: "Settings saved",
        description: "Your admin settings have been updated successfully.",
        duration: 3000,
      });
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Admin Settings</h1>
          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Saved" : "Save Changes"}
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-emails">Marketing emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new features and promotions
                  </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System</CardTitle>
              <CardDescription>
                Configure system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="automatic-backups">Automatic backups</Label>
                  <p className="text-sm text-muted-foreground">
                    System will create daily backups of all data
                  </p>
                </div>
                <Switch
                  id="automatic-backups"
                  checked={automaticBackups}
                  onCheckedChange={setAutomaticBackups}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="font-medium mb-2">Database Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Last backup:</div>
                  <div>April 23, 2025 (Yesterday)</div>
                  <div className="text-muted-foreground">Storage used:</div>
                  <div>1.2 GB of 5 GB</div>
                  <div className="text-muted-foreground">Records:</div>
                  <div>1,245 total records</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
