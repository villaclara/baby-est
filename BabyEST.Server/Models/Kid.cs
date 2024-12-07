namespace BabyEST.Server.Models;

public class Kid
{
	public int Id { get; set; }
	public string Name { get; set; } = null!;
	public DateOnly BirthDate { get; set; }
	public ICollection<KidActivity> Activities { get; set; } = [];

	public ICollection<Parent> Parents { get; set; } = []; // many to many
}
