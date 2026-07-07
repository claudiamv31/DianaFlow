using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    [Migration("20260707000000_AddDatabaseUsageIndexes")]
    public partial class AddDatabaseUsageIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_PhaseMessages_Phase_MessageType",
                table: "PhaseMessages",
                columns: new[] { "Phase", "MessageType" });

            migrationBuilder.CreateIndex(
                name: "IX_PeriodDays_Date",
                table: "PeriodDays",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_PeriodDays_PeriodId_Date",
                table: "PeriodDays",
                columns: new[] { "PeriodId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_Periods_UserId_EndDate",
                table: "Periods",
                columns: new[] { "UserId", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Periods_UserId_StartDate",
                table: "Periods",
                columns: new[] { "UserId", "StartDate" });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId_IsRevoked",
                table: "RefreshTokens",
                columns: new[] { "UserId", "IsRevoked" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PhaseMessages_Phase_MessageType",
                table: "PhaseMessages");

            migrationBuilder.DropIndex(
                name: "IX_PeriodDays_Date",
                table: "PeriodDays");

            migrationBuilder.DropIndex(
                name: "IX_PeriodDays_PeriodId_Date",
                table: "PeriodDays");

            migrationBuilder.DropIndex(
                name: "IX_Periods_UserId_EndDate",
                table: "Periods");

            migrationBuilder.DropIndex(
                name: "IX_Periods_UserId_StartDate",
                table: "Periods");

            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_UserId_IsRevoked",
                table: "RefreshTokens");
        }
    }
}
