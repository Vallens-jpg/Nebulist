# Technical Architecture & UI/UX Design — NebulaKit

## 1. Backend Design & Data Integration

Backend menggunakan arsitektur *serverless* dengan Supabase sebagai BaaS dan orkestrasi API eksternal yang dipicu dari frontend.

### A. Alur Orkestrasi Data (Core AI Engine)
1.  **Trigger:** Frontend mengirimkan `target_industry` dan `target_region` ke fungsi backend.
2.  **Step 1 (Tavily API):** Melakukan hit API untuk mengambil maksimal 5 data bisnis publik (Nama, Website, Snippet Deskripsi) di wilayah Belanda target.
3.  **Step 2 (Gemini API):** Mengirimkan data bisnis dan spesifikasi produk ke Gemini API dengan instruksi ketat: menghasilkan klasifikasi skor, alasan kecocokan, serta 2 draf email penawaran (Inggris formal & Belanda direct) dalam format JSON murni.
4.  **Step 3 (Supabase DB):** Melakukan *parsing* JSON dan menyimpan data ke tabel `leads`.

### B. Database Schema (Supabase SQL)
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    base_cost NUMERIC,
    rental_price NUMERIC,
    target_industry TEXT,
    target_region TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    website TEXT,
    description TEXT,
    lead_score TEXT CHECK (lead_score IN ('Cold', 'Warm', 'Hot')),
    score_reason TEXT,
    pitch_email_en TEXT,
    pitch_email_nl TEXT,
    status TEXT CHECK (status IN ('Leads Found', 'Pitch Sent', 'Replied')) DEFAULT 'Leads Found',
    created_at TIMESTAMP DEFAULT NOW()
);
```
## 2. UI/UX Blueprint

Aplikasi dibangun sebagai **Single Page Application (SPA)** dengan Sidebar navigasi statis dan ruang konten utama yang lega.

### A. Komponen Halaman

#### 1. Tab Dashboard & Input Form
*   **Sisi Kiri (Product Details):** 
    *   Input teks nama produk.
    *   Textarea deskripsi produk/instalasi secara visual.
    *   Dropzone untuk unggah foto aset (langsung terhubung ke Supabase Storage).
    *   Input angka untuk harga sewa (*rental price*) dan biaya modal (*base cost*).
*   **Sisi Kanan (Target Market):** 
    *   Dropdown kategori industri (*Nightclubs & Bars, Music Festivals, Corporate Events, Museums & Public Art*).
    *   Input teks wilayah target di Belanda (contoh: Amsterdam, Rotterdam).
*   **Aksi:** Tombol `"Run AI Prospecting Engine"` dengan status animasi loading yang bersih saat AI sedang memproses data di balik layar.

#### 2. Tab Lead Management (Kanban CRM)
*   **Papan Kanban 3 Kolom:** Berjajar horizontal membagi prospek berdasarkan status alur kerja: `Leads Found` | `Pitch Sent` | `Replied`.
*   **Kartu Prospek (Leads Card):** Komponen kartu di dalam kolom yang menampilkan:
    *   Nama Perusahaan.
    *   Badge skor dengan warna pastel diredam (*soft pastel colors*): Hot (`bg-rose-50 text-rose-700`), Warm (`bg-amber-50 text-amber-700`), Cold (`bg-blue-50 text-blue-700`).
    *   Tombol `"Review & Pitch"` untuk membuka detail interaktif.

#### 3. Modal Popup (Action Center)
*   Jendela popup yang terbuka otomatis di tengah layar ketika kartu prospek diklik.
*   **Konten Inside Modal:**
    *   Menampilkan alasan penilaian skor dari AI (*Score Reason*).
    *   Tab pemindah dokumen penawaran: `Email (English)` dan `Email (Nederlands)`.
    *   Tombol **"One-Click Copy"** untuk menyalin draf email yang dipilih secara instan.
    *   Kolom input teks respons klien (*Objection Handler*): Tempat pengguna memasukkan keluhan atau balasan nego dari klien untuk memicu fungsi **AI Next-Step Advice** secara instan sebagai panduan memenangkan kesepakatan sewa.