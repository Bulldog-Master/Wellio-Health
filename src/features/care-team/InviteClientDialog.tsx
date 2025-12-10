import { useTranslation } from 'react-i18next';
import { Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface InviteClientDialogProps {
  code: string;
  onClose: () => void;
}

export function InviteClientDialog({ code, onClose }: InviteClientDialogProps) {
  const { t } = useTranslation(['professional', 'common']);

  const inviteText = t('invite_text', {
    defaultValue: `Download Wellio and enter this invite code in Care Team to connect with me: ${code}`,
    code,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteText);
      toast.success(t('invite_copied', 'Invite copied to clipboard'));
    } catch {
      toast.error(t('common:error', 'Could not copy. Please copy manually.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl border bg-background p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {t('invite_client', 'Invite a client')}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          {t('invite_client_desc', "Share this code with a client so they can connect with you from their Care Team screen. They'll see that you only receive functional trends, not their raw logs.")}
        </p>
        
        <div className="rounded-lg border bg-card px-3 py-2">
          <p className="font-mono text-lg font-bold tracking-widest">{code}</p>
        </div>
        
        <textarea
          readOnly
          className="w-full rounded-md border bg-muted/40 p-2 text-xs resize-none"
          rows={2}
          value={inviteText}
        />
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common:close', 'Close')}
          </Button>
          <Button size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            {t('copy_invite', 'Copy invite')}
          </Button>
        </div>
      </div>
    </div>
  );
}
