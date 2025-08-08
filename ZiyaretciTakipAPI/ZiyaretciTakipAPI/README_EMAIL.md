# E-posta Hizmeti Kurulumu

E-posta gönderimi için yeni MailKit kütüphanesini yüklemek gerekiyor. Aşağıdaki adımları izleyin:

1. NuGet paketlerini yükleyin:

```
dotnet add package MailKit
```

2. Alternatif olarak, Package Manager Console'da şunu çalıştırabilirsiniz:

```
Install-Package MailKit
```

3. Google hesabınızda "Uygulama Şifreleri" oluşturduğunuzdan emin olun:
   - Google Hesap ayarlarına gidin
   - Güvenlik sekmesine gidin
   - 2 Adımlı Doğrulamayı açın (bu gereklidir)
   - "Uygulama Şifreleri" bölümüne gidin
   - Yeni bir uygulama şifresi oluşturun ve bunu appsettings.json dosyasında kullanın

Bu işlemleri tamamladıktan sonra API'yi yeniden başlatın ve test endpointlerini deneyin:

- `http://localhost:5160/api/test/send-test-email` (System.Net.Mail)
- `http://localhost:5160/api/test/send-test-email-mailkit` (MailKit)

## Sorun Giderme

E-posta gönderimi hala çalışmıyorsa şunları kontrol edin:

1. Google hesap ayarlarınızı
2. Ağ güvenlik duvarı ayarlarınızı
3. API konsolunda gösterilen hata mesajlarını

Gmail dışında Outlook veya Yandex gibi alternatif e-posta sağlayıcıları da kullanabilirsiniz.
