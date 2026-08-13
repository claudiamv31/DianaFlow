using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSymptomTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Symptoms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Icon = table.Column<string>(type: "text", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Symptoms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserSymptomEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SymptomId = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSymptomEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSymptomEntries_Symptoms_SymptomId",
                        column: x => x.SymptomId,
                        principalTable: "Symptoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserSymptomEntries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Symptoms_Code",
                table: "Symptoms",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSymptomEntries_SymptomId",
                table: "UserSymptomEntries",
                column: "SymptomId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSymptomEntries_UserId_Date",
                table: "UserSymptomEntries",
                columns: new[] { "UserId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_UserSymptomEntries_UserId_Date_SymptomId",
                table: "UserSymptomEntries",
                columns: new[] { "UserId", "Date", "SymptomId" },
                unique: true);

            migrationBuilder.InsertData(
                table: "Symptoms",
                columns: new[] { "Id", "Code", "Name", "Category", "SortOrder", "IsActive" },
                values: new object[,]
                {
                    { 1, "headache", "Headache", "physical", 1, true },
                    { 2, "cramps", "Cramps", "physical", 2, true },
                    { 3, "bloating", "Bloating", "digestive", 3, true },
                    { 4, "fatigue", "Fatigue", "physical", 4, true },
                    { 5, "nausea", "Nausea", "digestive", 5, true },
                    { 6, "back_pain", "Back pain", "physical", 6, true },
                    { 7, "breast_tenderness", "Breast tenderness", "physical", 7, true },
                    { 8, "mood_changes", "Mood changes", "mood", 8, true },
                    { 9, "acne", "Acne", "physical", 9, true },
                    { 10, "food_cravings", "Food cravings", "digestive", 10, true },
                    { 11, "insomnia", "Insomnia", "sleep", 11, true },
                    { 12, "anxiety", "Anxiety", "mood", 12, true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserSymptomEntries");

            migrationBuilder.DropTable(
                name: "Symptoms");
        }
    }
}
