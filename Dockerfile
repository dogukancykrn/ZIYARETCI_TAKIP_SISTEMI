# ZIYARETCI TAKIP SISTEMI - BACKEND API DOCKERFILE
# Bu dosya, .NET 8.0 ASP.NET Core API'sinin Docker container'ını oluşturur

# BASE STAGE - Runtime ortamı
# .NET 8.0 ASP.NET Core runtime image'ını base olarak kullan
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
# Çalışma dizini olarak /app'i ayarla
WORKDIR /app
# Container'ın 80 portunu dışarıya aç
EXPOSE 80

# BUILD STAGE - Derleme ortamı
# .NET 8.0 SDK image'ını build için kullan (SDK = Runtime + Build Tools)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# Kaynak kod için çalışma dizini
WORKDIR /src

# Proje dosyasını kopyala ve bağımlılıkları restore et
COPY ["ZiyaretciTakipAPI/ZiyaretciTakipAPI/ZiyaretciTakipAPI.csproj", "ZiyaretciTakipAPI/ZiyaretciTakipAPI/"]
RUN dotnet restore "ZiyaretciTakipAPI/ZiyaretciTakipAPI/ZiyaretciTakipAPI.csproj"

# Tüm kaynak kodları kopyala
COPY . .
WORKDIR "/src/ZiyaretciTakipAPI/ZiyaretciTakipAPI"

# Projeyi Release modunda derle
RUN dotnet build "ZiyaretciTakipAPI.csproj" -c Release -o /app/build

# Projeyi publish et (deployment için optimize edilmiş)
RUN dotnet publish "ZiyaretciTakipAPI.csproj" -c Release -o /app/publish

# FINAL STAGE - Çalışma zamanı
# Base stage'ini final olarak kullan (sadece runtime, SDK değil)
FROM base AS final
WORKDIR /app

# Build stage'den publish edilmiş dosyaları kopyala
COPY --from=build /app/publish .

# Container başlatıldığında çalışacak komut
ENTRYPOINT ["dotnet", "ZiyaretciTakipAPI.dll"]