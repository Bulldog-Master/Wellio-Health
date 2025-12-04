-- Payment methods configuration table (admin-managed)
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  method_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_es TEXT,
  description TEXT,
  description_es TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_region TEXT[], -- e.g., ['CA'] for Canada-only
  processing_fee_percent DECIMAL(5,2) DEFAULT 0,
  processing_fee_fixed DECIMAL(10,2) DEFAULT 0,
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_amount DECIMAL(10,2),
  sort_order INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'addon', 'one_time')),
  reference_id UUID, -- subscription_id or addon_id
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  external_transaction_id TEXT, -- Stripe/PayPal/etc transaction ID
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- E-Transfer verification requests (manual verification)
CREATE TABLE public.etransfer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id UUID REFERENCES public.payment_transactions(id),
  amount DECIMAL(10,2) NOT NULL,
  reference_email TEXT NOT NULL,
  confirmation_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crypto payment requests
CREATE TABLE public.crypto_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id UUID REFERENCES public.payment_transactions(id),
  crypto_currency TEXT NOT NULL,
  amount_crypto DECIMAL(20,8),
  amount_usd DECIMAL(10,2) NOT NULL,
  wallet_address TEXT,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirming', 'confirmed', 'expired', 'failed')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etransfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;

-- Payment methods: public read, admin write
CREATE POLICY "Anyone can view active payment methods"
  ON public.payment_methods FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage payment methods"
  ON public.payment_methods FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Transactions: users see own, admins see all
CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions"
  ON public.payment_transactions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- E-Transfer: users see own, admins manage
CREATE POLICY "Users can view own etransfer requests"
  ON public.etransfer_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create etransfer requests"
  ON public.etransfer_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage etransfer requests"
  ON public.etransfer_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Crypto: users see own, admins manage
CREATE POLICY "Users can view own crypto payments"
  ON public.crypto_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create crypto payments"
  ON public.crypto_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage crypto payments"
  ON public.crypto_payments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default payment methods
INSERT INTO public.payment_methods (method_key, name, name_es, description, description_es, icon, sort_order, config) VALUES
  ('stripe', 'Credit/Debit Card', 'Tarjeta de Crédito/Débito', 'Pay with Visa, Mastercard, or American Express', 'Paga con Visa, Mastercard o American Express', 'CreditCard', 1, '{"supports": ["visa", "mastercard", "amex"]}'),
  ('apple_pay', 'Apple Pay', 'Apple Pay', 'Quick checkout with Apple Pay', 'Pago rápido con Apple Pay', 'Smartphone', 2, '{"provider": "stripe"}'),
  ('google_pay', 'Google Pay', 'Google Pay', 'Quick checkout with Google Pay', 'Pago rápido con Google Pay', 'Smartphone', 3, '{"provider": "stripe"}'),
  ('paypal', 'PayPal', 'PayPal', 'Pay securely with your PayPal account', 'Paga de forma segura con tu cuenta PayPal', 'Wallet', 4, '{}'),
  ('etransfer', 'Interac e-Transfer', 'Transferencia Interac', 'Canadian e-Transfer (manual verification)', 'Transferencia electrónica canadiense (verificación manual)', 'Send', 5, '{"email": "payments@wellio.app"}'),
  ('crypto_btc', 'Bitcoin (BTC)', 'Bitcoin (BTC)', 'Pay with Bitcoin', 'Paga con Bitcoin', 'Bitcoin', 6, '{"currency": "BTC"}'),
  ('crypto_eth', 'Ethereum (ETH)', 'Ethereum (ETH)', 'Pay with Ethereum', 'Paga con Ethereum', 'Coins', 7, '{"currency": "ETH"}'),
  ('crypto_usdt', 'Tether (USDT)', 'Tether (USDT)', 'Pay with USDT stablecoin', 'Paga con la stablecoin USDT', 'DollarSign', 8, '{"currency": "USDT"}'),
  ('crypto_usdc', 'USD Coin (USDC)', 'USD Coin (USDC)', 'Pay with USDC stablecoin', 'Paga con la stablecoin USDC', 'DollarSign', 9, '{"currency": "USDC"}');

-- Update trigger for timestamps
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();