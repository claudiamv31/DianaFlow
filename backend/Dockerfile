FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
ENV PATH="$PATH:/root/.dotnet/tools"

COPY ["backend.csproj", "./"]
RUN dotnet restore "backend.csproj"
RUN dotnet tool install --global dotnet-ef --version 8.0.10

COPY . .
RUN dotnet ef migrations bundle --self-contained -r linux-x64 -o /app/efbundle --force
RUN dotnet publish "backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY --from=build /app/efbundle .
RUN chmod +x /app/efbundle

ENTRYPOINT ["dotnet", "backend.dll"]
