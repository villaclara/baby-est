using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BabyEST.Server.Migrations
{
    /// <inheritdoc />
    public partial class addedIsActiveToActivities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActiveNow",
                table: "KidActivities",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActiveNow",
                table: "KidActivities");
        }
    }
}
