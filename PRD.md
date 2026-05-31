# Product Requirement Document (PRD) — NebulaKit

## 1. Project Overview
*   **Project Name:** NebulaKit
*   **Target Client:** Stichting Nebulist (Studio Seni Instalasi Kinetik Premium, Belanda)
*   **Objective:** Membangun platform SaaS otomatisasi akuisisi B2B (Sales & Marketing Engine) yang membantu pemilik bisnis seni menemukan berbagai prospek klien (korporasi, agensi, komersial, hingga klub malam) di Belanda, melakukan *lead scoring*, dan menghasilkan draf penawaran yang dipersonalisasi.
*   **Timeline Constraint:** 72 Jam (Hackathon Deadline: 31 Mei 2026, 17.00)
*   **Execution Strategy:** Solo Vibe Coding (React, Tailwind CSS, Supabase, Tavily API, Gemini API).

## 2. User Persona & Target Audience
*   **User (The Creative):** Tim Stichting Nebulist yang ingin menyewakan instalasi mereka (seperti *Giant Bubble/Foam Machine*) tanpa harus membuang waktu riset pasar manual.
*   **Target Prospect (The Client):** Bersifat inklusif untuk semua skala bisnis yang membutuhkan aktivasi visual dan pengalaman pengunjung:
    *   **Komersial & Hiburan:** Klub malam (*nightclubs*), bar, kafe trendi, dan pengelola taman hiburan lokal.
    *   **Event & Komunitas:** Penyelenggara festival musik, *wedding organizer*, festival seni komunitas, dan pameran.
    *   **Institusi & Korporat:** Agensi kreatif, museum kontemporer, dan *Gemeente* (Pemerintah Kota) untuk proyek seni ruang publik.
*   **Psychological Nuance:** Budaya bisnis Belanda yang *direct* dan *straight-to-the-point*. Gaya pendekatan disesuaikan oleh AI berdasarkan jenis klien (misalnya: lebih dinamis dan fokus pada atmosfer pesta untuk klub malam, namun tetap formal dan transparan untuk korporat/pemerintah).

## 3. Product Scope & Core Features (MVP)

### Feature 3.1: The Executive Intake (Form Input)
*   **Description:** Halaman input bersih untuk mendefinisikan aset seni dan target pasar.
*   **Data Fields:** Nama Instalasi, Deskripsi Visual, Unggah Foto, Biaya Modal, Harga Sewa, Target Wilayah, dan Target Kategori Industri.

### Feature 3.2: GDPR-Compliant AI Prospecting Engine (Backend)
*   **Technical Workflow:**
    1.  **Lead Finder:** Memanggil *Search API* (Tavily/Serper) menggunakan kata kunci otomatis untuk mencari data bisnis publik (Patuh GDPR).
    2.  **AI Analyser (Gemini):** Memproses data bisnis dan mencocokkannya dengan produk.
    3.  **AI Lead Scoring:** Klasifikasi prospek menjadi `Hot`, `Warm`, atau `Cold` disertai alasan logisnya.
    4.  **Dual-Language Tone-Adjusted Pitch Generator:** Menghasilkan draf email penawaran bahasa Inggris dan Belanda yang disesuaikan dengan jenis industri target.

### Feature 3.3: Enterprise Kanban CRM & Action Center (Dashboard UI)
*   **Description:** Antarmuka visual minimalis berbentuk tabel atau Kanban Board (`Leads Found`, `Pitch Sent`, `Replied`).
*   **Action Modal:** Menampilkan detail prospek, fitur *One-Click Copy* email, dan kotak interaktif **AI Next-Step Advice** untuk menangani keberatan/negosiasi klien (*objection handling*).

## 4. Design & UI/UX Guidelines
*   **Design Language:** Clean Enterprise Minimalist (Fokus pada whitespace, bersih, mirip dasbor Stripe/Linear).
*   **Color Palette:** Latar belakang `Slate-50`, teks `Slate-900`, aksen `Indigo-600`.
*   **Status Badges (Soft Pastel):** Hot (`bg-rose-50 text-rose-700`), Warm (`bg-amber-50 text-amber-700`), Cold (`bg-blue-50 text-blue-700`).

## 5. Non-Functional Requirements
*   **GDPR Compliance:** Hanya menggunakan data entitas bisnis terbuka. Tidak mengambil data personal individu secara ilegal.
*   **Reproducibility:** Menyediakan berkas `PROMPTS.md` berisi dokumentasi perintah AI untuk membuktikan metodologi kerja yang terstruktur kepada juri.