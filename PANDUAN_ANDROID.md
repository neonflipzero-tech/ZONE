# Panduan Build Android (Capacitor) - Zone Elite

Ikuti langkah-langkah ini di komputer kamu setelah mendownload kodingan ini:

## 1. Persiapan Awal
Buka folder project di terminal (CMD/PowerShell/VS Code Terminal), lalu jalankan:
```bash
npm install
```

## 2. Build Project Web
Kita harus mengubah kode React menjadi file statis terlebih dahulu:
```bash
npm run build
```

## 3. Inisialisasi Android
Jalankan perintah ini untuk membuat folder Android native:
```bash
npx cap add android
```

## 4. Sinkronisasi Kode
Setiap kali kamu mengubah kode di Gemini Studio dan mendownloadnya lagi, jalankan ini:
```bash
npx cap sync
```

## 5. Buka di Android Studio
Jalankan perintah ini untuk membuka project Android kamu secara otomatis:
```bash
npx cap open android
```

## 6. Build APK/AAB di Android Studio
1. Tunggu Android Studio selesai melakukan "Gradle Sync".
2. Di menu atas, pilih **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)** atau **Build Bundle(s)** (untuk Play Store).
3. File kamu akan muncul di folder `android/app/build/outputs/`.

---
**Catatan Penting:**
Dengan cara ini, notifikasi kamu akan menggunakan sistem native Android, bukan lagi WebView browser, sehingga akan jauh lebih stabil dan profesional!
