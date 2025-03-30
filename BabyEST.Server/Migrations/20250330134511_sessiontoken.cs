using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BabyEST.Server.Migrations
{
	/// <inheritdoc />
	public partial class sessiontoken : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{


			migrationBuilder.CreateTable(
				name: "SessionTokens",
				columns: table => new
				{
					UserId = table.Column<int>(type: "INTEGER", nullable: false)
						.Annotation("Sqlite:Autoincrement", true),
					Token = table.Column<string>(type: "TEXT", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_SessionTokens", x => x.UserId);
				});


		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{

		}
	}
}
