namespace BabyEST.Server.Models;

internal record class User
{
	public required int Id { get; set; }
	public required string Email { get; set; }
	public required string Password { get; set; }
	public string? UserName { get; set; } = string.Empty;

	public ICollection<Kid> Kids { get; set; }
}
