using BabyEST.Server.Models;

namespace BabyEST.Server.DTOs;

internal record class KidDto
{
	public string Name { get; set; } = null!;
	public string BirthDate { get; set; }
	public ICollection<KidActivityDto> Activities { get; set; } = [];
	public ICollection<string> Parents { get; set; } = [];

	public KidDto() { }

	public KidDto(Kid kid)
	{
		Name = kid.Name;
		BirthDate = kid.BirthDate.ToString("yyyy-MM-dd");
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
