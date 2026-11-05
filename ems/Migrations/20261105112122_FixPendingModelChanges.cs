using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace ems.Migrations
{
    /// <inheritdoc />
    public partial class FixPendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE `EventApplications` DROP FOREIGN KEY `FK_EventApplications_Events_EventId`");
            migrationBuilder.Sql("ALTER TABLE `EventApplications` DROP FOREIGN KEY `FK_EventApplications_Users_UserId`");
            migrationBuilder.Sql("ALTER TABLE `EventApplications` DROP PRIMARY KEY");
            migrationBuilder.Sql(@"
UPDATE `EventApplications` AS application
JOIN (
    SELECT `UserId`, `EventId`, ROW_NUMBER() OVER (ORDER BY `UserId`, `EventId`) AS `NewId`
    FROM `EventApplications`
) AS sequence_ids
  ON sequence_ids.`UserId` = application.`UserId`
 AND sequence_ids.`EventId` = application.`EventId`
SET application.`Id` = sequence_ids.`NewId`");
            migrationBuilder.Sql("ALTER TABLE `EventApplications` ADD PRIMARY KEY (`Id`)");
            migrationBuilder.Sql("ALTER TABLE `EventApplications` MODIFY `Id` int NOT NULL AUTO_INCREMENT");
            migrationBuilder.Sql("CREATE UNIQUE INDEX `IX_EventApplications_UserId_EventId` ON `EventApplications` (`UserId`, `EventId`)");
            migrationBuilder.Sql("ALTER TABLE `EventApplications` ADD CONSTRAINT `FK_EventApplications_Events_EventId` FOREIGN KEY (`EventId`) REFERENCES `Events` (`Id`) ON DELETE CASCADE");
            migrationBuilder.Sql("ALTER TABLE `EventApplications` ADD CONSTRAINT `FK_EventApplications_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE");
            migrationBuilder.Sql("ALTER TABLE `UserRoles` ADD CONSTRAINT `FK_UserRoles_Roles_roleId` FOREIGN KEY (`roleId`) REFERENCES `Roles` (`Id`) ON DELETE RESTRICT");
            migrationBuilder.Sql("ALTER TABLE `Users` ADD CONSTRAINT `FK_Users_Departments_DepartmentId` FOREIGN KEY (`DepartmentId`) REFERENCES `Departments` (`Id`) ON DELETE RESTRICT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE `EventApplications` MODIFY `Id` int NOT NULL;
ALTER TABLE `EventApplications` DROP PRIMARY KEY;
ALTER TABLE `EventApplications` DROP INDEX `IX_EventApplications_UserId_EventId`;
ALTER TABLE `EventApplications` ADD PRIMARY KEY (`UserId`, `EventId`);
");

            migrationBuilder.Sql(@"
ALTER TABLE `UserRoles` DROP FOREIGN KEY `FK_UserRoles_Roles_roleId`;
ALTER TABLE `UserRoles` ADD CONSTRAINT `FK_UserRoles_Roles_roleId` FOREIGN KEY (`roleId`) REFERENCES `Roles` (`Id`) ON DELETE CASCADE;

ALTER TABLE `Users` DROP FOREIGN KEY `FK_Users_Departments_DepartmentId`;
ALTER TABLE `Users` ADD CONSTRAINT `FK_Users_Departments_DepartmentId` FOREIGN KEY (`DepartmentId`) REFERENCES `Departments` (`Id`) ON DELETE CASCADE;
");
        }
    }
}
