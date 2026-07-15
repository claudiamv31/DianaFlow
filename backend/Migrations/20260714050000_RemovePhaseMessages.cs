using backend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260714050000_RemovePhaseMessages")]
public partial class RemovePhaseMessages : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "PhaseMessages");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "PhaseMessages",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Message = table.Column<string>(type: "text", nullable: true),
                MessageType = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                Phase = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_PhaseMessages", value => value.Id));

        migrationBuilder.CreateIndex(
            name: "IX_PhaseMessages_Phase_MessageType",
            table: "PhaseMessages",
            columns: new[] { "Phase", "MessageType" });
    }
}
