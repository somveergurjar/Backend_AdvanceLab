using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdvanceLab.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceItemDiscount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DiscountPercent",
                table: "ServiceItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OfferBadgeText",
                table: "ServiceItems",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountPercent",
                table: "ServiceItems");

            migrationBuilder.DropColumn(
                name: "OfferBadgeText",
                table: "ServiceItems");
        }
    }
}
