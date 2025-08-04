namespace ZiyaretciTakipAPI.DTOs
{
    public class AdminRegisterDto
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Password { get; set; }
    }
}