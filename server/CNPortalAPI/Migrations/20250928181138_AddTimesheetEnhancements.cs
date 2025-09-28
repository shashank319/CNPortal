using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CNPortalAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTimesheetEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Identity",
                columns: table => new
                {
                    IdentityID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Role = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Identity", x => x.IdentityID);
                });

            migrationBuilder.CreateTable(
                name: "Candidate",
                columns: table => new
                {
                    CandidateID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ClientName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EmployerID = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Skills = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Experience = table.Column<int>(type: "int", nullable: true),
                    Resume = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    HourlyRate = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidate", x => x.CandidateID);
                });

            migrationBuilder.CreateTable(
                name: "Employee",
                columns: table => new
                {
                    EmployeeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FirstTimeFlag = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IdentityID = table.Column<int>(type: "int", nullable: false),
                    VendorID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employee", x => x.EmployeeID);
                    table.ForeignKey(
                        name: "FK_Employee_Identity_IdentityID",
                        column: x => x.IdentityID,
                        principalTable: "Identity",
                        principalColumn: "IdentityID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Vendor",
                columns: table => new
                {
                    VendorID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    VendorName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RatePerHour = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vendor", x => x.VendorID);
                    table.ForeignKey(
                        name: "FK_Vendor_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MasterTimeSheet",
                columns: table => new
                {
                    IndexID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FileName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    StorageAccount = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    FromDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalHoursWorked = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    VendorID = table.Column<int>(type: "int", nullable: false),
                    RatePerHour = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    ModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovalL1 = table.Column<bool>(type: "bit", nullable: false),
                    ApprovalL2 = table.Column<bool>(type: "bit", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PeriodType = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    WeekNumber = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedL1Date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedL2Date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterTimeSheet", x => x.IndexID);
                    table.ForeignKey(
                        name: "FK_MasterTimeSheet_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MasterTimeSheet_Vendor_VendorID",
                        column: x => x.VendorID,
                        principalTable: "Vendor",
                        principalColumn: "VendorID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EveryDayTimesheet",
                columns: table => new
                {
                    TimesheetID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HoursWorked = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IndexID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EveryDayTimesheet", x => x.TimesheetID);
                    table.ForeignKey(
                        name: "FK_EveryDayTimesheet_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EveryDayTimesheet_MasterTimeSheet_IndexID",
                        column: x => x.IndexID,
                        principalTable: "MasterTimeSheet",
                        principalColumn: "IndexID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "Identity",
                columns: new[] { "IdentityID", "Role" },
                values: new object[,]
                {
                    { 1, "Emp" },
                    { 2, "Admin" },
                    { 3, "Manager" },
                    { 4, "Client" }
                });

            migrationBuilder.InsertData(
                table: "Employee",
                columns: new[] { "EmployeeID", "CompanyName", "Email", "FirstName", "FirstTimeFlag", "IdentityID", "LastName", "MiddleName", "PasswordHash", "Status", "VendorID" },
                values: new object[,]
                {
                    { 1, "Tech Solutions Inc", "employee1@company.com", "John", false, 1, "Doe", null, "$2a$11$J9FqGRgOKv3KqF7tF1EHQOyE.n3aV8VsJCJQXY9/8jGF4JGFVqJ8i", "Active", null },
                    { 2, "Creative Design LLC", "employee2@company.com", "Jane", false, 1, "Smith", null, "$2a$11$J9FqGRgOKv3KqF7tF1EHQOyE.n3aV8VsJCJQXY9/8jGF4JGFVqJ8i", "Active", null },
                    { 3, "Management Corp", "employer1@company.com", "Mike", false, 2, "Johnson", null, "$2a$11$J9FqGRgOKv3KqF7tF1EHQOyE.n3aV8VsJCJQXY9/8jGF4JGFVqJ8i", "Active", null },
                    { 4, "Business Solutions", "employer2@company.com", "Sarah", false, 3, "Wilson", null, "$2a$11$J9FqGRgOKv3KqF7tF1EHQOyE.n3aV8VsJCJQXY9/8jGF4JGFVqJ8i", "Active", null }
                });

            migrationBuilder.InsertData(
                table: "Vendor",
                columns: new[] { "VendorID", "EmployeeID", "RatePerHour", "VendorName" },
                values: new object[,]
                {
                    { 1, 1, 45.00m, "John Doe Consulting" },
                    { 2, 2, 50.00m, "Jane Smith Design" },
                    { 3, 3, 75.00m, "Mike Johnson Management" },
                    { 4, 4, 65.00m, "Sarah Wilson Business" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Candidate_Email",
                table: "Candidate",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Candidate_EmployerID",
                table: "Candidate",
                column: "EmployerID");

            migrationBuilder.CreateIndex(
                name: "IX_Employee_Email",
                table: "Employee",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employee_IdentityID",
                table: "Employee",
                column: "IdentityID");

            migrationBuilder.CreateIndex(
                name: "IX_Employee_VendorID",
                table: "Employee",
                column: "VendorID");

            migrationBuilder.CreateIndex(
                name: "IX_EveryDayTimesheet_EmployeeID",
                table: "EveryDayTimesheet",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_EveryDayTimesheet_IndexID",
                table: "EveryDayTimesheet",
                column: "IndexID");

            migrationBuilder.CreateIndex(
                name: "IX_MasterTimeSheet_EmployeeID",
                table: "MasterTimeSheet",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_MasterTimeSheet_VendorID",
                table: "MasterTimeSheet",
                column: "VendorID");

            migrationBuilder.CreateIndex(
                name: "IX_Vendor_EmployeeID",
                table: "Vendor",
                column: "EmployeeID");

            migrationBuilder.AddForeignKey(
                name: "FK_Candidate_Employee_EmployerID",
                table: "Candidate",
                column: "EmployerID",
                principalTable: "Employee",
                principalColumn: "EmployeeID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Employee_Vendor_VendorID",
                table: "Employee",
                column: "VendorID",
                principalTable: "Vendor",
                principalColumn: "VendorID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vendor_Employee_EmployeeID",
                table: "Vendor");

            migrationBuilder.DropTable(
                name: "Candidate");

            migrationBuilder.DropTable(
                name: "EveryDayTimesheet");

            migrationBuilder.DropTable(
                name: "MasterTimeSheet");

            migrationBuilder.DropTable(
                name: "Employee");

            migrationBuilder.DropTable(
                name: "Identity");

            migrationBuilder.DropTable(
                name: "Vendor");
        }
    }
}
