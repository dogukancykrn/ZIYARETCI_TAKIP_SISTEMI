// Gerekli using direktifleri - Entity Framework ve kimlik doğrulama için
using Microsoft.EntityFrameworkCore;                    // Entity Framework Core için
using Microsoft.AspNetCore.Authentication.JwtBearer;   // JWT Bearer kimlik doğrulama için
using Microsoft.IdentityModel.Tokens;                  // Token doğrulama için
using System.Text;                                     // String encoding için
using ZiyaretciTakipAPI.Data;                          // Veritabanı context'i için
using ZiyaretciTakipAPI.Services;                      // Servis sınıfları için
using Microsoft.AspNetCore.Builder;                   // Web application builder için

// Web application builder'ı oluştur
var builder = WebApplication.CreateBuilder(args);

// CORS (Cross-Origin Resource Sharing) AYARLARI
// Frontend ve backend farklı port'larda çalıştığı için CORS gerekli
builder.Services.AddCors(options =>
{
    // "AllowAll" adında bir CORS policy tanımla
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .SetIsOriginAllowed(origin => true) // Tüm originlere (kaynaklara) izin ver
            .AllowAnyHeader()                   // Tüm HTTP header'larına izin ver
            .AllowAnyMethod()                   // Tüm HTTP metodlarına (GET, POST, PUT, DELETE) izin ver
            .AllowCredentials();                // Kimlik bilgilerinin gönderilmesine izin ver
    });
});

// SERVİS KAYITLARI
builder.Services.AddControllers();          // MVC Controller'ları ekle
builder.Services.AddEndpointsApiExplorer(); // API endpoint keşfi için
builder.Services.AddSwaggerGen();           // Swagger/OpenAPI dokümantasyonu için

// POSTGRESQL VERİTABANI KONFIGÜRASYONU
builder.Services.AddDbContext<PostgreSqlDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")) // PostgreSQL bağlantı string'i
           .ConfigureWarnings(warnings =>
               warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning))); // Migration uyarılarını ignore et

// E-POSTA SERVİSLERİ
builder.Services.AddScoped<EmailService>();        // Varsayılan email servisi
builder.Services.AddScoped<MailKitEmailService>(); // MailKit email servisi

// JWT (JSON Web Token) KİMLİK DOĞRULAMA KONFIGÜRASYONU
var jwtSettings = builder.Configuration.GetSection("JwtSettings"); // JWT ayarlarını al
var secretKey = jwtSettings["SecretKey"] ?? "DefaultSecretKeyForDevelopment123456789"; // Secret key
var key = Encoding.ASCII.GetBytes(secretKey); // Secret key'i byte array'e çevir
builder.Services.AddScoped<IJwtService, JwtService>(); // JWT servisi kaydet

// JWT Bearer authentication'ı yapılandır
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Token doğrulama parametrelerini ayarla
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,                    // Signing key'i doğrula
            IssuerSigningKey = new SymmetricSecurityKey(key),   // Symmetric key kullan
            ValidateIssuer = true,                              // Token yayıncısını doğrula
            ValidIssuer = jwtSettings["Issuer"],                // Geçerli token yayıncısı
            ValidateAudience = true,                            // Token hedef kitlesini doğrula
            ValidAudience = jwtSettings["Audience"],            // Geçerli hedef kitle
            ValidateLifetime = true,                            // Token yaşam süresini doğrula
            ClockSkew = TimeSpan.Zero                           // Saat farkı toleransı (0 = kesin zaman)
        };

        // JWT authentication olayları
        options.Events = new JwtBearerEvents
        {
            // Yetkisiz erişim durumunda çalışan olay
            OnChallenge = async context =>
            {
                context.HandleResponse();                       // Varsayılan yanıtı durdur
                context.Response.StatusCode = 401;              // 401 Unauthorized status code
                await context.Response.WriteAsJsonAsync(new { message = "Unauthorized" }); // JSON yanıt döndür
            }
        };
    });

// Web application'ı build et
var app = builder.Build();

// MİDDLEWARE PİPELİNE KONFIGÜRASYONU
// Development ortamında Swagger'ı etkinleştir
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();    // Swagger JSON endpoint'ini ekle
    app.UseSwaggerUI();  // Swagger UI'yi ekle
}

app.UseHttpsRedirection(); // HTTP'yi HTTPS'ye yönlendir
app.UseCors("AllowAll");   // CORS policy'yi uygula
app.UseAuthentication();   // Authentication middleware'i ekle
app.UseAuthorization();    // Authorization middleware'i ekle
app.MapControllers();      // Controller route'larını map'le

// Uygulamayı çalıştır
app.Run();