using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SimplifySymptomSeverity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notes",
                table: "UserSymptomEntries");

            migrationBuilder.AlterColumn<int>(
                name: "Severity",
                table: "UserSymptomEntries",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<bool>(
                name: "AllowsSeverity",
                table: "Symptoms",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("UPDATE \"Symptoms\" SET \"AllowsSeverity\" = TRUE WHERE \"Code\" IN ('headache', 'cramps', 'back_pain');");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowsSeverity",
                table: "Symptoms");

            migrationBuilder.AlterColumn<int>(
                name: "Severity",
                table: "UserSymptomEntries",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "UserSymptomEntries",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}
