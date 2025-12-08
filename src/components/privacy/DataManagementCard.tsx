import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DataManagementCardProps {
  onExportData: () => void;
  onDeleteAccount: () => void;
}

const DataManagementCard = ({
  onExportData,
  onDeleteAccount,
}: DataManagementCardProps) => {
  const { t } = useTranslation('privacy');

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-destructive/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-destructive/10 rounded-xl">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <CardTitle>{t('data_management')}</CardTitle>
            <CardDescription>
              {t('data_management_description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full justify-start" onClick={onExportData}>
          <Download className="w-4 h-4 mr-2" />
          {t('export_data')}
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={onDeleteAccount}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {t('delete_button')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataManagementCard;
