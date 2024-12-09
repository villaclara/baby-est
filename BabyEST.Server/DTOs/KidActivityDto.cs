using BabyEST.Server.Models;

namespace BabyEST.Server.DTOs;

internal record class KidActivityDto
{
	public long Id { get; set; }
	public string ActivityType { get; set; } = null!;
	public DateTime StartDate { get; set; } = DateTime.MinValue;
	public DateTime EndDate { get; set; } = DateTime.MinValue;

	public string KidName { get; set; } = null!;

	public KidActivityDto() { }

	public KidActivityDto(KidActivity kidActivity) =>
		(Id, ActivityType, StartDate, EndDate, KidName) = (kidActivity.Id, kidActivity.ActivityType.ToString(), kidActivity.StartDate, kidActivity.EndDate, kidActivity.Kid.Name);

}
