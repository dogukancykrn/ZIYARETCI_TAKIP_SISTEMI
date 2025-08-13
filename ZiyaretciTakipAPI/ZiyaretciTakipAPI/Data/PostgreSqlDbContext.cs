// Gerekli using direktifleri
using Microsoft.EntityFrameworkCore; // Entity Framework Core için
using ZiyaretciTakipAPI.Models;      // Model sınıfları için
using BCrypt.Net;                    // Şifre hashleme için

namespace ZiyaretciTakipAPI.Data
{
    /// <summary>
    /// PostgreSQL veritabanı bağlantısı ve model konfigürasyonunu yöneten DbContext sınıfı
    /// Entity Framework Core ORM kullanarak veritabanı işlemlerini yönetir
    /// </summary>
    public class PostgreSqlDbContext : DbContext
    {
        /// <summary>
        /// DbContext constructor - Dependency Injection ile DbContextOptions alır
        /// </summary>
        /// <param name="options">Veritabanı bağlantı konfigürasyonu</param>
        public PostgreSqlDbContext(DbContextOptions<PostgreSqlDbContext> options) : base(options)
        {
        }

        /// <summary>
        /// Admin kullanıcıları tablosu
        /// Sistem yöneticilerinin bilgilerini saklar
        /// </summary>
        public DbSet<Admin> Admins { get; set; }
        
        /// <summary>
        /// Ziyaretçiler tablosu
        /// Banka ziyaretçilerinin giriş-çıkış bilgilerini saklar
        /// </summary>
        public DbSet<Visitor> Visitors { get; set; }

        /// <summary>
        /// Model oluşturma sırasında çağrılan konfigürasyon metodu
        /// Tablo yapıları, ilişkiler ve kısıtlamaları tanımlar
        /// </summary>
        /// <param name="modelBuilder">Model konfigürasyon builder'ı</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Admin Entity Konfigürasyonu
            modelBuilder.Entity<Admin>(entity =>
            {
                // Tablo adını belirle (PostgreSQL snake_case konvansiyonu)
                entity.ToTable("admins");
                
                // Primary key tanımla
                entity.HasKey(e => e.Id);
                
                // ID kolonu konfigürasyonu - GUID otomatik oluşturma
                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();
                
                // Tam ad kolonu konfigürasyonu
                entity.Property(e => e.FullName)
                    .HasColumnName("full_name")    // PostgreSQL kolon adı
                    .HasMaxLength(100)             // Maksimum 100 karakter
                    .IsRequired();                 // NULL olamaz
                
                // Telefon numarası kolonu konfigürasyonu
                entity.Property(e => e.PhoneNumber)
                    .HasColumnName("phone_number") // PostgreSQL kolon adı
                    .HasMaxLength(20)              // Maksimum 20 karakter
                    .IsRequired();                 // NULL olamaz
                
                // E-posta kolonu konfigürasyonu
                entity.Property(e => e.Email)
                    .HasColumnName("email")        // PostgreSQL kolon adı
                    .HasMaxLength(100)             // Maksimum 100 karakter
                    .IsRequired();                 // NULL olamaz
                
                // Şifre hash kolonu konfigürasyonu
                entity.Property(e => e.PasswordHash)
                    .HasColumnName("password_hash") // PostgreSQL kolon adı
                    .HasMaxLength(255)              // BCrypt hash için yeterli uzunluk
                    .IsRequired();                  // NULL olamaz
                
                // Rol kolonu konfigürasyonu
                entity.Property(e => e.Role)
                    .HasColumnName("role")          // PostgreSQL kolon adı
                    .HasMaxLength(20)               // Maksimum 20 karakter
                    .IsRequired();                  // NULL olamaz

                // Yeni eklenen alanlar için konfigürasyon
                entity.Property(e => e.FirstName)
                    .HasColumnName("first_name")    // PostgreSQL snake_case kolon adı
                    .IsRequired();                  // NULL olamaz

                entity.Property(e => e.LastName)
                    .HasColumnName("last_name")     // PostgreSQL snake_case kolon adı
                    .IsRequired();                  // NULL olamaz

                entity.Property(e => e.TcNumber)
                    .HasColumnName("tc_number")     // PostgreSQL snake_case kolon adı
                    .HasMaxLength(11)               // TC kimlik no için 11 karakter
                    .IsRequired();                  // NULL olamaz

                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")    // PostgreSQL snake_case kolon adı
                    .IsRequired();                  // NULL olamaz

                entity.Property(e => e.UpdatedAt)
                    .HasColumnName("updated_at")    // PostgreSQL snake_case kolon adı
                    .IsRequired();                  // NULL olamaz

                // E-posta için benzersizlik kısıtlaması (unique constraint)
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Visitor Entity Konfigürasyonu
            modelBuilder.Entity<Visitor>(entity =>
            {
                // Tablo adını belirle (PostgreSQL snake_case konvansiyonu)
                entity.ToTable("visitors");
                
                // Primary key tanımla
                entity.HasKey(e => e.Id);
                
                // ID kolonu konfigürasyonu - GUID otomatik oluşturma
                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();
                
                // Ziyaretçi tam adı kolonu konfigürasyonu
                entity.Property(e => e.FullName)
                    .HasColumnName("full_name")     // PostgreSQL kolon adı
                    .HasMaxLength(100)              // Maksimum 100 karakter
                    .IsRequired();                  // NULL olamaz
                
                // TC kimlik numarası kolonu konfigürasyonu
                entity.Property(e => e.TcNumber)
                    .HasColumnName("tc_number")     // PostgreSQL kolon adı
                    .HasMaxLength(11)               // 11 haneli TC kimlik no
                    .IsRequired();                  // NULL olamaz
                
                // Ziyaret nedeni kolonu konfigürasyonu
                entity.Property(e => e.VisitReason)
                    .HasColumnName("visit_reason")  // PostgreSQL kolon adı
                    .HasMaxLength(500)              // Maksimum 500 karakter (uzun açıklamalar için)
                    .IsRequired();                  // NULL olamaz
                
                // Giriş zamanı kolonu konfigürasyonu
                entity.Property(e => e.EnteredAt)
                    .HasColumnName("entered_at")    // PostgreSQL kolon adı
                    .IsRequired();                  // NULL olamaz (her ziyaretçinin giriş zamanı olmalı)
                
                // Çıkış zamanı kolonu konfigürasyonu
                entity.Property(e => e.ExitedAt)
                    .HasColumnName("exited_at");    // PostgreSQL kolon adı
                                                   // Nullable - henüz çıkış yapmamış ziyaretçiler için

                // TC numarası için indeks (hızlı arama için)
                entity.HasIndex(e => e.TcNumber);
                
                // Giriş zamanı için indeks (tarih bazlı sorgular için)
                entity.HasIndex(e => e.EnteredAt);
            });

            // Seed Data artık kaldırıldı - mevcut veriler korunacak
            // Başlangıç verileri migration sırasında eklenmişti ancak
            // production ortamında mevcut verilerin korunması için seed data kaldırıldı
            // SeedData(modelBuilder);
        }

        // Seed data metodu - artık kullanılmıyor
        // Başlangıç verileri manuel olarak veya migration aracılığıyla ekleniyor
        // Bu sayede production ortamında veri kaybı önleniyor
    }
}
