# Ziyaretçi Takip Sistemi

Bu proje, Ziraat Bankası için geliştirilmiş kapsamlı bir ziyaretçi takip sistemidir. Sistem, modern web teknolojileri kullanılarak geliştirilmiş ve ziyaretçi giriş-çıkış işlemlerini dijital ortamda yönetmek için tasarlanmıştır.

## 🏗️ Proje Yapısı

```
ziyaretci-takip-2/
├── 📁 ziyaretci-takip/           # Frontend (React + TypeScript)
├── 📁 ZiyaretciTakipAPI/         # Backend (.NET 8.0 API)
├── 📁 src/styles/                # Ek stil dosyaları
├── 📄 Dockerfile                # Backend Docker konfigürasyonu
├── 📄 docker-compose.redis.yml  # Redis cache konfigürasyonu
├── 📄 insert_admin.sql          # Varsayılan admin kullanıcı script'i
└── 📄 ziyaretci-takip.sln       # Visual Studio solution dosyası
```

## 🚀 Teknoloji Stack'i

### Frontend
- **React 19.1.0** - Modern UI kütüphanesi
- **TypeScript** - Tip güvenliği ve geliştirici deneyimi
- **Ant Design 5.26.6** - Kapsamlı UI bileşen kütüphanesi
- **React Router DOM 7.7.0** - Client-side routing
- **Axios 1.10.0** - HTTP istemcisi
- **jsPDF & XLSX** - Dosya dışa aktarma

### Backend
- **.NET 8.0** - Modern web API framework'ü
- **ASP.NET Core** - Web API geliştirme
- **Entity Framework Core** - ORM (Object-Relational Mapping)
- **PostgreSQL** - Ana veritabanı
- **JWT Authentication** - Güvenli kimlik doğrulama
- **BCrypt.Net** - Şifre hashleme
- **MailKit** - E-posta gönderimi

### DevOps & Tools
- **Docker** - Container'laştırma
- **Redis** - Cache sistemi (opsiyonel)
- **Swagger/OpenAPI** - API dokümantasyonu

## 📋 Özellikler

### 🔐 Kimlik Doğrulama
- JWT tabanlı güvenli giriş sistemi
- Şifre hashleme (BCrypt)
- Otomatik token yenileme
- Rol tabanlı yetkilendirme

### 👥 Ziyaretçi Yönetimi
- Ziyaretçi kayıt işlemleri
- TC kimlik numarası validasyonu
- Giriş-çıkış takibi
- Aktif ziyaretçi listesi
- Geçmiş ziyaret kayıtları

### 📊 Raporlama
- Günlük/haftalık/aylık istatistikler
- PDF rapor oluşturma
- Excel dosyası dışa aktarma
- Gelişmiş filtreleme seçenekleri

### 🎨 Kullanıcı Deneyimi
- Responsive tasarım
- Karanlık/Aydınlık tema desteği
- Türkçe lokalizasyon
- Gerçek zamanlı güncellemeler

### 👨‍💼 Admin Paneli
- Kullanıcı profil yönetimi
- Şifre değiştirme
- Yeni admin ekleme
- Sistem ayarları

## 🛠️ Kurulum ve Çalıştırma

### Ön Gereksinimler
- Node.js (v18+)
- .NET 8.0 SDK
- PostgreSQL
- Redis (opsiyonel)

### Frontend Kurulumu
```bash
cd ziyaretci-takip
npm install
npm start
```

### Backend Kurulumu
```bash
cd ZiyaretciTakipAPI/ZiyaretciTakipAPI
dotnet restore
dotnet build
dotnet run
```

### Docker ile Çalıştırma
```bash
# Redis cache başlat (opsiyonel)
docker-compose -f docker-compose.redis.yml up -d

# Backend API'yi Docker ile çalıştır
docker build -t ziyaretci-api .
docker run -p 5160:80 ziyaretci-api
```

## 🌐 Erişim Adresleri

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5160
- **Swagger UI**: http://localhost:5160/swagger
- **Redis Commander**: http://localhost:8081 (Docker ile)

## 📝 Varsayılan Giriş Bilgileri

Sistem ilk kurulumunda `insert_admin.sql` script'i ile varsayılan admin kullanıcısı oluşturulur:

```
E-posta: admin@ziraatbank.com
Şifre: Admin123!
```

## 🔧 Geliştirme Notları

### Kod Yapısı
- **Frontend**: Component-based React yapısı
- **Backend**: Clean Architecture prensipleri
- **Database**: Code-First Entity Framework yaklaşımı
- **API**: RESTful servis tasarımı

### Güvenlik
- HTTPS zorlaması
- CORS yapılandırması
- SQL Injection koruması
- XSS koruması
- Rate limiting (gelecek sürümlerde)

### Performans
- Lazy loading
- Component memoization
- Database indexleme
- Redis cache (opsiyonel)
- Response compression

## 📞 Destek

Proje ile ilgili sorularınız için:
- GitHub Issues kullanabilirsiniz
- Teknik dokümantasyonu inceleyin
- API endpoint'leri için Swagger UI'yi kullanın

## 📄 Lisans

Bu proje, Ziraat Bankası için özel olarak geliştirilmiştir.

---

**Son Güncelleme**: Ağustos 2025  
**Geliştirici**: Ziyaretçi Takip Sistemi Ekibi
