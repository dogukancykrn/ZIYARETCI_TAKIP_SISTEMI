using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ZiyaretciTakipAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgreSQL : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admins",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admins", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "visitors",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    tc_number = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: false),
                    visit_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    entered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    exited_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_visitors", x => x.id);
                });

            migrationBuilder.InsertData(
                table: "admins",
                columns: new[] { "id", "CreatedAt", "email", "full_name", "password_hash", "phone_number", "role" },
                values: new object[] { new Guid("a1b2c3d4-e5f6-7890-1234-567890abcdef"), new DateTime(2025, 7, 26, 13, 46, 33, 503, DateTimeKind.Utc).AddTicks(6068), "admin@banka.com", "Banka Admin", "$2a$11$sYLXzrttO2Ql7Yc2tnD7leXq7m0FfasM6J10Q8M4twHO5ftmS5d8S", "05551234567", "Admin" });

            migrationBuilder.CreateIndex(
                name: "IX_admins_email",
                table: "admins",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_visitors_entered_at",
                table: "visitors",
                column: "entered_at");

            migrationBuilder.CreateIndex(
                name: "IX_visitors_tc_number",
                table: "visitors",
                column: "tc_number");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admins");

            migrationBuilder.DropTable(
                name: "visitors");
        }
    }
}
