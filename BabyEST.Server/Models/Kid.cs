namespace BabyEST.Server.Models;

public class Kid
{
	public int Id { get; set; }
	public string Name { get; set; } = null!;
	public DateOnly BirthDate { get; set; }
	public ICollection<KidActivity> Activities { get; set; } = null!;

	public ICollection<Parent> Parents { get; set; } = null!; // many to many
}
