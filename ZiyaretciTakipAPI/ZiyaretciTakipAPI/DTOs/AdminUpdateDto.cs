using System.Text.Json.Serialization;

namespace ZiyaretciTakipAPI.DTOs
{
    public class AdminUpdateDto
    {
        [JsonPropertyName("fullName")]
        public required string FullName { get; set; }

        [JsonPropertyName("email")]
        public required string Email { get; set; }

        [JsonPropertyName("phoneNumber")]
        public required string PhoneNumber { get; set; }
    }
}
