using System.Security.Claims;
using BabyEST.Server.Database;
using BabyEST.Server.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

namespace BabyEST.Server.EndPoints;

public static class ParentEndpoints
{
	public static RouteGroupBuilder MapUserEndpoints(this RouteGroupBuilder builder)
	{
		builder.MapPost("/login", LoginAsync);

		builder.MapGet("/logout", LogoutAsync).RequireAuthorization();

		builder.MapPost("/register", RegisterUserAsync);

		return builder;
	}

	private static async Task<IResult> RegisterUserAsync([FromBody] UserFormModel userDto, ApplicationDbContext appcontext, HttpContext httpcontext)
	{
		Console.WriteLine($"new user - {userDto.Email}, {userDto.Password}");
		// check if the user is not already created
		var existingUser = appcontext.Parents.Where(u => u.Email == userDto.Email).FirstOrDefault();
		if (existingUser is not null)
		{
			return TypedResults.BadRequest("Username is already taken.");
		}

		var userToAdd = new Parent()
		{
			Email = userDto.Email,
			PasswordHash = userDto.Password,
			Kids = []
		};

		appcontext.Parents.Add(userToAdd);
		await appcontext.SaveChangesAsync();

		var claim = new Claim(ClaimTypes.Name, userToAdd.Email);
		List<Claim> claims = [claim];
		var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
		var claimsPrincipal = new ClaimsPrincipal(identity);

		await httpcontext.SignInAsync(claimsPrincipal);

		return TypedResults.Ok();
	}

	private static async Task<IResult> LoginAsync([FromBody] UserFormModel userDto, ApplicationDbContext appcontext, HttpContext httpcontext)
	{
		Console.WriteLine($"login async.");
		var user = appcontext.Parents.Where(u => u.Email == userDto.Email).FirstOrDefault();

		if (user is null)
		{

			return TypedResults.BadRequest("User not found.");
		}

		var claim = new Claim("auth", user.Email);
		List<Claim> claims = [claim];
		var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
		var claimsPrincipal = new ClaimsPrincipal(identity);

		await httpcontext.SignInAsync(claimsPrincipal);

		return TypedResults.Ok("Logged in.");
	}

	private static async Task<IResult> LogoutAsync(ApplicationDbContext ctx, HttpContext httpcontext)
	{
		Console.WriteLine("Logout async.");
		await httpcontext.SignOutAsync();
		return TypedResults.Ok("logged out.");
	}

	public class UserFormModel
	{
		public string Email { get; set; }
		public string Password { get; set; }
	}
}
