using BabyEST.Server.Models;

namespace BabyEST.Server.DTOs;

public record class ParentDto
{
	public int Id { get; set; }
	public string Email { get; set; } = "";
	public ICollection<(int, string)> Kids { get; set; } = [];

	public ParentDto() { }
	public ParentDto(Parent user)
	{
		Id = user.Id;
		Email = user.Email;
		foreach (var kid in user.Kids)
		{
			Kids.Add((kid.Id, kid.Name));
		}
	}
}
