import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft } from "lucide-react";

const OrdersPayments = () => {
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-bold mb-2">Orders & Payments</h1>
          <p className="text-muted-foreground">View your orders and manage payment methods</p>
        </div>
      </div>

      <Card className="p-12 text-center">
        <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
        <p className="text-muted-foreground">
          Your order history and payment methods will appear here.
        </p>
      </Card>
    </div>
  );
};

export default OrdersPayments;
