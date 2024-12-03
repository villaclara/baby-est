namespace BabyEST.Server.Models;

public record class Parent
{
	public int Id { get; set; }
	public string Email { get; set; } = null!;
	public string PasswordHash { get; set; } = null!;

	public ICollection<Kid> Kids { get; set; } = []; // many to many
}
