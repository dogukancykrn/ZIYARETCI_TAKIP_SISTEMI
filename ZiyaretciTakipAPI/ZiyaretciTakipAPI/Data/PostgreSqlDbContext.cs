using Microsoft.EntityFrameworkCore;
using ZiyaretciTakipAPI.Models;
using BCrypt.Net;

namespace ZiyaretciTakipAPI.Data
{
    public class PostgreSqlDbContext : DbContext
    {
        public PostgreSqlDbContext(DbContextOptions<PostgreSqlDbContext> options) : base(options)
        {
        }

        public DbSet<Admin> Admins { get; set; }
        public DbSet<Visitor> Visitors { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Admin Entity Configuration
            modelBuilder.Entity<Admin>(entity =>
            {
                entity.ToTable("admins");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();
                
                entity.Property(e => e.FullName)
                    .HasColumnName("full_name")
                    .HasMaxLength(100)
                    .IsRequired();
                
                entity.Property(e => e.PhoneNumber)
                    .HasColumnName("phone_number")
                    .HasMaxLength(20)
                    .IsRequired();
                
                entity.Property(e => e.Email)
                    .HasColumnName("email")
                    .HasMaxLength(100)
                    .IsRequired();
                
                entity.Property(e => e.PasswordHash)
                    .HasColumnName("password_hash")
                    .HasMaxLength(255)
                    .IsRequired();
                
                entity.Property(e => e.Role)
                    .HasColumnName("role")
                    .HasMaxLength(20)
                    .IsRequired();

                // Unique constraint for email
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Visitor Entity Configuration
            modelBuilder.Entity<Visitor>(entity =>
            {
                entity.ToTable("visitors");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();
                
                entity.Property(e => e.FullName)
                    .HasColumnName("full_name")
                    .HasMaxLength(100)
                    .IsRequired();
                
                entity.Property(e => e.TcNumber)
                    .HasColumnName("tc_number")
                    .HasMaxLength(11)
                    .IsRequired();
                
                entity.Property(e => e.VisitReason)
                    .HasColumnName("visit_reason")
                    .HasMaxLength(500)
                    .IsRequired();
                
                entity.Property(e => e.EnteredAt)
                    .HasColumnName("entered_at")
                    .IsRequired();
                
                entity.Property(e => e.ExitedAt)
                    .HasColumnName("exited_at");

                // Index for TC Number for faster searches
                entity.HasIndex(e => e.TcNumber);
                
                // Index for EnteredAt for date-based queries
                entity.HasIndex(e => e.EnteredAt);
            });

            // Seed Data artık kaldırıldı - veriler korunacak
            // SeedData(modelBuilder);
        }

        // Seed data metodu kaldırıldı
    }
}
