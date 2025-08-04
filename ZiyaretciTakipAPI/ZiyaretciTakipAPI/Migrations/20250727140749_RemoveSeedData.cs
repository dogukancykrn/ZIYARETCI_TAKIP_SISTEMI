using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ZiyaretciTakipAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "visitors",
                keyColumn: "id",
                keyValue: new Guid("b1b2c3d4-e5f6-7890-1234-567890abcdef"));

            migrationBuilder.DeleteData(
                table: "visitors",
                keyColumn: "id",
                keyValue: new Guid("c1b2c3d4-e5f6-7890-1234-567890abcdef"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "visitors",
                columns: new[] { "id", "entered_at", "exited_at", "full_name", "tc_number", "visit_reason" },
                values: new object[,]
                {
                    { new Guid("b1b2c3d4-e5f6-7890-1234-567890abcdef"), new DateTime(2025, 1, 23, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 23, 11, 0, 0, 0, DateTimeKind.Utc), "Ahmet Yılmaz", "12345678901", "Kredi başvurusu" },
                    { new Guid("c1b2c3d4-e5f6-7890-1234-567890abcdef"), new DateTime(2025, 1, 23, 12, 0, 0, 0, DateTimeKind.Utc), null, "Fatma Kaya", "98765432109", "Hesap açma" }
                });
        }
    }
}
