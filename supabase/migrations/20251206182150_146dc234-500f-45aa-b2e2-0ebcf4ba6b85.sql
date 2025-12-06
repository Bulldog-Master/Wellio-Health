-- 2. Fix Professional Applications Metadata - Restrict to owner and admin only
DROP POLICY IF EXISTS "Users can view own applications" ON professional_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON professional_applications;

CREATE POLICY "Users can view own applications"
ON professional_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON professional_applications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix Payment Methods - Hide sensitive config from non-admins
DROP POLICY IF EXISTS "Only admins can view payment methods directly" ON payment_methods;
DROP POLICY IF EXISTS "Admins can manage payment methods" ON payment_methods;

CREATE POLICY "Only admins can view payment methods directly"
ON payment_methods FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage payment methods"
ON payment_methods FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));