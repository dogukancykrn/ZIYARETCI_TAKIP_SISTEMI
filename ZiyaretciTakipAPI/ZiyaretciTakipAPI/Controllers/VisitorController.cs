using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZiyaretciTakipAPI.DTOs;
using ZiyaretciTakipAPI.Models;
using ZiyaretciTakipAPI.Data;
using ZiyaretciTakipAPI.Services;

namespace ZiyaretciTakipAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VisitorController : ControllerBase
    {
        private readonly PostgreSqlDbContext _context;
        // private readonly RedisCacheService _cacheService;

        // Ensure only one constructor for DI
        public VisitorController(PostgreSqlDbContext context)
        {
            _context = context;
            // Redis cache service temporarily disabled
            // _cacheService = cacheService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateVisitor([FromBody] VisitorCreateDto visitorDto)
        {
            var visitor = new Visitor
            {
                Id = Guid.NewGuid(),
                FullName = visitorDto.FullName, // İsmi doğal halinde kaydet
                TcNumber = visitorDto.TcNumber,
                VisitReason = visitorDto.VisitReason,
                EnteredAt = DateTime.UtcNow,
                ExitedAt = null
            };

            _context.Visitors.Add(visitor);
            await _context.SaveChangesAsync();

            // Redis cache temporarily disabled
            // await _cacheService.RemoveAsync("active_visitors");

            return Ok(new { 
                success = true, 
                message = "Ziyaretçi başarıyla kaydedildi!", 
                data = visitor 
            });
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveVisitors()
        {
            // Redis cache temporarily disabled
            /*
            const string cacheKey = "active_visitors";
            var cachedVisitors = await _cacheService.GetAsync<List<Visitor>>(cacheKey);
            if (cachedVisitors != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Aktif ziyaretçiler cache üzerinden getirildi",
                    data = cachedVisitors
                });
            }
            */

            var activeVisitors = await _context.Visitors
                .Where(v => v.ExitedAt == null)
                .ToListAsync();

            // Redis cache temporarily disabled
            // await _cacheService.SetAsync("active_visitors", activeVisitors, TimeSpan.FromMinutes(5));

            return Ok(new
            {
                success = true,
                message = "Aktif ziyaretçiler veritabanından getirildi",
                data = activeVisitors
            });
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetVisitorHistory()
        {
            var visitors = await _context.Visitors.ToListAsync();
            return Ok(new { 
                success = true, 
                message = "Ziyaret geçmişi getirildi", 
                data = visitors 
            });
        }

        [HttpPatch("{tcNumber}/exit")]
        public async Task<IActionResult> ExitVisitor(string tcNumber)
        {
            var visitor = await _context.Visitors
                .FirstOrDefaultAsync(v => v.TcNumber == tcNumber && v.ExitedAt == null);
            
            if (visitor == null)
            {
                return NotFound(new { 
                    success = false, 
                    message = "Aktif ziyaretçi bulunamadı!" 
                });
            }

            visitor.ExitedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            // Redis cache temporarily disabled
            // await _cacheService.RemoveAsync("active_visitors");

            return Ok(new
            {
                success = true,
                message = "Ziyaretçi çıkışı kaydedildi!",
                data = visitor
            });
        }

        [HttpGet("{tcNumber}")]
        public async Task<IActionResult> GetVisitorByTcNumber(string tcNumber)
        {
            var visitor = await _context.Visitors
                .FirstOrDefaultAsync(v => v.TcNumber == tcNumber);
            
            if (visitor == null)
            {
                return NotFound(new { 
                    success = false, 
                    message = "Ziyaretçi bulunamadı!" 
                });
            }

            return Ok(new { 
                success = true, 
                data = visitor 
            });
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var totalVisitors = await _context.Visitors.CountAsync();
            var activeVisitors = await _context.Visitors.CountAsync(v => v.ExitedAt == null);
            var todayVisitors = await _context.Visitors
                .CountAsync(v => v.EnteredAt.Date == DateTime.Today);
            var thisWeekVisitors = await _context.Visitors
                .CountAsync(v => v.EnteredAt >= DateTime.Today.AddDays(-7));
            
            var statistics = new {
                totalVisitors,
                activeVisitors,
                todayVisitors,
                thisWeekVisitors,
                avgVisitDurationHours = await CalculateAverageVisitDuration()
            };

            return Ok(new { 
                success = true, 
                message = "İstatistikler getirildi", 
                data = statistics 
            });
        }

        [HttpPost("filter")]
        public async Task<IActionResult> FilterVisitors([FromBody] VisitorFilterDto filter)
        {
            var query = _context.Visitors.AsQueryable();

            if (!string.IsNullOrEmpty(filter.FullName))
            {
                // PostgreSQL için case-insensitive arama (LOWER kullanarak)
                var searchName = filter.FullName.ToLower();
                query = query.Where(v => EF.Functions.Like(v.FullName.ToLower(), $"%{searchName}%"));
            }

            if (!string.IsNullOrEmpty(filter.TcNumber))
            {
                // TC numarası için partial match
                var searchTc = filter.TcNumber;
                query = query.Where(v => v.TcNumber.Contains(searchTc));
            }

            if (filter.StartDate.HasValue)
            {
                query = query.Where(v => v.EnteredAt >= filter.StartDate.Value);
            }

            if (filter.EndDate.HasValue)
            {
                query = query.Where(v => v.EnteredAt <= filter.EndDate.Value);
            }

            var visitors = await query.OrderByDescending(v => v.EnteredAt).ToListAsync();

            return Ok(new { 
                success = true, 
                message = "Filtrelenmiş ziyaretçiler getirildi", 
                data = visitors 
            });
        }

        private async Task<double> CalculateAverageVisitDuration()
        {
            var completedVisits = await _context.Visitors
                .Where(v => v.ExitedAt != null)
                .ToListAsync();

            if (!completedVisits.Any())
                return 0;

            var totalHours = completedVisits
                .Sum(v => (v.ExitedAt!.Value - v.EnteredAt).TotalHours);

            return totalHours / completedVisits.Count;
        }
    }
}
