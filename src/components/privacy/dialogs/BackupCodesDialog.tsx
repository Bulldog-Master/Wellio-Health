import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Key, Download } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface BackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backupCodes: string[];
}

const BackupCodesDialog = ({
  open,
  onOpenChange,
  backupCodes,
}: BackupCodesDialogProps) => {
  const { t } = useTranslation('privacy');

  const handleDownload = () => {
    const blob = new Blob(
      [backupCodes.join('\n')], 
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellio-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success(t('toast_codes_copied'));
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            {t('save_backup_codes')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('backup_codes_description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-2 gap-2 mb-4 p-4 bg-muted rounded-lg font-mono text-sm">
            {backupCodes.map((code, index) => (
              <div key={index} className="p-2 bg-background rounded border">
                {code}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              {t('download_codes')}
            </Button>
            <Button onClick={handleCopy} variant="outline" className="flex-1">
              {t('copy_all')}
            </Button>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            {t('saved_codes')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BackupCodesDialog;
