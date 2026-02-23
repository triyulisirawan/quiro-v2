# Monopoli QUIRO

Aplikasi Quiz Randomization and Organizer untuk permainan Monopoli.

## Fitur
- Scan QR Code untuk mendapatkan soal.
- Timer otomatis 40 detik.
- Randomizer nomor soal otomatis setelah waktu habis.
- Integrasi dengan Google Sheets.

## Cara Install & Deploy

### 1. Backend (Google Apps Script)
1. Buka Google Spreadsheet Anda (ID: `1mi6KizJZDBLT0Tcjf_G-eARcnSJtqfAqwLcmxKAHah8`).
2. Pergi ke **Extensions** > **Apps Script**.
3. Copy isi file `APPS_SCRIPT_CODE.gs` yang ada di project ini.
4. Paste ke dalam editor Apps Script (timpa file `Code.gs` jika ada).
5. Klik **Deploy** > **New Deployment**.
6. Pilih type: **Web app**.
7. Isi Description (misal: "v1").
8. **Execute as**: "Me" (email anda).
9. **Who has access**: "Anyone" (Siapa saja). **PENTING**: Ini agar aplikasi bisa diakses tanpa login Google.
10. Klik **Deploy**.
11. Copy **Web App URL** yang muncul (akhiran `/exec`).

### 2. Frontend (Vercel)
1. Push kode ini ke GitHub repository Anda.
2. Buka dashboard Vercel (https://vercel.com).
3. Klik **Add New...** > **Project**.
4. Import repository GitHub tadi.
5. Di bagian **Environment Variables**, tambahkan:
   - Key: `VITE_GOOGLE_SCRIPT_URL`
   - Value: (Paste URL Web App dari langkah 1 tadi)
6. Klik **Deploy**.

### 3. Setup Spreadsheet
Pastikan sheet Anda memiliki struktur berikut:
- Sheet `randomizer`: Kolom A (ID), B (Nomor Soal), C (Pertanyaan), D (Media Drive), E (Media Lainnya).
- Sheet `max-min`: Kolom A (Nomor Max), B (Nomor Min), C (Materi). (Data diambil dari baris ke-2).

## Pengembangan Lokal
1. Copy `.env.example` menjadi `.env`.
2. Isi `VITE_GOOGLE_SCRIPT_URL` di `.env`.
3. Jalankan `npm install`.
4. Jalankan `npm run dev`.
