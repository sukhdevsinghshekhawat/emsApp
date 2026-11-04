using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ems.Migrations
{
    /// <inheritdoc />
    public partial class RemoveEventDepartmentId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_Departments_DepartmentId",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_DepartmentId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "Events");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "Events",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Events_DepartmentId",
                table: "Events",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Departments_DepartmentId",
                table: "Events",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
