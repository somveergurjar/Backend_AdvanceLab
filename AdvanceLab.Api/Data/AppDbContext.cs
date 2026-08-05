using AdvanceLab.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AdvanceLab.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<ServiceItem> ServiceItems => Set<ServiceItem>();
    public DbSet<ContentBlock> ContentBlocks => Set<ContentBlock>();
    public DbSet<SiteImage> SiteImages => Set<SiteImage>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<FeatureCard> FeatureCards => Set<FeatureCard>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<B2BInquiry> B2BInquiries => Set<B2BInquiry>();
    public DbSet<CallbackRequest> CallbackRequests => Set<CallbackRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AdminUser>().HasIndex(u => u.Username).IsUnique();

        modelBuilder.Entity<ServiceCategory>().HasIndex(c => c.Slug).IsUnique();

        modelBuilder.Entity<ServiceItem>()
            .HasOne(i => i.ServiceCategory)
            .WithMany(c => c.Items)
            .HasForeignKey(i => i.ServiceCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.ServiceItem)
            .WithMany()
            .HasForeignKey(a => a.ServiceItemId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ContentBlock>()
            .HasIndex(c => new { c.PageSlug, c.Key })
            .IsUnique();

        modelBuilder.Entity<ServiceItem>()
            .Property(i => i.Price).HasColumnType("decimal(10,2)");
    }
}
