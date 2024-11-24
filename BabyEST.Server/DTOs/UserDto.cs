using BabyEST.Server.DTOs;
using BabyEST.Server.Models;

namespace BabyEST.Server.VMs;

internal record class UserDto
{
	public required int Id { get; set; }
	public required string Email { get; set; }
	public required string Password { get; set; }
	public string? UserName { get; set; } = string.Empty;

	public ICollection<KidDto> Kids { get; set; } = [];

	public UserDto() { }
	public UserDto(User user)
	{
		(Email, UserName) = (user.Email, user.UserName);
		foreach (var kid in user.Kids)
		{
			Kids.Add(new KidDto(kid));
		}
	}
}
