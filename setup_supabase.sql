-- 1. Buat Tabel `titik_air`
CREATE TABLE public.titik_air (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_sumber_air text NOT NULL,
  alamat text NOT NULL,
  volume_air text,
  akses_jalan_lebar text,
  akses_jalan_struktur text,
  foto_lokasi text,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS) untuk tabel `titik_air`
ALTER TABLE public.titik_air ENABLE ROW LEVEL SECURITY;

-- 3. Beri akses untuk CREATE, READ, UPDATE, dan DELETE pada tabel `titik_air` 
-- (Policy terbuka (Anon) untuk keperluan demonstrasi/testing)
CREATE POLICY "Enable all operations for all users"
ON public.titik_air
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Buat Storage Bucket bernama 'photos' untuk menyimpan Foto Lokasi
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Berikan akses publik untuk Upload, Baca, Update, dan Delete di bucket 'photos'
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Public Insert Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Public Update Access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'photos');

CREATE POLICY "Public Delete Access"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos');

-- 6. Buat Tabel admin_users untuk Kredensial Login
CREATE TABLE public.admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Isi satu data admin default
INSERT INTO public.admin_users (username, password)
VALUES ('admin', 'AdminBantul123!');
