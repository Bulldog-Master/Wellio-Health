import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft } from "lucide-react";

const OrdersPayments = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('settings');

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
          <h1 className="text-3xl font-bold mb-2">{t('orders_payments_title')}</h1>
          <p className="text-muted-foreground">{t('orders_payments_subtitle')}</p>
        </div>
      </div>

      <Card className="p-12 text-center">
        <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">{t('no_orders_yet')}</h3>
        <p className="text-muted-foreground">
          {t('orders_will_appear')}
        </p>
      </Card>
    </div>
  );
};

export default OrdersPayments;
