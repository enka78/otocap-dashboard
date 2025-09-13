-- Setup storage bucket for product images
-- This script creates the products-images bucket and sets up proper access policies

-- Create storage bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products-images', 'products-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Set up RLS policy for product images bucket - Public read access
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

-- Note: Your products table already has the correct structure with image1, image2, image3, image4 columns
-- No changes needed to the products table structure