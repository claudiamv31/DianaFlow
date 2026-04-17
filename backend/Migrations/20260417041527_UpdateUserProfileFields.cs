using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Username",
                table: "UserProfiles",
                newName: "Name");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "UserProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastName",
                table: "UserProfiles");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "UserProfiles",
                newName: "Username");
        }
    }
}
