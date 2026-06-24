-- ============================================================
-- CafePOS Storage Setup
-- Version: 1.0.0
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Authenticated users can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner and Manager can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "Owner and Manager can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('owner', 'manager')
  )
);
