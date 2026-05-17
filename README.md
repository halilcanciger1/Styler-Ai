# Styler Ai (formerly FASHNAI)

Styler Ai, kullanıcıların seçtikleri model ve kıyafet görsellerini kullanarak yapay zeka destekli moda görselleştirmeleri (Virtual Try-on) yapabildikleri mobil bir uygulamadır.

## 🚀 Proje Hakkında

Bu proje, daha önce Supabase altyapısıyla çalışan web sürümünden, tamamen özelleştirilmiş bir **Node.js/PostgreSQL** backend mimarisine ve **React Native (Expo)** mobil uygulamasına geçiş yapılarak baştan aşağı yeniden yapılandırılmıştır. Uygulama, görsel üretim işlemleri için **Fashn AI API**'sini kullanmaktadır.

## 💻 Teknoloji Yığını (Tech Stack)

### Mobil Uygulama (Frontend)
- **Framework:** React Native (Expo)
- **State Yönetimi:** Zustand (`authStore`, `generationStore`)
- **Tasarım:** NativeWind (TailwindCSS) & Lucide React Native ikonları
- **Yönlendirme (Navigation):** React Navigation (Bottom Tabs & Stack)
- **Medya Yükleme:** Expo Image Picker

### Sunucu (Backend)
- **Ortam:** Node.js & Express.js
- **Veritabanı:** PostgreSQL
- **ORM:** Prisma
- **Kimlik Doğrulama:** JWT (JSON Web Token)
- **Dosya Yükleme:** Multer (Local Storage)
- **Yapay Zeka Entegrasyonu:** Fashn AI API

## 🌟 Özellikler
- **Kullanıcı Kayıt & Giriş:** Güvenli JWT tabanlı kimlik doğrulama sistemi.
- **Stüdyo:** Model ve kıyafet (garment) görsellerini yükleyerek "Tops", "Bottoms" veya "Full-body" kategorilerinde AI üretimi başlatma.
- **Galeri:** Üretilen tüm görsellerin geçmişini görüntüleme ve tam ekran detaylı inceleme.
- **Dashboard:** Kullanıcı istatistikleri ve son başarılı üretimlerin vitrini.
- **Arka Plan İşlemleri (Polling):** Görsel üretim işlemi sunucuda asenkron çalışır ve mobil uygulama polling yöntemi ile sonuçları anlık olarak çeker.
- **Stripe Ödeme Entegrasyonu:** Kullanıcıların kredi satın alabilmesi ve premium üyeliklere geçiş yapabilmesi için güvenli Stripe ödeme altyapısı başarıyla entegre edilmiştir.

## 🛠 Kurulum ve Çalıştırma

Proje iki ana klasörden oluşmaktadır: `backend` ve `my-app` (Frontend). Her ikisini de ayrı ayrı çalıştırmanız gerekmektedir.

### 1. Backend Kurulumu
1. `backend` klasörüne gidin:
   ```bash
   cd backend
   ```
2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```
3. PostgreSQL veritabanınızı başlatın ve `.env` dosyanızı yapılandırın:
   ```env
   DATABASE_URL="postgresql://kullanici_adi:sifre@localhost:5432/Styler_ai?schema=public"
   JWT_SECRET="kendi-gizli-anahtariniz"
   PORT=3000
   FASHN_API_KEY="fashn-ai-api-anahtarınız"
   ```
4. Veritabanı tablolarını oluşturun:
   ```bash
   npx prisma db push
   ```
5. Sunucuyu başlatın:
   ```bash
   npx ts-node src/index.ts
   ```

### 2. Frontend (Mobil) Kurulumu
1. `my-app` klasörüne gidin:
   ```bash
   cd my-app
   ```
2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```
3. Expo sunucusunu başlatın:
   ```bash
   npx expo start -c
   ```
4. Terminalde çıkan QR kodu telefonunuzun kamerası (veya Expo Go uygulaması) ile okutun ya da Android Emülatör (`a` tuşu) üzerinde çalıştırın.

---
*Developed with ❤️ as a modern fashion-tech mobile application.*
