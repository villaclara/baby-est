using BabyEST.Server.Models;

namespace BabyEST.Server.DTOs;

internal record class KidDto
{
	public string Name { get; set; } = null!;
	public DateOnly BirthDate { get; set; }
	public ICollection<KidActivityDto> Activities { get; set; } = [];
	public string UserName { get; set; } = null!;

	public KidDto() { }

	public KidDto(Kid kid)
	{
		//(Name, BirthDate, UserName) = (kid.Name, kid.BirthDate, kid.Parents.Email);
		//foreach (var activity in kid.Activities)
		//{
		//	Activities.Add(new KidActivityDto(activity));
		//}
	}
}
