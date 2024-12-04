using BabyEST.Server.Models;

namespace BabyEST.Server.DTOs;

internal record class KidDto
{
	public string Name { get; set; } = null!;
	public DateOnly BirthDate { get; set; }
	public ICollection<KidActivityDto> Activities { get; set; } = [];
	public ICollection<string> Parents { get; set; } = null!;

	public KidDto() { }

	public KidDto(Kid kid)
	{
		(Name, BirthDate) = (kid.Name, kid.BirthDate);
		foreach (var parent in kid.Parents)
		{
			Parents.Add(parent.Email);
		}
		foreach (var activity in kid.Activities)
		{
			Activities.Add(new KidActivityDto(activity));
		}
		//foreach (var activity in kid.Activities)
		//{
		//	Activities.Add(new KidActivityDto(activity));
		//}
	}
}
