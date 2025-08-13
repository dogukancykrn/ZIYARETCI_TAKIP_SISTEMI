namespace ZiyaretciTakipAPI.Models
{
    using System;

    // Admin kullanıcı modelini tanımlayan sınıf
    public class Admin
    {
        public Guid Id { get; set; }                        // Benzersiz admin kimliği (GUID)
        public required string FullName { get; set; }       // Admin'in tam adı (zorunlu)
        public required string FirstName { get; set; }      // Admin'in adı (zorunlu)
        public required string LastName { get; set; }       // Admin'in soyadı (zorunlu)
        public required string TcNumber { get; set; }       // Admin'in TC kimlik numarası (zorunlu)
        public required string PhoneNumber { get; set; }    // Admin'in telefon numarası (zorunlu)
        public required string Email { get; set; }          // Admin'in e-posta adresi (zorunlu)
        public required string PasswordHash { get; set; }   // Admin'in hash'lenmiş şifresi (zorunlu)
        public string Role { get; set; } = "Admin";         // Admin rolü (varsayılan: "Admin")
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Oluşturulma tarihi (varsayılan: şu an)
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Güncellenme tarihi (varsayılan: şu an)
    }
}    