using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZiyaretciTakipAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "admins",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "admins",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TcNumber",
                table: "admins",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "admins",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "admins");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "admins");

            migrationBuilder.DropColumn(
                name: "TcNumber",
                table: "admins");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "admins");
        }
    }
}
