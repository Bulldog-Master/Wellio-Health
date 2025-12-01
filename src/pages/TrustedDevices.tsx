import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation('settings');
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
          title: t('auth_required'),
          description: t('login_to_view_devices'),
          variant: "destructive",
        });
      }
    };
    
    checkAuthAndFetch();
  }, []);

  const fetchDevices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        setDevices([]);
        return;
      }

      setDevices(data || []);
    } catch (error: any) {
      console.error('Fetch devices error:', error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async () => {
    if (!deleteDeviceId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('common:error'),
          description: t('must_be_logged_in'),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('trusted_devices')
        .delete()
        .eq('id', deleteDeviceId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to remove device');
      }

      setDevices(devices.filter(d => d.id !== deleteDeviceId));
      
      toast({
        title: t('device_removed'),
        description: t('device_removed_desc'),
      });
      
      setDeleteDeviceId(null);
    } catch (error: any) {
      console.error('Remove device error:', error);
      toast({
        title: t('common:error'),
        description: error.message || t('failed_remove_device'),
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
          <h1 className="text-3xl font-bold mb-2">{t('trusted_devices_title')}</h1>
          <p className="text-muted-foreground">
            {t('trusted_devices_subtitle')}
          </p>
        </div>
      </div>

      {loading ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">{t('loading_devices')}</div>
        </Card>
      ) : devices.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('no_trusted_devices')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('trusted_devices_login_prompt')}
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
                      {t('added_time_ago', { time: formatDistanceToNow(new Date(device.created_at), { addSuffix: true }) })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('last_used_time_ago', { time: formatDistanceToNow(new Date(device.last_used_at), { addSuffix: true }) })}
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
        <h3 className="font-semibold mb-2">{t('about_trusted_devices')}</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• {t('trusted_devices_info_1')}</li>
          <li>• {t('trusted_devices_info_2')}</li>
          <li>• {t('trusted_devices_info_3')}</li>
          <li>• {t('trusted_devices_info_4')}</li>
        </ul>
      </Card>

      <AlertDialog open={!!deleteDeviceId} onOpenChange={() => setDeleteDeviceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('remove_trusted_device')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('remove_device_warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveDevice}>{t('remove')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrustedDevices;
