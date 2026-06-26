using Microsoft.EntityFrameworkCore;
using backend.Modulos.User.Models; 
using backend.Modulos.Profile.Models;
using backend.Modulos.Periods.Models;
using backend.Modulos.Cycles.Enums;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Periods> Periods { get; set; }
        public DbSet<PeriodDays> PeriodDays { get; set; }
        public DbSet<PhaseMessages> PhaseMessages { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Profile> Profiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<User>()
                .Property(u => u.Id)
                .HasValueGenerator<Microsoft.EntityFrameworkCore.ValueGeneration.SequentialGuidValueGenerator>();
            
            modelBuilder.Entity<Profile>()
                .Property(p => p.Id)
                .HasValueGenerator<Microsoft.EntityFrameworkCore.ValueGeneration.SequentialGuidValueGenerator>();
            
            modelBuilder.Entity<Periods>()
                .HasOne(p => p.User)    
                .WithMany()
                .HasForeignKey(pd => pd.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PeriodDays>()
                .HasOne(pd => pd.Periods)    
                .WithMany()
                .HasForeignKey(pd => pd.PeriodId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<Profile>()
                .HasOne(p => p.User)
                .WithOne(u => u.Profile)
                .HasForeignKey<Profile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}