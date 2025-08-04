using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ZiyaretciTakipAPI.Data;
using ZiyaretciTakipAPI.Services;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect("localhost:6379"));
builder.Services.AddControllers();
builder.Services.AddScoped<RedisCacheService>();

// Database Configuration
if (builder.Environment.IsDevelopment())
{
    // Development ortamında PostgreSQL database kullan
    builder.Services.AddDbContext<PostgreSqlDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
            .ConfigureWarnings(warnings => 
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));
}
else
{
    // Production ortamında PostgreSQL database kullan
    builder.Services.AddDbContext<PostgreSqlDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
            .ConfigureWarnings(warnings => 
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));
}

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "DefaultSecretKeyForDevelopment123456789";
var key = Encoding.ASCII.GetBytes(secretKey);
builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3003")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Initialize database with seed data
// using (var scope = app.Services.CreateScope())
// {
//     var context = scope.ServiceProvider.GetRequiredService<PostgreSqlDbContext>();
//     context.Database.EnsureCreated();
// }

app.Run();