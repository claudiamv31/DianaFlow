using Microsoft.EntityFrameworkCore;
using backend.Modulos.Users.Models; 
using backend.Modulos.Periods.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Aquí agregas las tablas de tus módulos, por ejemplo UserProfile
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<Periods> Periods { get; set; }
        public DbSet<PeriodDays> PeriodDays { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
           modelBuilder.Entity<UserProfile>()
                .Property(u => u.Id)
                .HasValueGenerator<Microsoft.EntityFrameworkCore.ValueGeneration.SequentialGuidValueGenerator>();

            modelBuilder.Entity<PeriodDays>()
                .HasOne(pd => pd.Periods)    
                .WithMany()
                .HasForeignKey(pd => pd.PeriodId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
