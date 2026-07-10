
-- Create images bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure payment-screenshots bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Images bucket: public read
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'images');

-- Images bucket: authenticated upload with file type restriction
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'svg')
  );

-- Images bucket: authenticated update
CREATE POLICY "Authenticated users can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images');

-- Payment screenshots: users see their own + admins see all
CREATE POLICY "Users can view own payment screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
     EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid()))
  );

-- Payment screenshots: users upload their own
CREATE POLICY "Users can upload own payment screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'pdf')
  );
