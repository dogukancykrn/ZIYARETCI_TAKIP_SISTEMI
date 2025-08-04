using System.Text.Json.Serialization;

public class VisitorCreateDto
{
    [JsonPropertyName("fullName")]
    public required string FullName { get; set; }

    [JsonPropertyName("tcNumber")]
    public required string TcNumber { get; set; }

    [JsonPropertyName("visitReason")]
    public required string VisitReason { get; set; }
}
