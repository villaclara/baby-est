namespace BabyEST.Server.Models;

internal class Kid
{
	public int Id { get; set; }
	public string Name { get; set; } = null!;
	public DateOnly BirthDate { get; set; }
	public ICollection<KidActivity> Activities { get; set; } = null!;

	public int UserId { get; set; }
	public User User { get; set; } = null!;
}
