using BabyEST.Server.Models;

namespace BabyEST.Server.DTOs;

public record class ParentDto
{
	public int Id { get; set; }
	public string Email { get; set; } = "";
	public ICollection<KidSimple> Kids { get; set; } = [];

	public ParentDto() { }
	public ParentDto(Parent user)
	{
		Id = user.Id;
		Email = user.Email;
		foreach (var kid in user.Kids)
		{
			var parentsList = new List<string>();
			foreach (var parent in kid.Parents)
			{
				parentsList.Add(parent.Email);
			}
			Kids.Add(new(kid.Id, kid.Name, parentsList));
		}
	}

	public record KidSimple(int KidId, string KidName, List<string> Parents);
}
