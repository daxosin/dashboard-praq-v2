-- =============================================
-- STORAGE SETUP : Bucket photos pour terrain
-- Dashboard PRAQ v2 — Pharma78
-- =============================================

-- 1. Créer le bucket photos (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy : Allow authenticated users to upload photos
CREATE POLICY IF NOT EXISTS "Allow terrain staff to upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = 'terrain-photos'
);

-- 3. Policy : Allow public to view photos
CREATE POLICY IF NOT EXISTS "Allow public to view terrain photos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = 'terrain-photos'
);

-- 4. Policy : Allow users to delete their own photos
CREATE POLICY IF NOT EXISTS "Allow users to delete own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = 'terrain-photos'
  AND owner = auth.uid()
);

-- Vérifier les policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;
