# ⚡ Frontend UI/UX Engineering Skill & Execution Standards

Dokumen ini mendefinisikan standar keahlian (skills) dan eksekusi visual untuk mengubah kode frontend amatir menjadi produk SaaS kelas dunia. AI wajib menggunakan arsitektur utilitas Tailwind CSS v4 di bawah ini sebagai aturan baku penulisan komponen.

---

## 1. Spatial Arithmetic (Sistem Spasi & Padding)
Kesalahan terbesar UI amatir adalah ketidakjelasan ruang napas (*whitespace*). Ruang napas bukanlah ruang kosong, melainkan elemen desain untuk mengarahkan mata pengguna.

*   **Page Canvas:** Jangan biarkan elemen menyentuh tepi layar. Gunakan padding maksimal pada kontainer utama: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10`.
*   **Card Anatomy:** Jarak dalam (*internal padding*) sebuah kartu minimal adalah 24px hingga 32px untuk memberikan kesan mewah: `p-6 sm:p-8`.
*   **Logical Grouping:** Jarak antar elemen input kecil yang saling berhubungan wajib rapat (`space-y-1.5` atau `gap-2`), sedangkan jarak antar section besar wajib renggang (`space-y-6` atau `gap-8`).

---

## 2. Micro-Typography & Kontras Warna
Jangan gunakan ukuran font yang monoton. Manfaatkan kontras ukuran (*font size*) dan ketebalan (*font weight*) untuk menciptakan hierarki informasi instan.

*   **Dark Mode Contrast:** Latar belakang teks gelap wajib menggunakan warna arang (*charcoal*), bukan hitam pekat murni, agar nyaman di mata: `text-slate-950` atau `text-slate-900`.
*   **Secondary Context:** Informasi pelengkap (sub-judul, deskripsi pendek) wajib diturunkan kontrasnya menjadi `text-slate-500` atau `text-slate-600` dengan ukuran `text-sm`.
*   **Form Labels:** Label input wajib berukuran mikro, tebal, memiliki tracking renggang, dan warna yang tegas agar mudah dipindai: `text-[11px] font-bold text-slate-700 uppercase tracking-widest`.

---

## 3. Component Elevation & Depth (Aturan Layering)
UI yang bagus memiliki ilusi kedalaman. Hindari tampilan datar yang membosankan dengan memanfaatkan *box-shadow* dan *border subtilitas*.

*   **The Canvas Substrate:** Latar belakang aplikasi (*viewport background*) wajib menggunakan warna abu-abu netral sangat terang: `bg-slate-50/60` atau `bg-zinc-50`.
*   **The Card Component:** Kartu di atas kanvas wajib berwarna putih murni (`bg-white`) dengan border yang sangat tipis agar menyatu alami (`border border-slate-200/50`).
*   **SaaS Soft Shadow:** Gunakan bayangan multi-layer yang halus untuk memisahkan kartu dari background:
    `shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.05)]`
*   **Modal Interlayer:** Jendela popup (Modal) wajib memiliki kedalaman paling tinggi dengan bayangan pekat namun diredam: `shadow-xl border border-slate-200`.

---

## 4. Interaction Physics (Kondisi Form & Input)
Kotak input bawaan browser adalah musuh utama keindahan. Rombak total interaksi kontrol form menjadi sangat responsif dan premium.

*   **The Input Shell:** Form input wajib menggunakan tinggi yang seragam, warna background diredam, dan transisi yang halus:
    `w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400/70 transition-all duration-200 ease-out`
*   **The Premium Focus State:** Ketika input aktif, background berubah menjadi putih murni, border berubah menjadi warna aksen (indigo), dan berhipnotis dengan bayangan cincin luar yang halus:
    `focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/8`
*   **Dropzone Excellence:** Tempat unggah file tidak boleh terlihat kaku. Gunakan border putus-putus yang halus dengan efek hover interaktif:
    `border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/5 rounded-xl transition-colors duration-200`

---

## 5. Micro-Animations & States
Aplikasi yang terasa "hidup" adalah aplikasi yang merespons setiap tindakan pengguna dengan animasi mikro.

*   **Button Transitions:** Setiap tombol wajib memiliki durasi transisi saat ditekan atau disentuh kursor: `transition-all duration-150 active:scale-[0.98]`.
*   **Loading State:** Jangan gunakan teks "Loading..." yang membosankan. Gunakan ikon spinner SVG yang berputar mulus: `animate-spin h-4 w-4 text-current`.
*   **Component Mounting:** Saat halaman pertama kali terbuka, berikan efek transisi memudar ke atas yang halus: `animate-fade-in-up` atau transisi keaslian opacity.