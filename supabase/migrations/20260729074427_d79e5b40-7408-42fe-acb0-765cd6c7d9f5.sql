DROP POLICY IF EXISTS "auth upload public-assets" ON storage.objects;
DROP POLICY IF EXISTS "auth update public-assets" ON storage.objects;
DROP POLICY IF EXISTS "auth delete public-assets" ON storage.objects;

CREATE POLICY "admin upload public-assets" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "admin update public-assets" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "admin delete public-assets" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'super_admin'));