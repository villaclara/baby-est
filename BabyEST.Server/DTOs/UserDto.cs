using BabyEST.Server.Models;

namespace BabyEST.Server.DTOs;

internal record class UserDto
{
	public required Guid Id { get; set; }
	public required string Email { get; set; }
	public required string Password { get; set; }

	public ICollection<KidDto> Kids { get; set; } = [];

	public UserDto() { }
	public UserDto(User user)
	{
		Email = user.Email;
		foreach (var kid in user.Kids)
		{
			Kids.Add(new KidDto(kid));
		}
	}
}
