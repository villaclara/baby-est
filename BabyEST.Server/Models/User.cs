namespace BabyEST.Server.Models;

internal record class User
{
	public Guid Id { get; set; }
	public required string Email { get; set; }
	public required string PasswordHash { get; set; }

	public ICollection<Kid> Kids { get; set; }
}
