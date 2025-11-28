import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Smartphone, Trash2, Monitor, Tablet } from "lucide-react";
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
import { formatDistanceToNow } from "date-fns";

interface TrustedDevice {
  id: string;
  device_name: string;
  device_fingerprint: string;
  created_at: string;
  last_used_at: string;
}

const TrustedDevices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDeviceId, setDeleteDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchDevices();
      } else {
        setLoading(false);
        toast({
          title: "Authentication Required",
          description: "Please log in to view trusted devices",
          variant: "destructive",
        });
      }
    };
    
    checkAuthAndFetch();
  }, []);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('device-trust', {
        body: { action: 'list' }
      });

      if (error) {
        console.error('Edge function error:', error);
        // Don't show error toast for this - it's expected if user hasn't set up 2FA
        setDevices([]);
        return;
      }

      setDevices(data?.devices || []);
    } catch (error: any) {
      console.error('Fetch devices error:', error);
      // Don't show error toast - silently handle
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async () => {
    if (!deleteDeviceId) return;

    try {
      const { data, error } = await supabase.functions.invoke('device-trust', {
        body: { 
          action: 'remove',
          deviceId: deleteDeviceId 
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Failed to remove device');
      }

      setDevices(devices.filter(d => d.id !== deleteDeviceId));
      
      toast({
        title: "Device Removed",
        description: "You will need to verify 2FA on this device next time you sign in.",
      });
      
      setDeleteDeviceId(null);
    } catch (error: any) {
      console.error('Remove device error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove device",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.includes('iPhone') || deviceName.includes('Android') || deviceName.includes('Mobile')) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (deviceName.includes('iPad') || deviceName.includes('Tablet')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Trusted Devices</h1>
          <p className="text-muted-foreground">
            Manage devices that can skip 2FA verification
          </p>
        </div>
      </div>

      {loading ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">Loading devices...</div>
        </Card>
      ) : devices.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Trusted Devices</h3>
            <p className="text-sm text-muted-foreground">
              When you check "Remember this device" during 2FA login, it will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {devices.map((device) => (
            <Card key={device.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getDeviceIcon(device.device_name)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{device.device_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Added {formatDistanceToNow(new Date(device.created_at), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last used {formatDistanceToNow(new Date(device.last_used_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteDeviceId(device.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">About Trusted Devices</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Trusted devices can skip 2FA verification for 30 days</li>
          <li>• Each device is identified by a unique fingerprint</li>
          <li>• Remove devices you no longer use or trust</li>
          <li>• Clearing browser data will require re-trusting the device</li>
        </ul>
      </Card>

      <AlertDialog open={!!deleteDeviceId} onOpenChange={() => setDeleteDeviceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Trusted Device?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to verify your 2FA code the next time you sign in from this device.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveDevice}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrustedDevices;
