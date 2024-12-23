namespace BabyEST.Server.Models;

public class KidActivity
{
	public long Id { get; set; }
	public KidActivityType ActivityType { get; set; }
	public DateTime StartDate { get; set; }
	public DateTime EndDate { get; set; }
	public bool IsActiveNow { get; set; } = false;

	public int KidId { get; set; } // foreign key property
	public Kid Kid { get; set; } = null!;
}
