namespace ZiyaretciTakipAPI.DTOs;

public class AuthResponseDto
{
    public required string Token { get; set; }
    public required AdminDto Admin { get; set; }

}

public class AdminDto
{
    public Guid Id { get; set; }
    public required string FullName { get; set; }
    public required string PhoneNumber { get; set; }
    public required string Email { get; set; }
    public string Role { get; set; } = "Admin";
}