# TUMATA — Wedding Studio Management System

Sistem manajemen terpusat untuk usaha fotografi dan videografi pernikahan (**Wedding Studio**), yang mengelola seluruh alur kerja mulai dari calon klien (*lead*), penawaran harga, booking, penjadwalan acara, deteksi bentrok jadwal, progres 10 tahapan produksi, pencatatan keuangan (invoice, pembayaran, verifikasi kwitansi, pengeluaran), notulensi rapat, penugasan tim, hingga penerbitan dokumen PDF resmi dan integrasi pengiriman WhatsApp.

---

## 📸 Identitas dan Branding TUMATA
- **Nama Aplikasi:** TUMATA — Wedding Studio Management System
- **Warna Identitas:** Hijau Zamrud (*Deep Emerald Green* — `#064E3B`, `#047857`) & Mint Accent
- **Aset Logo:** `assets/tumata-logo.png` (wordmark hijau, juga dipakai untuk favicon `frontend/public/favicon.png`)
- **Tipografi:** Serif Elegan untuk Judul (*Cinzel* / *Playfair Display*) & Sans-serif Modern untuk Data (*Plus Jakarta Sans* / *Inter*).

---

## 🛠️ Arsitektur Teknologi

| Bagian | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Backend** | Go (Golang) + Gin Framework | Struktur modular: *handlers*, *services*, *models*, *middleware*, *routes*, *database*. |
| **Database** | PostgreSQL & Pure-Go SQLite | Dual driver via GORM. Otomatis beralih ke SQLite lokal (`tumata.db`) tanpa perlu instalasi CGO / PostgreSQL eksternal, dan langsung siap terhubung ke PostgreSQL jika `DB_TYPE=postgres` diatur. |
| **Frontend** | React 19 + TypeScript + Vite | Tailwind CSS v4, Lucide Icons, React Router v7, desain responsif desktop & mobile. |
| **Dokumen** | Backend PDF Engine (`go-pdf/fpdf`) | Menghasilkan berkas PDF A4 ber-branding resmi studio dengan *data snapshot* permanen. |
| **Cetak** | Browser Print & Download | Dukungan cetak langsung dari browser atau simpan file lokal. |
| **Pesan** | WhatsApp Click-to-Chat Link | Menghasilkan tautan langsung `https://wa.me/...` dengan format pesan profesional dan siap kirim ke nomor pengantin. |

---

## 📋 Fitur yang Telah Diimplementasikan Sesuai Rancangan

### 1. Dashboard (Menu 1)
- **Ringkasan Metrik:** Proyek bulan ini, proyek aktif, proyek lewat deadline, penerimaan pembayaran, total piutang, pengeluaran, dan laba bersih.
- **Jadwal Terdekat:** Menampilkan akad, resepsi, prewedding terdekat lengkap dengan indikator deteksi bentrok.
- **Tagihan Belum Lunas:** Daftar invoice yang perlu ditindaklanjuti dengan tombol 1-klik follow-up WhatsApp.
- **Tugas Tim Produksi:** Menampilkan tahap pekerjaan yang mendekati batas waktu (*deadline*).

### 2. Manajemen Klien (Menu 2)
- Menyimpan identitas calon pengantin (Nama pasangan, *Bride*, *Groom*, WhatsApp, Email, Instagram, Alamat).
- Pelacakan sumber prospek (*Instagram*, *TikTok*, *Rekomendasi*, *Walk-in*, *Website*, *Lainnya*).
- Riwayat seluruh proyek dan berkas dokumen PDF per klien.
- Catatan preferensi konsep dan permintaan khusus klien.

### 3. Kalender & Jadwal (Menu 3)
- Tampilan kalender visual bulanan interaktif dan agenda per hari.
- Kategori acara: Akad Nikah, Resepsi, Prewedding, Meeting Klien, Technical Meeting, dan Batas Waktu.
- **Algoritma Deteksi Bentrok Jadwal (*Conflict Detection*):**
  - Deteksi bentrok irisan waktu antar-acara di berbagai lokasi venue.
  - Deteksi bentrok jadwal penugasan anggota tim yang sama di proyek yang berbeda pada waktu bersamaan.
  - Memberikan peringatan instan (*warning alert*) sebelum dan setelah jadwal disimpan.

### 4. Proyek & Booking (Menu 4)
- Penomoran proyek unik otomatis: `PRJ-YYYYMM-XXX`.
- Alur pipa status proyek:
  `Lead` → `Penawaran` → `Menunggu DP` → `Booked` → `Persiapan` → `Berlangsung` → `Editing` → `Review/Revisi` → `Selesai` → `Diarsipkan`.
- Detail proyek komprehensif dengan tab navigasi:
  - **Ringkasan:** Info klien, venue, tanggal, nilai kontrak, laba proyek, dan persentase progres.
  - **Jadwal:** Daftar acara khusus proyek bersangkutan.
  - **Tahap Produksi:** 10 tahapan alur kerja dokumentasi studio.
  - **Keuangan:** Invoice tagihan, transaksi pembayaran, dan pengeluaran proyek.
  - **Notulensi:** Rangkuman meeting dan checklist tindak lanjut.
  - **Dokumen:** Pusat penerbitan PDF (Penawaran, Invoice, Kwitansi, Kontrak).
  - **Tim Bertugas:** Alokasi fotografer, videografer, dan editor.

### 5. Progres Pekerjaan (Menu 5)
10 Tahapan produksi standar industri wedding studio:
1. **Pengambilan foto/video**
2. **Backup file & Ingest**
3. **Seleksi foto**
4. **Editing foto**
5. **Editing video**
6. **Review internal studio**
7. **Revisi klien**
8. **Finalisasi & Cetak album**
9. **Pengiriman hasil**
10. **Konfirmasi penyerahan & Penutupan**

Setiap tahap memiliki status (`Menunggu`, `Sedang Dikerjakan`, `Review`, `Selesai`), penanggung jawab (PIC), batas waktu (*deadline*), dan otomatis mengkalkulasi persentase penyelesaian proyek.

### 6. Notulensi & Catatan Klien (Menu 6)
- Pencatatan hasil *technical meeting* dan diskusi vendor.
- Menyimpan tanggal rapat, peserta hadir, topik pembahasan, permintaan khusus, dan keputusan kesepakatan.
- *Checklist* tugas tindak lanjut (*action items*) yang dapat dicentang selesai secara interaktif.

### 7. Keuangan & Pembayaran (Menu 7)
- **Invoice:** Penomoran otomatis `INV-YYYYMM-XXX`, rincian tagihan (*itemized*), tanggal jatuh tempo, dan status tagihan (*unpaid*, *partial*, *paid*).
- **Pembayaran:** Pencatatan DP, Cicilan, Pelunasan, metode pembayaran (*Transfer*, *Tunai*, *QRIS*, dll.), dan referensi transaksi.
- **Aturan Verifikasi Pembayaran:** Kwitansi sah hanya dapat diterbitkan untuk pembayaran yang telah diverifikasi (uang masuk rekening).
- **Pengeluaran:** Pembukuan biaya per kategori (Honor Tim, Transportasi, Konsumsi, Sewa Alat, Cetak Album/Frame, Vendor Luar, Lain-lain).
- **Kalkulasi Otomatis:**
  - $\text{Sisa Tagihan} = \text{Total Kontrak} - \text{Total Pembayaran Terverifikasi}$
  - $\text{Laba Bersih Proyek} = \text{Total Pendapatan Terverifikasi} - \text{Total Pengeluaran}$

### 8. Manajemen Tim (Menu 8)
- Direktori tim studio berdasarkan peran (*Admin*, *Fotografer*, *Videografer*, *Editor Foto*, *Editor Video*, *Koordinator*, *Pemilik*).
- Pemantauan beban kerja: Jumlah proyek yang ditangani, tugas aktif, dan tugas yang sudah selesai.

### 9. Dokumen PDF & Integrasi WhatsApp (Menu 9)
Penerbitan 4 jenis dokumen PDF ber-branding TUMATA:
1. **Penawaran Harga (*Quotation*):** Rincian paket layanan, fitur, dan nilai investasi.
2. **Invoice Tagihan:** Rincian item tagihan, jatuh tempo, sisa pembayaran, dan instruksi rekening bank.
3. **Kwitansi Resmi:** Bukti penerimaan uang sah dengan stempel verifikasi studio.
4. **Surat Perjanjian Kontrak Kerja (*Agreement*):** Pasal hak & kewajiban, ketentuan pembayaran, *force majeure*, dan kolom tanda tangan kedua belah pihak.
- **Aksi Dokumen:** Pratinjau langsung di aplikasi (*Preview PDF*), Unduh (*Download*), Cetak (*Browser Print*), dan **Kirim via WhatsApp** dengan pesan sopan dan rapi yang otomatis terisi.
- **Integritas Snapshot:** Menyimpan *snapshot JSON* data permanen saat dokumen diterbitkan agar riwayat dokumen tidak berubah jika harga paket diperbarui di masa mendatang.

### 10. Laporan & Analitik (Menu 10)
- Grafik visual alokasi pengeluaran per kategori.
- Analisis margin laba bersih studio.
- Rasio piutang usaha berjalan terhadap realisasi kas masuk.

### 11. Pengaturan Studio (Menu 11)
- Konfigurasi profil studio: Nama studio, tagline, alamat, WhatsApp, email, dan logo resmi.
- Konfigurasi rekening bank pembayaran (BCA, Mandiri, dsb.).
- Penandatangan resmi studio (*Signer Name & Role*).
- Template syarat & ketentuan pembayaran (*Terms and Conditions*).

---

## 🚀 Panduan Menjalankan Aplikasi

### Opsi 1: Menjalankan Server Terintegrasi (Rekomendasi Cepat)

Aplikasi telah dikompilasi sehingga backend Go langsung menyajikan antarmuka web React pada satu port yang sama:

1. Masuk ke folder `backend`:
   ```powershell
   cd backend
   .\tumata-server.exe
   ```
2. Buka browser dan akses:
   ```
   http://localhost:8080
   ```

### Opsi 2: Mode Development (Hot-Reloading)

Jika ingin melakukan pengembangan antarmuka secara aktif:

1. **Jalankan Backend:**
   ```powershell
   cd backend
   go run ./cmd/server
   ```
   *(Backend berjalan di `http://localhost:8080`)*

2. **Jalankan Frontend (Terminal Baru):**
   ```powershell
   cd frontend
   pnpm dev
   ```
   *(Frontend Vite berjalan di `http://localhost:3000` dengan proxy otomatis ke backend)*

---

## 🔑 Akun Demo Default

Sistem telah di-*seed* dengan data awal dan pengguna berikut:

| Nama | Email | Kata Sandi | Peran |
| :--- | :--- | :--- | :--- |
| **Dimas Anggara** | `admin@tumata.com` | `admin123` | **Admin / Studio Director** |
| **Budi Santoso** | `budi@tumata.com` | `budi123` | **Fotografer** |
| **Reza Pratama** | `reza@tumata.com` | `reza123` | **Videografer** |
| **Siti Rahayu** | `siti@tumata.com` | `siti123` | **Editor Foto** |
| **Dani Firmansyah** | `dani@tumata.com` | `dani123` | **Editor Video** |
| **Maya Wulandari** | `maya@tumata.com` | `maya123` | **Koordinator Acara** |

---

## 🔐 Hak Akses Berdasarkan Peran

| Fitur | Admin / Pemilik | Staf (fotografer, videografer, editor, koordinator) |
| :--- | :---: | :---: |
| Dashboard | Semua data studio | Hanya data miliknya |
| Keuangan & Pembayaran | ✅ | ❌ (403) |
| Laporan & Analitik | ✅ | ❌ (403) |
| Pengaturan Studio | ✅ | ❌ (403) |
| Tambah Anggota Tim | ✅ | ❌ (403) |

- **Admin** dan **Pemilik** melihat seluruh proyek, jadwal, invoice, dan tugas studio.
- **Staf** hanya melihat proyek tempat ia menjadi PIC, anggota tim proyek, atau penerima tugas. Tugas yang tampil hanya tugas dengan `assignee_id` miliknya.
- Menu yang tidak diizinkan disembunyikan dari sidebar, dan rute langsung seperti `/finance`, `/reports`, `/settings` otomatis dialihkan ke dashboard. Backend tetap menolak permintaan API dengan `403 Forbidden`.
- Pembatasan ini juga diterapkan pada API, bukan hanya tampilan, sehingga tidak bisa dilewati lewat URL atau tool eksternal.

---

## ☁️ Deploy ke Hostless Cloud

Repo ini sudah menyertakan `Dockerfile` dan `hostless.yaml`. Docker hanya mengompilasi backend Go; frontend sudah dibangun ke `frontend/dist` dan ikut di-commit agar build Hostless cepat dan tidak kehabisan waktu.

1. Hubungkan repository GitHub `MangWifiId/Tumata_web` ke app Hostless.
2. Tambahkan environment variables di dashboard Hostless:
   - `DATABASE_URL` — connection string Neon/PostgreSQL (`sslmode=require`).
   - `JWT_SECRET` — string acak panjang.
3. Deploy. Hostless membangun image Docker, lalu menjalankan `start.sh` yang mengeksekusi binary `tumata-server`.

Setiap kali mengubah kode frontend, jalankan `cd frontend && pnpm build` lalu commit folder `frontend/dist` sebelum push/deploy.

Catatan penting:

- Jangan memakai `apt-get install golang` di `start.sh`. Runtime Hostless bersifat read-only dan tidak menyediakan Go; kompilasi harus dilakukan di tahap build Docker (sudah dikonfigurasi di `Dockerfile`).
- Folder `uploads` bersifat sementara pada platform container. Untuk produksi jangka panjang, simpan PDF di object storage atau volume persisten.
- Untuk build lokal: `docker build -t tumata .` lalu `docker run -p 8080:8080 --env-file backend/.env tumata`.
