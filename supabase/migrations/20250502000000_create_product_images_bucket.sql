
-- Create a bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'product-images', 'product-images', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'product-images'
);

-- Set up policy to allow anyone to view product images
CREATE POLICY "Public can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

-- Allow authenticated users with admin/editor role to upload product images
CREATE POLICY "Authenticated users with admin/editor role can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
);

-- Allow authenticated users with admin/editor role to update product images
CREATE POLICY "Authenticated users with admin/editor role can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
);

-- Allow authenticated users with admin/editor role to delete product images
CREATE POLICY "Authenticated users with admin/editor role can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
);
