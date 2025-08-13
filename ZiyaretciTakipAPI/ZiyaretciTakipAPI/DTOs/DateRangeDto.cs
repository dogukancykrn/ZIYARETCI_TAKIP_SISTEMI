// Ziyaretçi Takip Sistemi - Tarih Aralığı DTO'su
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ZiyaretciTakipAPI.DTOs
{
    /// <summary>
    /// Tarih aralığı analizi için kullanılan Data Transfer Object
    /// </summary>
    public class DateRangeDto
    {
        /// <summary>
        /// Başlangıç tarihi (string formatında da kabul eder)
        /// </summary>
        [JsonPropertyName("startDate")]
        public string StartDateString { get; set; } = string.Empty;
        
        /// <summary>
        /// Bitiş tarihi (string formatında da kabul eder)
        /// </summary>
        [JsonPropertyName("endDate")]
        public string EndDateString { get; set; } = string.Empty;

        /// <summary>
        /// Başlangıç tarihini DateTime olarak döner (UTC)
        /// </summary>
        [JsonIgnore]
        public DateTime StartDate 
        { 
            get 
            {
                if (DateTime.TryParse(StartDateString, out var date))
                    return DateTime.SpecifyKind(date, DateTimeKind.Utc);
                return DateTime.UtcNow.Date;
            }
            set
            {
                StartDateString = value.ToString("yyyy-MM-dd");
            }
        }
        
        /// <summary>
        /// Bitiş tarihini DateTime olarak döner (UTC)
        /// </summary>
        [JsonIgnore]
        public DateTime EndDate 
        { 
            get 
            {
                if (DateTime.TryParse(EndDateString, out var date))
                    return DateTime.SpecifyKind(date.Date.AddDays(1).AddSeconds(-1), DateTimeKind.Utc);
                return DateTime.UtcNow.Date.AddDays(1).AddSeconds(-1);
            }
            set
            {
                EndDateString = value.ToString("yyyy-MM-dd");
            }
        }
    }
}
