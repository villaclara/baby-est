namespace BabyEST.Server.Models;

internal class KidActivity
{
	public long Id { get; set; }
	public KidActivityType ActivityType { get; set; }
	public DateTime StartDate { get; set; }
	public DateTime EndDate { get; set; }

	public int KidId { get; set; }
	public Kid Kid { get; set; } = null!;
}
