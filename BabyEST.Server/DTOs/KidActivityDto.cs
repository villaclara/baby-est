using BabyEST.Server.Models;

namespace BabyEST.Server.DTOs;

internal record class KidActivityDto
{
	public long Id { get; set; }
	public KidActivityType ActivityType { get; set; }
	public DateTime StartDate { get; set; }
	public DateTime EndDate { get; set; }

	public string KidName { get; set; } = null!;

	public KidActivityDto() { }

	public KidActivityDto(KidActivity kidActivity) =>
		(Id, ActivityType, StartDate, EndDate, KidName) = (kidActivity.Id, kidActivity.ActivityType, kidActivity.StartDate, kidActivity.EndDate, kidActivity.Kid.Name);

}
