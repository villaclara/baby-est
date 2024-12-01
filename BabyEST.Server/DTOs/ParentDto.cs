using BabyEST.Server.Models;

namespace BabyEST.Server.DTOs;

internal record class ParentDto
{
	public required Guid Id { get; set; }
	public required string Email { get; set; }
	public required string Password { get; set; }

	public ICollection<KidDto> Kids { get; set; } = [];

	public ParentDto() { }
	public ParentDto(Parent user)
	{
		Email = user.Email;
		foreach (var kid in user.Kids)
		{
			Kids.Add(new KidDto(kid));
		}
	}
}
