# TUMATA — Wedding Studio Management System

Dokumen ini merangkum rancangan aplikasi **TUMATA**, sistem manajemen usaha fotografi
dan videografi pernikahan. Sistem dirancang untuk membantu pengelolaan
calon klien, booking, jadwal acara, progres produksi, pembayaran,
notulensi, tim, serta dokumen PDF.

> **Status:** Dokumen rancangan awal / brainstorming. Detail
> operasional, paket harga, dan kebijakan bisnis masih perlu
> dikonfirmasi sebelum implementasi.

------------------------------------------------------------------------

## Identitas dan Branding TUMATA

**Nama aplikasi:** TUMATA  
**Kategori:** Wedding Studio Management System  
**Logo resmi:** `assets/tumata-logo.png`

Logo TUMATA menggunakan simbol dan tipografi berwarna hijau. File logo asli
yang diberikan telah disertakan pada folder `assets/`. Gunakan file ini
sebagai aset identitas pada halaman login, sidebar/dashboard, halaman
pengaturan studio, serta dokumen PDF (penawaran, invoice, kwitansi, dan
kontrak). Jangan mengubah proporsi logo; gunakan versi transparan PNG dan
jaga ruang kosong di sekelilingnya.

Warna hijau pada logo menjadi acuan warna identitas visual. Nilai warna
brand final (HEX), variasi logo terang/gelap, dan aturan penggunaan logo
masih dapat ditetapkan pada tahap desain UI.

![Logo TUMATA](assets/tumata-logo.png)

## 1. Tujuan Aplikasi

Membangun satu sistem terpusat untuk mengelola seluruh proses layanan
wedding photography dan videography, mulai dari calon klien menghubungi
studio hingga hasil dokumentasi diserahkan dan transaksi diselesaikan.

Tujuan utama:

-   Menghindari jadwal acara atau penugasan tim yang bertabrakan.
-   Memantau progres setiap proyek.
-   Menyimpan komunikasi, notulensi, dan permintaan khusus klien.
-   Mencatat invoice, pembayaran, pengeluaran, dan keuntungan.
-   Membuat dokumen profesional yang dapat diunduh, dicetak, dan dikirim
    kepada klien.
-   Menyimpan arsip proyek dan dokumen secara terstruktur.

## 2. Teknologi yang Direncanakan

  -----------------------------------------------------------------------
  Bagian                              Teknologi / Pendekatan
  ----------------------------------- -----------------------------------
  Backend                             Go (Golang) + Gin

  Database                            PostgreSQL

  Frontend                            React + TypeScript

  Dokumen                             PDF yang dibuat dari backend

  Cetak                               Browser Print

  Penyimpanan berkas                  Private file storage

  Pengiriman awal                     Unduh PDF lalu kirim manual melalui
                                      WhatsApp

  Integrasi lanjutan                  WhatsApp Business API dan Google
                                      Calendar, jika dibutuhkan
  -----------------------------------------------------------------------

Backend TUMATA akan dikembangkan menggunakan **Go (Golang) dengan Gin**.
Struktur backend disarankan modular (handler, service, repository, model,
dan DTO) agar logika bisnis, HTTP, serta akses database terpisah.

Teknologi lain di atas merupakan rancangan awal dan dapat disesuaikan ketika
implementasi dimulai.

## 3. Alur Bisnis Utama

1.  **Lead / calon klien** --- mencatat identitas, kontak, sumber
    pelanggan, dan kebutuhan dokumentasi.
2.  **Penawaran** --- memilih paket dan layanan tambahan, lalu mengirim
    penawaran harga.
3.  **Booking dan kontrak** --- menyimpan tanggal acara, lokasi,
    kesepakatan, serta pembayaran awal.
4.  **Penjadwalan** --- mengatur akad, resepsi, prewedding, meeting,
    technical meeting, dan deadline.
5.  **Persiapan proyek** --- membuat rundown, checklist, dan pembagian
    tugas tim.
6.  **Pelaksanaan acara** --- mencatat kegiatan dokumentasi dan
    kebutuhan lapangan.
7.  **Produksi** --- backup, seleksi, editing foto, editing video,
    review, dan revisi.
8.  **Pembayaran** --- mencatat DP, cicilan, pelunasan, serta
    pengeluaran proyek.
9.  **Penyerahan hasil** --- mengirim galeri foto/video dan menyimpan
    bukti penyerahan.
10. **Arsip** --- menyimpan seluruh data proyek, dokumen, dan riwayat
    komunikasi.

## 4. Modul Aplikasi

### 4.1 Dashboard

Informasi yang ditampilkan:

-   Jumlah proyek bulan ini.
-   Jadwal acara terdekat.
-   Klien yang belum melunasi pembayaran.
-   Proyek yang sedang dikerjakan.
-   Proyek yang melewati deadline.
-   Pendapatan, pembayaran diterima, dan pengeluaran.
-   Tugas tim yang belum selesai.

### 4.2 Manajemen Klien

Data klien yang disimpan:

-   Nama klien / pasangan pengantin.
-   Nomor WhatsApp dan email.
-   Alamat atau informasi kontak lain bila diperlukan.
-   Sumber calon pelanggan.
-   Catatan kebutuhan dan permintaan khusus.
-   Riwayat proyek dan dokumen.

Satu klien dapat memiliki beberapa proyek atau kegiatan, misalnya
prewedding, akad, resepsi, dan acara tambahan.

### 4.3 Booking dan Proyek

Data proyek:

-   Nomor proyek.
-   Klien.
-   Paket dan layanan tambahan.
-   Nilai kontrak.
-   Tanggal dan lokasi acara.
-   Jam mulai dan selesai.
-   Status booking.
-   Penanggung jawab.
-   Catatan dan syarat khusus.

Status proyek yang disarankan:

`Lead` → `Penawaran` → `Menunggu DP` → `Booked` → `Persiapan` →
`Berlangsung` → `Editing` → `Review/Revisi` → `Selesai` → `Diarsipkan`.

Status dapat disesuaikan dengan proses bisnis studio.

### 4.4 Kalender dan Penjadwalan

Jenis jadwal:

-   Akad nikah.
-   Resepsi.
-   Prewedding.
-   Meeting klien.
-   Technical meeting.
-   Pengambilan foto/video.
-   Deadline editing.
-   Deadline penyerahan hasil.

Fitur penting:

-   Tampilan kalender bulanan, mingguan, dan harian.
-   Peringatan jadwal yang berdekatan.
-   Deteksi bentrok acara.
-   Deteksi bentrok jadwal anggota tim.
-   Pengingat deadline dan pembayaran.

Pemeriksaan bentrok sebaiknya mempertimbangkan rentang waktu acara,
lokasi, serta anggota tim yang ditugaskan, bukan hanya tanggal.

### 4.5 Progres Produksi

Tahapan pekerjaan yang disarankan:

1.  Pengambilan foto/video.
2.  Backup file.
3.  Seleksi foto.
4.  Editing foto.
5.  Editing video.
6.  Review internal.
7.  Revisi klien.
8.  Finalisasi.
9.  Pengiriman hasil.
10. Konfirmasi penyerahan.

Setiap tahapan memiliki status, penanggung jawab, deadline, catatan, dan
waktu pembaruan. Persentase progres dapat dihitung dari tahapan yang
selesai.

### 4.6 Notulensi dan Catatan Klien

Setiap proyek memiliki catatan meeting dan komunikasi:

-   Tanggal dan waktu.
-   Peserta meeting.
-   Topik pembahasan.
-   Permintaan khusus klien.
-   Keputusan yang disepakati.
-   Tugas tindak lanjut.
-   Penanggung jawab.
-   Deadline tindak lanjut.

Notulensi harus tersimpan di riwayat proyek agar dapat dibaca oleh admin
atau anggota tim yang berwenang.

### 4.7 Manajemen Tim

Data anggota dan penugasan:

-   Nama anggota.
-   Peran: admin, fotografer, videografer, editor, koordinator, atau
    pemilik.
-   Jadwal ketersediaan.
-   Tugas dalam proyek.
-   Deadline dan status tugas.

Contoh pembagian pekerjaan:

  Peran          Tanggung jawab
  -------------- -----------------------------------
  Fotografer     Dokumentasi foto
  Videografer    Dokumentasi video
  Editor foto    Seleksi dan editing foto
  Editor video   Editing video
  Admin          Komunikasi klien dan administrasi
  Koordinator    Rundown dan koordinasi tim

Daftar peran ini adalah contoh, bukan asumsi jumlah atau susunan tim
yang sudah ditetapkan.

### 4.8 Keuangan

Catat seluruh transaksi secara terpisah:

-   Nilai kontrak.
-   DP.
-   Cicilan.
-   Pelunasan.
-   Metode pembayaran.
-   Tanggal transaksi.
-   Bukti pembayaran.
-   Pengeluaran proyek.
-   Honor tim.
-   Transportasi, konsumsi, sewa alat, cetak album, dan biaya lainnya.

Rumus dasar:

`Sisa tagihan = Total kontrak - Total pembayaran terverifikasi`

`Keuntungan proyek = Total pendapatan - Total pengeluaran`

Laporan harus membedakan nilai kontrak, uang yang benar-benar diterima,
piutang, dan pengeluaran.

------------------------------------------------------------------------

## 5. Modul Dokumen PDF

Fitur dokumen merupakan bagian penting dari sistem. Admin dapat membuat
dokumen dari data klien, proyek, paket, dan transaksi yang sudah
tersimpan.

### 5.1 Jenis Dokumen

  Dokumen           Kegunaan
  ----------------- -------------------------------------------------------
  Penawaran harga   Dikirim kepada calon klien sebelum booking
  Invoice           Tagihan booking, cicilan, atau pelunasan
  Kwitansi          Bukti pembayaran yang sudah diterima dan diverifikasi
  Kontrak kerja     Kesepakatan layanan antara studio dan klien

### 5.2 Identitas dan Desain Dokumen

Identitas studio dapat diatur melalui halaman pengaturan:

-   Logo studio.
-   Nama studio.
-   Deskripsi layanan.
-   Alamat.
-   Nomor WhatsApp.
-   Email.
-   Informasi rekening pembayaran.
-   Nama dan tanda tangan pihak studio.
-   Catatan serta syarat pembayaran.

Desain dokumen harus profesional, mudah dibaca, dan mendukung ukuran A4.
Format kwitansi kecil dapat dipertimbangkan sebagai opsi tambahan.

### 5.3 Isi Invoice

-   Nomor invoice otomatis dan unik.
-   Tanggal penerbitan dan jatuh tempo.
-   Identitas klien.
-   Identitas proyek dan tanggal acara.
-   Rincian paket dan layanan tambahan.
-   Total tagihan.
-   Pembayaran yang sudah diterima.
-   Sisa tagihan.
-   Metode dan instruksi pembayaran.
-   Syarat pembayaran.

### 5.4 Isi Kwitansi

-   Nomor kwitansi otomatis dan unik.
-   Tanggal pembayaran.
-   Nama pembayar.
-   Nominal yang diterima.
-   Keperluan pembayaran.
-   Metode pembayaran.
-   Referensi transaksi.
-   Sisa tagihan setelah pembayaran.
-   Identitas dan tanda tangan pihak penerima.

**Aturan:** kwitansi hanya dapat diterbitkan dari pembayaran yang telah
diverifikasi. Invoice adalah permintaan pembayaran, sedangkan kwitansi
adalah bukti uang telah diterima.

### 5.5 Aksi Dokumen

Pada halaman dokumen tersedia:

1.  Preview PDF.
2.  Download PDF.
3.  Print.
4.  Buka WhatsApp dengan nomor klien dan pesan yang sudah disiapkan.
5.  Arsipkan dokumen pada profil klien/proyek.

**Alur WhatsApp tahap awal:** sistem membuat PDF, admin mengunduhnya,
lalu aplikasi membuka WhatsApp dengan pesan siap kirim. Admin
melampirkan PDF secara manual. Tombol membuka WhatsApp tidak boleh
dianggap sebagai bukti pesan sudah terkirim atau dibaca.

Pengiriman lampiran secara otomatis memerlukan integrasi WhatsApp
Business API dan konfigurasi tambahan.

### 5.6 Riwayat dan Keamanan Dokumen

-   Simpan nomor, jenis, tanggal, status, dan lokasi berkas dokumen.
-   Simpan versi atau snapshot data yang digunakan saat dokumen
    diterbitkan.
-   Dokumen lama tidak berubah diam-diam ketika harga atau data proyek
    diperbarui.
-   Perubahan atau penerbitan ulang harus memiliki riwayat.
-   Batasi akses dokumen sesuai hak pengguna.
-   Simpan PDF di private storage dan gunakan akses terkontrol.
-   Hindari menaruh data sensitif klien pada tautan publik.

------------------------------------------------------------------------

## 6. Struktur Menu Aplikasi

Rancangan navigasi utama:

1.  Dashboard
2.  Data Klien
3.  Kalender & Jadwal
4.  Proyek & Booking
5.  Progres Pekerjaan
6.  Notulensi & Catatan
7.  Keuangan & Pembayaran
8.  Manajemen Tim
9.  Dokumen & Hasil
10. Laporan & Analitik
11. Pengaturan

## 7. Rancangan Database Awal

Tabel utama yang direncanakan:

  Tabel                Fungsi
  -------------------- --------------------------------------------
  `users`              Akun pengguna dan hak akses
  `studio_settings`    Identitas studio
  `clients`            Data klien
  `packages`           Paket layanan
  `package_items`      Rincian layanan dalam paket
  `projects`           Proyek dan booking
  `project_services`   Paket/layanan yang dipilih proyek
  `events`             Akad, resepsi, prewedding, dan jadwal lain
  `tasks`              Tugas dan progres produksi
  `project_members`    Penugasan anggota tim
  `meeting_notes`      Notulensi
  `note_actions`       Tindak lanjut notulensi
  `invoices`           Tagihan
  `invoice_items`      Rincian tagihan
  `payments`           Riwayat pembayaran
  `receipts`           Bukti pembayaran
  `expenses`           Pengeluaran proyek
  `documents`          Metadata dan lokasi PDF
  `document_logs`      Riwayat penerbitan dan pengiriman
  `deliveries`         Penyerahan hasil foto/video

Struktur ini masih berupa rancangan. Relasi, kolom, indeks, constraint,
dan kebutuhan migrasi akan ditentukan pada tahap ERD.

## 8. Aturan Bisnis Penting

1.  Setiap proyek memiliki klien dan nomor proyek.
2.  Satu klien dapat memiliki beberapa proyek.
3.  Satu proyek dapat memiliki beberapa acara dan anggota tim.
4.  Jadwal harus diperiksa terhadap bentrok waktu dan penugasan.
5.  Pembayaran dicatat sebagai transaksi tersendiri, bukan sekadar
    mengubah angka total pada proyek.
6.  Total pembayaran hanya menghitung transaksi yang terverifikasi.
7.  Kwitansi dibuat berdasarkan transaksi pembayaran terverifikasi.
8.  Invoice dan kwitansi memiliki nomor unik.
9.  Dokumen yang sudah diterbitkan harus mempertahankan snapshot data
    saat penerbitan.
10. Perubahan transaksi dan dokumen harus tercatat.
11. Akses fitur keuangan dan pengaturan studio dibatasi berdasarkan
    peran.
12. Progres proyek harus memiliki penanggung jawab dan riwayat
    perubahan.

## 9. Tahapan Pengembangan

  Tahap   Fokus                           Hasil
  ------- ------------------------------- ---------------------------------------
  1       Analisis kebutuhan dan ERD      Struktur data dan aturan bisnis
  2       Backend dasar dan autentikasi   API dan hak akses
  3       Klien, paket, proyek, booking   Pengelolaan pelanggan
  4       Kalender dan penugasan          Penjadwalan
  5       Progres dan notulensi           Pengelolaan produksi
  6       Keuangan                        Invoice, pembayaran, pengeluaran
  7       PDF generator                   Penawaran, invoice, kwitansi, kontrak
  8       Dokumen dan penyerahan hasil    Arsip proyek
  9       Dashboard dan laporan           Analitik usaha
  10      Pengujian dan deployment        Sistem siap digunakan

## 10. Fitur Lanjutan

Fitur yang dapat dikembangkan setelah MVP:

-   Sinkronisasi Google Calendar.
-   WhatsApp Business API untuk pengiriman otomatis.
-   Pengingat pembayaran dan deadline.
-   Tanda tangan elektronik.
-   Portal klien untuk melihat progres dan mengunduh hasil.
-   Galeri foto/video dengan akses terbatas.
-   Riwayat revisi klien.
-   Laporan laba per proyek dan per bulan.
-   Backup database dan berkas otomatis.

## 11. Hal yang Masih Perlu Diputuskan

Hal-hal berikut belum ditetapkan dan tidak boleh diasumsikan saat
implementasi:

-   Nama resmi studio, logo, alamat, dan kontak.
-   Paket harga: paket tetap, custom, atau kombinasi keduanya.
-   Apakah layanan tambahan dapat dipilih secara terpisah.
-   Daftar paket dan rincian layanan.
-   Struktur tim dan hak akses setiap peran.
-   Kebijakan DP, cicilan, pelunasan, pembatalan, dan revisi.
-   Rekening pembayaran dan metode pembayaran yang diterima.
-   Masa penyimpanan file foto/video dan kebijakan akses klien.
-   Apakah kontrak menggunakan tanda tangan manual atau elektronik.

## 12. Prioritas MVP

Prioritas versi pertama:

-   [ ] Login dan manajemen pengguna.
-   [ ] Data klien.
-   [ ] Paket dan layanan.
-   [ ] Booking dan proyek.
-   [ ] Kalender dan deteksi jadwal bentrok.
-   [ ] Pembayaran dan pengeluaran.
-   [ ] Progres pekerjaan.
-   [ ] Notulensi dan tindak lanjut.
-   [ ] Invoice PDF.
-   [ ] Kwitansi PDF.
-   [ ] Download dan print PDF.
-   [ ] Tombol WhatsApp dengan pesan siap kirim.
-   [ ] Riwayat dokumen per klien.
-   [ ] Dashboard dasar.

------------------------------------------------------------------------

## Ringkasan Keputusan

-   Produk: sistem manajemen usaha wedding photography dan videography.
-   Backend yang direncanakan: Go + Gin.
-   Database: PostgreSQL.
-   Frontend: React + TypeScript.
-   Dokumen: PDF yang dapat diunduh dan dicetak.
-   Pengiriman: download PDF dan buka WhatsApp untuk pengiriman manual.
-   Branding dokumen: custom, dengan logo, identitas studio, kontak,
    rekening, dan tanda tangan.
-   Dokumen utama: penawaran, invoice, kwitansi, dan kontrak.
-   Status proyek: rancangan awal; detail paket, harga, dan operasional
    masih perlu dikonfirmasi.

**Langkah pengembangan berikutnya:** konfirmasi keputusan bisnis yang
masih terbuka, buat ERD PostgreSQL, kemudian susun struktur backend API
dan wireframe frontend.
