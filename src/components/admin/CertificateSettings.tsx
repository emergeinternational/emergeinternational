import React, { useState, useEffect } from "react";
import { getCertificateSettings, updateCertificateSettings } from "@/services/certificate";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Loader2, RefreshCw } from "lucide-react";

interface CertificateSettingsProps {
  onSettingsChanged?: () => void;
}

const CertificateSettings = ({ onSettingsChanged }: CertificateSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    min_courses_required: 5,
    min_workshops_required: 3
  });
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getCertificateSettings();
      setSettings({
        min_courses_required: data.min_courses_required,
        min_workshops_required: data.min_workshops_required
      });
    } catch (error) {
      console.error("Error fetching certificate settings:", error);
      toast({
        title: "Error",
        description: "Failed to load certificate settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateCertificateSettings(settings);
      if (success) {
        toast({
          title: "Settings Updated",
          description: "Certificate eligibility settings have been updated.",
        });
        if (onSettingsChanged) {
          onSettingsChanged();
        }
        setIsOpen(false);
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Settings className="h-4 w-4" />
        Certificate Settings
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Certificate Requirements</DialogTitle>
            <DialogDescription>
              Set the minimum requirements for certificate eligibility.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="min_courses">Minimum Online Courses Required</Label>
                <Input
                  id="min_courses"
                  type="number"
                  min="1"
                  value={settings.min_courses_required}
                  onChange={(e) => setSettings({ ...settings, min_courses_required: parseInt(e.target.value) || 1 })}
                />
                <p className="text-sm text-muted-foreground">
                  Users must complete at least this many courses to be eligible
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_workshops">Minimum Workshops Required</Label>
                <Input
                  id="min_workshops"
                  type="number"
                  min="1"
                  value={settings.min_workshops_required}
                  onChange={(e) => setSettings({ ...settings, min_workshops_required: parseInt(e.target.value) || 1 })}
                />
                <p className="text-sm text-muted-foreground">
                  Users must attend at least this many workshops to be eligible
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={fetchSettings}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CertificateSettings;
