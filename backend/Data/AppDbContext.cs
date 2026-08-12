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

        public DbSet<Periods> Periods { get; set; } = null!;
        public DbSet<PeriodDays> PeriodDays { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Profile> Profiles { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<Symptom> Symptoms { get; set; } = null!;
        public DbSet<UserSymptomEntry> UserSymptomEntries { get; set; } = null!;
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;

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
                .HasIndex(u => u.NormalizedEmail)
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

            modelBuilder.Entity<PasswordResetToken>()
                .HasOne(prt => prt.User)
                .WithMany(u => u.PasswordResetTokens)
                .HasForeignKey(prt => prt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PasswordResetToken>()
                .HasIndex(prt => prt.TokenHash)
                .IsUnique();

            modelBuilder.Entity<PasswordResetToken>()
                .HasIndex(prt => prt.UserId)
                .HasFilter("\"UsedAt\" IS NULL")
                .IsUnique();

            modelBuilder.Entity<PasswordResetToken>()
                .Property(prt => prt.UsedAt)
                .IsConcurrencyToken();
        }
    }
}
