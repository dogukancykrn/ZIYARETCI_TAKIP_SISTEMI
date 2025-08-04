namespace ZiyaretciTakipAPI.Models
{
    using System;

    public class Admin
    {
        public Guid Id { get; set; }
        public required string FullName { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public string Role { get; set; } = "Admin";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}    