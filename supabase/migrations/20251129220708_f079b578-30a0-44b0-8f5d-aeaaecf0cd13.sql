-- Allow authenticated users to view all profiles (needed for followers, close friends, etc.)
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);