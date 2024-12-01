namespace BabyEST.Server.Models;

internal record class Parent
{
	public Guid Id { get; set; }
	public string Email { get; set; }
	public string PasswordHash { get; set; }

	public ICollection<Kid> Kids { get; set; } // many to many
}
