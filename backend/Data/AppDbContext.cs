using Microsoft.EntityFrameworkCore;

// Asegúrate de que el namespace de UserProfile coincida o agrégalo en los usings si no es global
// using backend.Modulos.Users.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Aquí agregas las tablas de tus módulos, por ejemplo UserProfile
        public DbSet<UserProfile> UserProfiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configuraciones especiales de tus tablas irían aquí
        }
    }
}
