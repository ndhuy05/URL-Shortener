# Dockerfile cho Users Service
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5001

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Users.csproj", "./"]
RUN dotnet restore "Users.csproj"
COPY . .
RUN dotnet build "Users.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Users.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Users.dll"]
