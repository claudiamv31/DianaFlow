using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ConfiguracionCascada : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PeriodDays_Periods_PeriodsId",
                table: "PeriodDays");

            migrationBuilder.DropIndex(
                name: "IX_PeriodDays_PeriodsId",
                table: "PeriodDays");

            migrationBuilder.DropColumn(
                name: "PeriodsId",
                table: "PeriodDays");

            migrationBuilder.Sql("ALTER TABLE \"UserProfiles\" ALTER COLUMN \"Id\" DROP IDENTITY IF EXISTS;");
            migrationBuilder.Sql("ALTER TABLE \"UserProfiles\" ALTER COLUMN \"Id\" TYPE uuid USING gen_random_uuid();");

            migrationBuilder.CreateIndex(
                name: "IX_PeriodDays_PeriodId",
                table: "PeriodDays",
                column: "PeriodId");

            migrationBuilder.AddForeignKey(
                name: "FK_PeriodDays_Periods_PeriodId",
                table: "PeriodDays",
                column: "PeriodId",
                principalTable: "Periods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PeriodDays_Periods_PeriodId",
                table: "PeriodDays");

            migrationBuilder.DropIndex(
                name: "IX_PeriodDays_PeriodId",
                table: "PeriodDays");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "UserProfiles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "PeriodsId",
                table: "PeriodDays",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PeriodDays_PeriodsId",
                table: "PeriodDays",
                column: "PeriodsId");

            migrationBuilder.AddForeignKey(
                name: "FK_PeriodDays_Periods_PeriodsId",
                table: "PeriodDays",
                column: "PeriodsId",
                principalTable: "Periods",
                principalColumn: "Id");
        }
    }
}
