# Arsip PKL Zaki Ansyari

Website arsip PKL bergaya premium gelap-hitam dan emas, dengan halaman Home, Laporan PKL, Galeri, Catatan & Observasi, enam kartu PPT, serta dashboard admin. Frontend statis dapat di-deploy ke Vercel; Google Sheets menjadi database melalui Google Apps Script Web App.

## Struktur
- `index.html` — halaman website
- `public/style.css` — tampilan responsif
- `public/main.js` — render konten, navigasi, login, dan dashboard
- `apps-script/Code.gs` — backend Google Apps Script
- `vercel.json` — konfigurasi routing Vercel

## 1. Siapkan Google Sheets
1. Buat Google Sheet baru, misalnya **Database Arsip PKL Zaki**.
2. Salin ID spreadsheet dari URL: `https://docs.google.com/spreadsheets/d/ID_SPREADSHEET/edit`.
3. Buka **Extensions → Apps Script**.
4. Salin isi `apps-script/Code.gs` ke editor Apps Script.
5. Ganti `GANTI_DENGAN_ID_GOOGLE_SHEET` pada `SPREADSHEET_ID` dengan ID spreadsheet Anda.
6. Simpan, pilih fungsi `setupSheets`, lalu tekan **Run** dan berikan izin.
7. Pada sheet `Admins`, baris pertama adalah header. Isi baris kedua:
   - kolom A: username admin
   - kolom B: hash SHA-256 password (bukan password asli)
   - kolom C: `TRUE`
8. Untuk membuat hash password: pada `Code.gs`, ganti nilai di `hashPassword()` menjadi password yang Anda inginkan. Pilih fungsi `hashPassword` lalu **Run**. Buka **Execution log** dan salin hash ke `Admins!B2`. Setelah itu, jangan lupa ganti lagi string contoh di kode menjadi teks placeholder, atau hapus fungsi `hashPassword()` setelah selesai.
9. Pada sheet `Content`, data konten akan dibuat otomatis saat Anda menyimpan dari dashboard.

**Jika username/password Anda sudah ada di Excel:** jangan mengunggah atau menaruh password asli di kode frontend. Pindahkan username ke `Admins!A2`, buat hash password menggunakan langkah 8, simpan hash di `Admins!B2`, lalu aktifkan akun dengan `TRUE` di `Admins!C2`.

## 2. Deploy Google Apps Script
1. Di editor Apps Script, pilih **Deploy → New deployment**.
2. Pilih jenis **Web app**.
3. **Execute as:** Me.
4. **Who has access:** Anyone (endpoint publik hanya mengizinkan baca konten; menyimpan memerlukan sesi admin).
5. Tekan **Deploy**, izinkan akses, lalu salin URL Web App yang berakhir dengan `/exec`.

## 3. Hubungkan website ke backend
Buka `public/main.js` dan ubah baris awal:

```js
const API_URL = "";
```

menjadi:

```js
const API_URL = "https://script.google.com/macros/s/ID_DEPLOYMENT_ANDA/exec";
```

Gunakan URL Web App `/exec`, bukan URL editor `/dev`. Simpan file.

## 4. Deploy ke Vercel
Cara paling mudah:
1. Unggah folder proyek ini ke repository GitHub.
2. Di Vercel, pilih **Add New → Project**, lalu impor repository.
3. Framework preset: **Vite** (atau Other).
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Tekan **Deploy**.

Alternatif lokal: jalankan `npm install`, `npm run dev` untuk pengembangan atau `npm run build` untuk build produksi.

## 5. Mengisi file, gambar, dan PPT
- Buka Google Drive dan unggah file laporan, catatan observasi, serta enam file PPT Anda.
- Untuk file, pilih **Share → General access → Anyone with the link → Viewer**, jika memang boleh diakses publik.
- Salin URL berbagi ke kolom **URL file / tautan tujuan** pada dashboard Admin.
- Untuk gambar, gunakan URL gambar publik yang bisa diakses browser. URL gambar Google Drive tidak selalu dapat ditampilkan langsung; paling stabil gunakan URL gambar langsung dari hosting gambar publik atau gunakan URL thumbnail Drive yang benar. Jangan mengatur file pribadi menjadi publik jika berisi data sensitif.
- Login ke website lewat **Admin**. Pilih tab Laporan, Galeri, Catatan, atau PPT; isi judul, deskripsi, URL file dan URL gambar; tekan **Simpan perubahan**.
- Kartu Galeri akan membuka lightbox bila URL gambar diisi. Jika URL tujuan juga diisi, klik foto tanpa gambar akan membuka tujuan.

## 6. Catatan keamanan penting
- Jangan menyimpan password dalam file HTML/JavaScript atau sheet publik.
- Sheet Google harus tetap privat; hanya backend Apps Script yang mengaksesnya.
- Website ini menggunakan hash password dan token sesi dengan masa berlaku enam jam. Untuk penggunaan lebih sensitif, tambahkan pembatasan akses, rate limiting, dan mekanisme sesi yang lebih kuat.
- Konten yang dimasukkan ke Google Sheets akan ditampilkan untuk publik. Jangan memasukkan NIK, alamat pribadi, atau data peserta PKL lain.
- Jika login atau penyimpanan gagal setelah deployment, periksa URL `/exec`, izin deployment Apps Script, ID Spreadsheet, dan Execution log Apps Script.

## 7. Konten awal
Website sudah berisi placeholder untuk dua dokumen laporan, lima slot foto galeri, tiga kartu catatan/observasi, dan enam kartu presentasi. Ubah semua placeholder melalui Admin sesuai file asli Anda. Enam judul PPT awal dapat disesuaikan; pastikan judul dan tautan sesuai presentasi final yang Anda miliki.
