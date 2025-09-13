-- Add images column to products table
-- This column will store an array of image file paths from the products-images storage bucket

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Create storage bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products-images', 'products-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policy for product images bucket
CREATE POLICY "Public Access for Product Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'products-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'products-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'products-images' AND auth.role() = 'authenticated');