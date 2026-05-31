# 📋 PROMPTS.md — AI Prompt Engineering Documentation
### NebulaKit · Stichting Nebulist · Hackathon 2026

> **Tujuan Dokumen:** Membuktikan kepada juri bahwa setiap interaksi dengan model AI bersifat deterministik, terstruktur, dan dapat direproduksi. Dokumen ini mendokumentasikan seluruh instruksi prompt yang digunakan dalam aplikasi beserta alasan teknis di balik setiap keputusan desain prompt.

---

## 1. Metodologi Umum

NebulaKit menggunakan model **Gemini 1.5 Flash** via Google AI Studio API secara langsung dari sisi klien (React/Vite). Seluruh interaksi AI dirancang dengan prinsip:

| Prinsip | Implementasi |
|---|---|
| **Strict JSON Enforcement** | `responseMimeType: 'application/json'` mencegah model mengeluarkan output di luar JSON |
| **Role Assignment** | Setiap prompt diawali dengan penetapan peran ahli yang spesifik |
| **Contextual Grounding** | Data produk dan prospek nyata diinjeksikan ke dalam prompt (RAG-lite pattern) |
| **Constraint-First Prompting** | Rules dideklarasikan secara eksplisit di akhir prompt untuk mengurangi halusinasi |
| **Bilingual Output** | Satu panggilan API menghasilkan dua versi email (EN + NL) secara simultan untuk efisiensi token |

---

## 2. Prompt #1 — Core AI Prospecting Pipeline

**File:** `src/services/aiOrchestrator.js` → `buildPrompt()`  
**Model:** `gemini-1.5-flash`  
**Trigger:** Pengguna mengklik tombol "Run AI Prospecting Engine"  
**Output Target:** Bulk insert ke tabel `leads` di Supabase

### 2.1 Teks Prompt Lengkap

```text
You are a B2B sales strategist for Stichting Nebulist, a premium kinetic art 
installation company from the Netherlands.

PRODUCT:
- Name: {spec.name}
- Description: {spec.description}
- Rental Price: €{spec.rentalPrice} per event
- Base Cost: €{spec.baseCost}
- Target Industry: {industry}

PROSPECTS:
[Array JSON dari mock lead search — 3-4 venue nyata per kombinasi industri+kota]

TASK: For each prospect, return a JSON array. Each element MUST match this 
schema exactly:
{
  "company_name": "<exact name>",
  "website": "<exact website>",
  "description": "<exact description>",
  "lead_score": "Hot" | "Warm" | "Cold",
  "score_reason": "<2 sentences explaining the score based on product-prospect fit>",
  "pitch_email_en": "<full formal B2B email in English — include Subject:, greeting,
                      3 paragraphs, sign-off from Stichting Nebulist>",
  "pitch_email_nl": "<volledige zakelijke e-mail in het Nederlands — directe 
                      poldercultuur-toon, inclusief Onderwerp:, aanhef, 3 alinea's,
                      afsluiting namens Stichting Nebulist>"
}

RULES:
- Return ONLY the raw JSON array. No markdown. No code fences. No extra text.
- lead_score must be exactly "Hot", "Warm", or "Cold".
- Both emails must be fully written, personalised to the specific company — 
  not generic templates.
```

### 2.2 Keputusan Desain Prompt

**Mengapa `responseMimeType: 'application/json'`?**  
Parameter ini memaksa Gemini untuk mengeluarkan JSON yang valid secara sintaksis — model tidak akan menambahkan penjelasan atau markdown di luar struktur JSON. Ini menghilangkan kebutuhan regex stripping yang rapuh.

**Mengapa skema didefinisikan secara eksplisit di dalam prompt?**  
Tanpa definisi skema yang ketat, model cenderung menggunakan nama field yang berbeda (contoh: `email_en` vs `pitch_email_en`). Pendekatan ini adalah bentuk *Schema-Constrained Generation*.

**Mengapa `temperature: 0.7`?**  
Nilai ini menyeimbangkan kreativitas bahasa email dengan konsistensi output JSON. Nilai lebih tinggi (>0.9) meningkatkan risiko output tidak valid; nilai lebih rendah (<0.4) menghasilkan email yang terlalu generik.

**Mengapa dua email dalam satu panggilan?**  
Menggabungkan `pitch_email_en` dan `pitch_email_nl` dalam satu request menghemat 1 API call per prospek — untuk 4 prospek, ini menghemat 4 panggilan API yang setara dengan ~50% penghematan biaya dan latensi.

**Mengapa pola `"Polder Model" tone` untuk email Belanda?**  
Budaya bisnis Belanda (*Poldercultuur*) dikenal dengan komunikasi yang sangat langsung, transparan, dan anti-basa-basi. Email berbahasa Belanda yang terlalu formal atau memuji-muji justru akan dianggap tidak profesional. Prompt secara eksplisit menginstruksikan: *"directe poldercultuur-toon, no-nonsense"*.

---

## 3. Prompt #2 — AI Objection Handler

**File:** `src/views/leads/LeadsView.jsx` → `ObjectionHandler` component  
**Model:** `gemini-1.5-flash`  
**Trigger:** Pengguna mengetik balasan klien dan mengklik "Get AI Advice"  
**Output Target:** Teks saran negosiasi taktis (tidak disimpan ke DB)

### 3.1 Teks Prompt Lengkap

```text
You are a B2B sales coach for Stichting Nebulist, a Dutch kinetic art 
installation company.

The sales rep is negotiating with: {lead.company_name} ({lead.lead_score} lead).
Product: kinetic art installation (foam/bubble machine) for events.

The client responded: "{input}"

Give a concise tactical reply strategy (3–5 sentences max). Be direct and 
practical. Focus on reframing objections and moving toward a signed rental 
agreement. Write in English.
```

### 3.2 Keputusan Desain Prompt

**Mengapa `temperature: 0.8` (lebih tinggi dari Prompt #1)?**  
Saran negosiasi membutuhkan variasi linguistik yang lebih tinggi — setiap balasan klien unik dan respons AI harus terasa segar, bukan formulaik.

**Mengapa `maxOutputTokens: 512` (dibatasi)?**  
Saran taktis yang terlalu panjang justru kontraproduktif dalam situasi negosiasi real-time. 512 token cukup untuk 3–5 kalimat padat tanpa padding berlebihan.

**Mengapa konteks `lead_score` diinjeksikan?**  
Model perlu mengetahui "temperatur" hubungan saat ini. Saran untuk klien `Hot` (hampir deal) berbeda dari `Cold` (belum tertarik) — pendekatan closing vs pendekatan nurturing.

**Mengapa tidak menggunakan JSON output di sini?**  
Output bebas teks lebih tepat untuk saran naratif. Memaksakan JSON di sini akan menambah overhead parsing tanpa manfaat struktural.

---

## 4. Arsitektur Data Flow (End-to-End)

```
[User Input Form]
       │
       ▼
[getMockLeads(industry, region)]  ← Tavily stub (venue nyata per kota)
       │
       ▼
[buildPrompt(leads, productSpec)] ← Konstruksi prompt dengan data aktual
       │
       ▼
[Gemini 1.5 Flash API]
  - responseMimeType: application/json
  - temperature: 0.7
  - maxOutputTokens: 8192
       │
       ▼
[JSON.parse(response)]            ← Strip markdown fences → parse
       │
       ▼
[Sanitise + Validate scores]      ← Pastikan Hot/Warm/Cold, bukan undefined
       │
       ▼
[Supabase bulk INSERT → leads]    ← project_id, status: 'Leads Found'
       │
       ▼
[LeadsView Kanban]                ← Real-time display via useAllLeads()
```

---

## 5. Mock Lead Data Strategy (GDPR Compliance)

Sesuai spesifikasi PRD §5 (Non-Functional Requirements), NebulaKit **hanya menggunakan data entitas bisnis publik**:

- Semua venue dalam mock database adalah bisnis yang terdaftar secara publik dan dapat ditemukan melalui pencarian web biasa
- Tidak ada data personal individu (nama karyawan, nomor telepon pribadi) yang diproses
- Dalam implementasi produksi, Tavily API akan digunakan untuk mengambil data yang sama dari sumber publik (website bisnis, direktori publik Belanda)
- Seluruh data disimpan di Supabase dengan akses terbatas melalui Row Level Security (RLS)

### Cakupan Mock Database

| Industri | Kota | Jumlah Venue |
|---|---|---|
| Nightclubs & Bars | Amsterdam | 4 |
| Nightclubs & Bars | Rotterdam | 3 |
| Nightclubs & Bars | Utrecht | 2 |
| Music Festivals | Amsterdam | 3 |
| Music Festivals | Rotterdam | 2 |
| Corporate Events | Amsterdam | 3 |
| Corporate Events | Rotterdam | 2 |
| Museums & Public Art | Amsterdam | 4 |
| Museums & Public Art | Rotterdam | 2 |

---

## 6. Reproduksibilitas

Seluruh prompt dapat direproduksi secara mandiri:

1. **Install dependencies:** `npm install`
2. **Isi `.env.local`** dengan API keys (Supabase + Gemini)
3. **Jalankan:** `npm run dev`
4. **Isi form Dashboard** → klik "Run AI Prospecting Engine"
5. **Hasilnya identik** untuk kombinasi industri + wilayah yang sama (dengan variasi natural dari model)

> Dokumentasi ini dibuat sebagai bukti metodologi kerja terstruktur untuk keperluan penilaian juri Hackathon NebulaKit 2026.
