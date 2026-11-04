using ems.Models;
using Microsoft.EntityFrameworkCore;
using ems.Models;


namespace ems.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }

        public DbSet<Department> Departments { get; set; }

        public DbSet<Event> Events { get; set; }
        public DbSet<DepartmentEvent> DepartmentEvents { get; set; }

        public DbSet<EventApplication> EventApplications { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Composite Primary Key
            modelBuilder.Entity<UserRole>().HasKey(u => new { u.userId, u.roleId });

            // User Relationship
            modelBuilder.Entity<UserRole>().HasOne(u => u.User).WithMany(u => u.UserRoles).HasForeignKey(u => u.userId);
            // Role Relationship
            modelBuilder.Entity<UserRole>().HasOne(u => u.Role).WithMany(u => u.UserRoles).HasForeignKey(u => u.roleId);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            //User-Department Relationship
            modelBuilder.Entity<User>().HasOne(u => u.Department).WithMany(d => d.Users).HasForeignKey(u => u.DepartmentId);

            //event or department relation many to many

            //composite key for departmentevent same combination (1, 1) dobara insert nahi ho sakta.
            //    matlab agar ek department me ek event hai to usi department me same event dobara nahi add ho sakta.

            modelBuilder.Entity<DepartmentEvent>().HasKey(de => new { de.DepartmentId, de.EventId });

            modelBuilder.Entity<DepartmentEvent>().HasOne(de => de.Department).WithMany(d => d.DepartmentEvents).HasForeignKey(de => de.DepartmentId);
            modelBuilder.Entity<DepartmentEvent>().HasOne(de => de.Event).WithMany(e => e.DepartmentEvents).HasForeignKey(de => de.EventId);

            // event application 
            //composite key
            modelBuilder.Entity<EventApplication>().HasKey(e => new { e.UserId, e.EventId });

            modelBuilder.Entity<EventApplication>().HasOne(ap => ap.Event).WithMany(e => e.EventApplications).HasForeignKey(e => e.EventId).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<EventApplication>().HasOne(u => u.User).WithMany(ap => ap.EventApplications).HasForeignKey(u => u.UserId).OnDelete(DeleteBehavior.Cascade);

        }

    }
}