import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Gift, Award, ArrowLeft, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

const PointsHistory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation('points');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEarned: 0,
    totalSpent: 0,
    currentBalance: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: txData, error: txError } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) throw txError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_points')
        .eq('id', user.id)
        .single();

      const earned = txData?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0;
      const spent = txData?.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

      setSummary({
        totalEarned: earned,
        totalSpent: spent,
        currentBalance: profile?.referral_points || 0
      });

      setTransactions(txData || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: t('error_loading'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
      case 'bonus':
        return TrendingUp;
      case 'spent':
        return TrendingDown;
      default:
        return Gift;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-success' : 'text-destructive';
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <History className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('points_history')}</h1>
            <p className="text-muted-foreground">{t('track_points')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-2">{t('current_balance')}</p>
          <p className="text-3xl font-bold text-primary">{summary.currentBalance}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-2">{t('total_earned')}</p>
          <p className="text-3xl font-bold text-success">+{summary.totalEarned}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-2">{t('total_spent')}</p>
          <p className="text-3xl font-bold text-destructive">-{summary.totalSpent}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('recent_transactions')}</h3>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t('no_transactions')}</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const Icon = getTransactionIcon(tx.transaction_type);
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background ${getTransactionColor(tx.amount)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTransactionColor(tx.amount)}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {tx.transaction_type === 'bonus' ? t('bonus') : tx.amount > 0 ? t('earned') : t('spent')}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PointsHistory;