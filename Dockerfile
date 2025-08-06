FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ZiyaretciTakipAPI/ZiyaretciTakipAPI/ZiyaretciTakipAPI.csproj", "ZiyaretciTakipAPI/ZiyaretciTakipAPI/"]
RUN dotnet restore "ZiyaretciTakipAPI/ZiyaretciTakipAPI/ZiyaretciTakipAPI.csproj"
COPY . .
WORKDIR "/src/ZiyaretciTakipAPI/ZiyaretciTakipAPI"
RUN dotnet build "ZiyaretciTakipAPI.csproj" -c Release -o /app/build
RUN dotnet publish "ZiyaretciTakipAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ZiyaretciTakipAPI.dll"]