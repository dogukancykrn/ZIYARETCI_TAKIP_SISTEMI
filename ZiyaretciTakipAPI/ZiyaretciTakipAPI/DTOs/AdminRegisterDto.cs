namespace ZiyaretciTakipAPI.DTOs
{
    public class AdminRegisterDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string TcNumber { get; set; }
        public required string Email { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
    }
}