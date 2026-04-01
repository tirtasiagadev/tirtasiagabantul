# 💧 Tirta Siaga Bantul

**Project Tirta Siaga Bantul** adalah sebuah aplikasi web responsif dan platform *Geographic Information System (GIS)* yang bertujuan untuk memudahkan petugas Pemadam Kebakaran (Damkar) dan masyarakat luas dalam menemukan lokasi **sumber air darurat** guna mendukung pemadaman kebakaran di wilayah **Kabupaten Bantul, Yogyakarta**. 

Aplikasi ini mendata sebaran sumber air lengkap beserta detail krusial lainnya seperti kapasitas volume, struktur akses jalan (menentukan bisa/tidaknya dilewati armada besar), rentang jarak pengguna, hingga dokumentasi foto lokasi.

---

## ✨ Fitur Utama (Features)

- 📍 **Pemetaan Interaktif:** Eksplorasi spasial dengan peta Leaflet yang tajam, didukung marker kustom SVG untuk lokasi pengguna, titik suplai air, dan markas Pos Sektor.
- 🗺️ **Otomasi Overlay Tata Letak (GeoJSON):** Integrasi *layer spatial* secara dinamis untuk wilayah *Wilayah Manajemen Kebakaran (WMK)* per Kalurahan dan alur bentang alam *Sungai*.
- 🧭 **Navigasi Terdekat (GPS):** Deteksi otomatis titik lokasi perangkat dan algoritma perhitungan jarak udara (skala `km`) secara *real-time* menuju sumber air paling strategis.
- 🔐 **Manajemen Terpusat berbasis Auth:** Dasbor administrator modern dengan pembatasan akses untuk keamanan kontrol data (CRUD).
- 📸 **Kompresi Gambar Otomatis (On-The-Fly):** Optimasi gambar sisi aplikasi menggunakan HTML5 Canvas sebelum terunggah, mereduksi drastis pemakaian kuota dan mempercepat waktu muat halaman (*load-time*).
- 📱 **UI/UX Modern (Mobile First):** Visual antarmuka yang elegan dengan *glassmorphism*, panel kendali yang dinamis, hingga legenda dan *tooltips* interaktif persembahan standar kelas atas Tailwind.

---

## 👨‍💻 Panduan Pengguna Umum (User Guide)

Aplikasi ini dirancang sangat intuitif bagi kebutuhan operasi darurat maupun publik:
1. Buka halaman utama aplikasi di *browser* (sangat direkomendasikan memberi izin akses lokasi / GPS ketika diminta).
2. Tekan tombol **"Lokasi Saya"** (ikon target) di sudut kanan bawah peta untuk mengunci letak kordinat Anda saat ini.
3. Tekan tombol **"Cari Titik Air Terdekat"** (ikon navigasi). Peta akan bergerak otomatis dan menunjukkan titik persediaan air (*hydrant*/mata air/kolam) yang ukurannya terdekat dari radius Anda.
4. Gunakan fitur *Layer Control* (ikon tumpukan di pojok kanan atas peta) untuk menyaring informasi tampil – seperti memunculkan/menyembunyikan garis perbatasan Kalurahan (WMK) atau rute Sungai.
5. Sentuh ikon marker air hijau/biru di peta, untuk memunculkan detail pop-up. Tekan **"Lihat Detail"** untuk mendalami profil lokasi tersebut (mencakup foto jernih, aksesibilitas jalan, dsb).

---

## 🔒 Panduan Administrator (Admin Guide)

Panduan operasional bagi pengelola data *Tirta Siaga Bantul*:

1. Kunjungi rute admin di `/admin/login`.
2. Masukkan Email dan *Password* Administrator yang telah disahkan di sistem *Auth Dashboard* (Supabase).
3. Setelah masuk ke panel **Dashboard**, Anda akan disuguhkan susunan tabel daftar persediaan air yang terdaftar.
4. Tambahkan titik baru dengan menekan **"Tambah Titik Air"**, atau klik edit pada entitas yang sudah ada.
5. Pada sesi formulir (Form), isikan data deskriptif seperti **Nama, Alamat Lengkap, Volume Air (Liter),** serta **Akses Lebar & Spesifikasi Struktur Jalan**.
6. **Map Picker:** Untuk mengatur garis lintang/bujur lokasi, Anda cukup menggeser peta pada formulir secara presisi, gunakan fitur GPS otomatis, dan klik letak spesifik di peta untuk menetapkan koordinat absolut.
7. **Manajemen Berkas:** Lampirkan foto dengan mengunggah baru – format akan langsung disederhanakan oleh sistem untuk hemat laju unggah. Klik **"Simpan Data"** untuk meresmikan.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

Aplikasi ini ditopang infrastruktur dan *framework* andal yang berpusat pada kecepatan (*app-router server-side rendering*) serta keamanan data.

* **Frontend Engine:** [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
* **Styling & Styling Engine:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Database & BaaS (Backend as a Service):** [Supabase](https://supabase.com/) (PostgreSQL & Storage *Bucket*)
* **Mapping Library:** [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
* **Visual Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Instalasi Skala Lokal (Local Setup)

Bagi pengembang yang ingin men- *deploy* atau menguji arsitektur ini secara lokal:

1. Klon repositori utama ke *environment* perangkat komputer Anda.
2. Buat berkas variabel sandi bawaan dengan nama \`.env.local\` di kerangka *root*:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Lakukan instalasi rakitan dependensi menggunakan _Package Manager_ **pnpm** (atau npm/yarn):
   ```bash
   pnpm install
   ```
4. Putar peladen eksekusi fase pengembangan (*development*):
   ```bash
   pnpm dev
   ```
5. Akses sistem purna di pratinjau browser pada `http://localhost:3000`.

---

> *Dikembangkan sebagai wujud komitmen mitigasi tanggap darurat yang modern untuk kemaslahatan warga dan korps Pemadam Kebakaran Bantul, Yogyakarta.*
