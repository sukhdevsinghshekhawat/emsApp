using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ems.Migrations
{
    /// <inheritdoc />
    public partial class AddEventApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EventApplications",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    EventId = table.Column<int>(type: "int", nullable: false),
                    Aadhar = table.Column<string>(type: "varchar(12)", maxLength: 12, nullable: false),
                    Mobile = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "longtext", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventApplications", x => new { x.UserId, x.EventId });
                    table.ForeignKey(
                        name: "FK_EventApplications_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventApplications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_EventApplications_EventId",
                table: "EventApplications",
                column: "EventId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventApplications");
        }
    }
}
