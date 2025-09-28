using Microsoft.EntityFrameworkCore;

namespace CNPortalAPI.Models
{
    public class CNPortalDbContext : DbContext
    {
        public CNPortalDbContext(DbContextOptions<CNPortalDbContext> options) : base(options)
        {
        }

        public DbSet<Identity> Identities { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Vendor> Vendors { get; set; }
        public DbSet<MasterTimeSheet> MasterTimeSheets { get; set; }
        public DbSet<EveryDayTimesheet> EveryDayTimesheets { get; set; }
        public DbSet<Candidate> Candidates { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure table names
            modelBuilder.Entity<Identity>().ToTable("Identity");
            modelBuilder.Entity<Employee>().ToTable("Employee");
            modelBuilder.Entity<Vendor>().ToTable("Vendor");
            modelBuilder.Entity<MasterTimeSheet>().ToTable("MasterTimeSheet");
            modelBuilder.Entity<EveryDayTimesheet>().ToTable("EveryDayTimesheet");
            modelBuilder.Entity<Candidate>().ToTable("Candidate");

            // Configure unique constraints
            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.Email)
                .IsUnique();

            modelBuilder.Entity<Candidate>()
                .HasIndex(c => c.Email)
                .IsUnique();

            // Configure relationships
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Identity)
                .WithMany(i => i.Employees)
                .HasForeignKey(e => e.IdentityID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Vendor)
                .WithMany()
                .HasForeignKey(e => e.VendorID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Vendor>()
                .HasOne(v => v.Employee)
                .WithMany()
                .HasForeignKey(v => v.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MasterTimeSheet>()
                .HasOne(m => m.Employee)
                .WithMany(e => e.MasterTimeSheets)
                .HasForeignKey(m => m.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MasterTimeSheet>()
                .HasOne(m => m.Vendor)
                .WithMany(v => v.MasterTimeSheets)
                .HasForeignKey(m => m.VendorID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EveryDayTimesheet>()
                .HasOne(e => e.Employee)
                .WithMany(emp => emp.EveryDayTimesheets)
                .HasForeignKey(e => e.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EveryDayTimesheet>()
                .HasOne(e => e.MasterTimeSheet)
                .WithMany(m => m.EveryDayTimesheets)
                .HasForeignKey(e => e.IndexID)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Candidate>()
                .HasOne(c => c.Employer)
                .WithMany()
                .HasForeignKey(c => c.EmployerID)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed data for Identity roles
            modelBuilder.Entity<Identity>().HasData(
                new Identity { IdentityID = 1, Role = "Emp" },
                new Identity { IdentityID = 2, Role = "Admin" },
                new Identity { IdentityID = 3, Role = "Manager" },
                new Identity { IdentityID = 4, Role = "Client" }
            );

            // Seed data for test employees (without VendorID initially)
            // All passwords are: Test@123 (hashed)
            var hashedPassword = "$2a$11$J9FqGRgOKv3KqF7tF1EHQOyE.n3aV8VsJCJQXY9/8jGF4JGFVqJ8i";

            modelBuilder.Entity<Employee>().HasData(
                new Employee
                {
                    EmployeeID = 1,
                    CompanyName = "Tech Solutions Inc",
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "employee1@company.com",
                    PasswordHash = hashedPassword,
                    FirstTimeFlag = false,
                    Status = "Active",
                    IdentityID = 1, // Emp role
                    VendorID = null // Will be set after vendor creation
                },
                new Employee
                {
                    EmployeeID = 2,
                    CompanyName = "Creative Design LLC",
                    FirstName = "Jane",
                    LastName = "Smith",
                    Email = "employee2@company.com",
                    PasswordHash = hashedPassword,
                    FirstTimeFlag = false,
                    Status = "Active",
                    IdentityID = 1, // Emp role
                    VendorID = null
                },
                new Employee
                {
                    EmployeeID = 3,
                    CompanyName = "Management Corp",
                    FirstName = "Mike",
                    LastName = "Johnson",
                    Email = "employer1@company.com",
                    PasswordHash = hashedPassword,
                    FirstTimeFlag = false,
                    Status = "Active",
                    IdentityID = 2, // Admin role
                    VendorID = null
                },
                new Employee
                {
                    EmployeeID = 4,
                    CompanyName = "Business Solutions",
                    FirstName = "Sarah",
                    LastName = "Wilson",
                    Email = "employer2@company.com",
                    PasswordHash = hashedPassword,
                    FirstTimeFlag = false,
                    Status = "Active",
                    IdentityID = 3, // Manager role
                    VendorID = null
                }
            );

            // Seed data for vendors
            modelBuilder.Entity<Vendor>().HasData(
                new Vendor
                {
                    VendorID = 1,
                    EmployeeID = 1,
                    VendorName = "John Doe Consulting",
                    RatePerHour = 45.00m
                },
                new Vendor
                {
                    VendorID = 2,
                    EmployeeID = 2,
                    VendorName = "Jane Smith Design",
                    RatePerHour = 50.00m
                },
                new Vendor
                {
                    VendorID = 3,
                    EmployeeID = 3,
                    VendorName = "Mike Johnson Management",
                    RatePerHour = 75.00m
                },
                new Vendor
                {
                    VendorID = 4,
                    EmployeeID = 4,
                    VendorName = "Sarah Wilson Business",
                    RatePerHour = 65.00m
                }
            );
        }
    }
}