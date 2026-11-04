using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ems.Migrations
{
    /// <inheritdoc />
    public partial class AddIdEventApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "EventApplications",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Id",
                table: "EventApplications");
        }
    }
}
