using backend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260723000000_NormalizeUserEmailsAndProtectResetTokens")]
public sealed class NormalizeUserEmailsAndProtectResetTokens : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "NormalizedEmail",
            table: "Users",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "SessionVersion",
            table: "Users",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.Sql(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT LOWER(BTRIM("Email"))
                    FROM "Users"
                    GROUP BY LOWER(BTRIM("Email"))
                    HAVING COUNT(*) > 1
                ) THEN
                    RAISE EXCEPTION 'Cannot normalize user emails: case-insensitive duplicates exist.';
                END IF;
            END $$;
            """);

        migrationBuilder.Sql(
            """
            UPDATE "Users"
            SET "Email" = LOWER(BTRIM("Email")),
                "NormalizedEmail" = LOWER(BTRIM("Email"));
            """);

        migrationBuilder.AlterColumn<string>(
            name: "NormalizedEmail",
            table: "Users",
            type: "text",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);

        migrationBuilder.DropIndex(
            name: "IX_Users_Email",
            table: "Users");

        migrationBuilder.CreateIndex(
            name: "IX_Users_NormalizedEmail",
            table: "Users",
            column: "NormalizedEmail",
            unique: true);

        migrationBuilder.Sql(
            """
            WITH ranked AS (
                SELECT "Id",
                       ROW_NUMBER() OVER (
                           PARTITION BY "UserId"
                           ORDER BY "CreatedAt" DESC, "Id" DESC
                       ) AS position
                FROM "PasswordResetTokens"
                WHERE "UsedAt" IS NULL
            )
            UPDATE "PasswordResetTokens" AS token
            SET "UsedAt" = NOW()
            FROM ranked
            WHERE token."Id" = ranked."Id"
              AND ranked.position > 1;
            """);

        migrationBuilder.DropIndex(
            name: "IX_PasswordResetTokens_UserId",
            table: "PasswordResetTokens");

        migrationBuilder.CreateIndex(
            name: "IX_PasswordResetTokens_UserId",
            table: "PasswordResetTokens",
            column: "UserId",
            unique: true,
            filter: "\"UsedAt\" IS NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Users_NormalizedEmail",
            table: "Users");

        migrationBuilder.DropIndex(
            name: "IX_PasswordResetTokens_UserId",
            table: "PasswordResetTokens");

        migrationBuilder.CreateIndex(
            name: "IX_PasswordResetTokens_UserId",
            table: "PasswordResetTokens",
            column: "UserId");

        migrationBuilder.DropColumn(
            name: "SessionVersion",
            table: "Users");

        migrationBuilder.DropColumn(
            name: "NormalizedEmail",
            table: "Users");

        migrationBuilder.CreateIndex(
            name: "IX_Users_Email",
            table: "Users",
            column: "Email",
            unique: true);
    }
}
