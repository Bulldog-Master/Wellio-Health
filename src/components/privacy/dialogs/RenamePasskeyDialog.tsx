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
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface RenamePasskeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newName: string;
  onNameChange: (name: string) => void;
  onConfirm: () => void;
}

const RenamePasskeyDialog = ({
  open,
  onOpenChange,
  newName,
  onNameChange,
  onConfirm,
}: RenamePasskeyDialogProps) => {
  const { t } = useTranslation('privacy');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('rename_passkey')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('rename_passkey_description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Input
            value={newName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t('placeholder_passkey_name')}
            onKeyDown={(e) => e.key === 'Enter' && newName.trim() && onConfirm()}
            autoFocus
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={!newName.trim()}>
            {t('rename')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RenamePasskeyDialog;
