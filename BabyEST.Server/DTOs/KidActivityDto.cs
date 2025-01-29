using BabyEST.Server.Models;

namespace BabyEST.Server.DTOs;

public record class KidActivityDto
{
	public long Id { get; set; }
	public string ActivityType { get; set; } = null!;
	public DateTime StartDate { get; set; } = DateTime.MinValue;
	public DateTime EndDate { get; set; } = DateTime.MinValue;
	public bool IsActiveNow { get; set; } = false;

	public string KidName { get; set; } = null!;

	public KidActivityDto() { }

	public KidActivityDto(KidActivity kidActivity) =>
		(Id, ActivityType, StartDate, EndDate, IsActiveNow, KidName) =
		(kidActivity.Id, kidActivity.ActivityType.ToString(), kidActivity.StartDate.ToLocalTime(), kidActivity.EndDate.ToLocalTime(), kidActivity.IsActiveNow, kidActivity.Kid.Name);

}
