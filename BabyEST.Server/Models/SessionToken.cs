namespace BabyEST.Server.Models;

public class SessionToken
{
	public int UserId { get; set; }
	public string Token { get; set; } = null!;
}
