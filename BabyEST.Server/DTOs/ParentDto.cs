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
			Kids.Add(new(kid.Id, kid.Name));
		}
	}

	public record KidSimple(int KidId, string KidName);
}
