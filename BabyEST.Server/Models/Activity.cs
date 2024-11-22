namespace BabyEST.Server.Models;

internal class Activity
{
	public long Id { get; set; }
	public ActivityType ActivityType { get; set; }
	public DateTime StartDate { get; set; }
	public DateTime EndDate { get; set; }

	public int KidId { get; set; }
	public Kid Kid { get; set; } = null!;
}
