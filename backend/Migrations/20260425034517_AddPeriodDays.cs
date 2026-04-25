using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPeriodDays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Flow",
                table: "Periods");

            migrationBuilder.AddColumn<string>(
                name: "TimeZone",
                table: "UserProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateOnly>(
                name: "UpdatedAt",
                table: "UserProfiles",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AlterColumn<DateOnly>(
                name: "EndDate",
                table: "Periods",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.CreateTable(
                name: "PeriodDays",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PeriodId = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    Flow = table.Column<int>(type: "integer", nullable: false),
                    PeriodsId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PeriodDays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PeriodDays_Periods_PeriodsId",
                        column: x => x.PeriodsId,
                        principalTable: "Periods",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_PeriodDays_PeriodsId",
                table: "PeriodDays",
                column: "PeriodsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PeriodDays");

            migrationBuilder.DropColumn(
                name: "TimeZone",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "UserProfiles");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "EndDate",
                table: "Periods",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1),
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Flow",
                table: "Periods",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
