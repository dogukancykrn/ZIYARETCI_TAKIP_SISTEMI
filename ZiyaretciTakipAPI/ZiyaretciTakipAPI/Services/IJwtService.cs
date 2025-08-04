using ZiyaretciTakipAPI.Models;

namespace ZiyaretciTakipAPI.Services
{
    public interface IJwtService
    {
        string GenerateToken(Admin admin);
    }
}