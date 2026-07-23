using Microsoft.EntityFrameworkCore;
using backend.Modulos.User.Models; 
using backend.Modulos.Profile.Models;
using backend.Modulos.Periods.Models;
using backend.Modulos.Symptoms.Models;


namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Periods> Periods { get; set; }
        public DbSet<PeriodDays> PeriodDays { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Symptom> Symptoms { get; set; }
        public DbSet<UserSymptomEntry> UserSymptomEntries { get; set; }

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

            modelBuilder.Entity<Periods>()
                .HasIndex(p => new { p.UserId, p.StartDate });

            modelBuilder.Entity<Periods>()
                .HasIndex(p => new { p.UserId, p.EndDate });

            modelBuilder.Entity<PeriodDays>()
                .HasOne(pd => pd.Periods)    
                .WithMany()
                .HasForeignKey(pd => pd.PeriodId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PeriodDays>()
                .HasIndex(pd => new { pd.PeriodId, pd.Date });

            modelBuilder.Entity<PeriodDays>()
                .HasIndex(pd => pd.Date);

            modelBuilder.Entity<Profile>()
                .HasOne(p => p.User)
                .WithOne(u => u.Profile)
                .HasForeignKey<Profile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.Token)
                .IsUnique();

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => new { rt.UserId, rt.IsRevoked });

            modelBuilder.Entity<Symptom>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Code)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.Name)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(x => x.Category)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasIndex(x => x.Code)
                    .IsUnique();
            });
        
            modelBuilder.Entity<UserSymptomEntry>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Notes)
                    .HasMaxLength(500);

                entity.HasOne(x => x.User)
                    .WithMany(x => x.SymptomEntries)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.Symptom)
                    .WithMany(x => x.Entries)
                    .HasForeignKey(x => x.SymptomId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => new
                {
                    x.UserId,
                    x.Date,
                    x.SymptomId
                }).IsUnique();

                entity.HasIndex(x => new
                {
                    x.UserId,
                    x.Date
                });
            }); 
        }
    }
}
