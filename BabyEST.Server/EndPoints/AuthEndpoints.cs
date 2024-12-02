using System.Security.Claims;
using BabyEST.Server.Database;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using BC = BCrypt.Net.BCrypt;

namespace BabyEST.Server.EndPoints;

public static class AuthEndpoints
{
	public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder builder)
	{
		builder.MapPost("/login", LoginAsync);

		builder.MapGet("/logout", LogoutAsync).RequireAuthorization();

		builder.MapPost("/register", RegisterAsync);

		return builder;
	}

	private static async Task<IResult> RegisterAsync([FromBody] UserFormModel userForm, ApplicationDbContext appcontext, HttpContext httpcontext)
	{
		try
		{
			Log.Information("{@Method} - Try register new user ({@user}).", nameof(RegisterAsync), userForm);

			// check if the user is not already created
			var user = appcontext.Parents.Where(u => u.Email == userForm.Email).FirstOrDefault();
			if (user is not null)
			{
				return TypedResults.BadRequest("Username is already taken.");
			}

			user = new()
			{
				Email = userForm.Email,
				PasswordHash = BC.HashPassword(userForm.Password),
				Kids = []
			};

			appcontext.Parents.Add(user);
			await appcontext.SaveChangesAsync();

			var claim = new Claim(ClaimTypes.Name, user.Email);
			List<Claim> claims = [claim];
			var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
			var claimsPrincipal = new ClaimsPrincipal(identity);

			await httpcontext.SignInAsync(claimsPrincipal);

			return TypedResults.Ok("Register completed.");
		}
		catch (Exception ex)
		{
			Log.Error("{@Method} - Error({@er}).", nameof(RegisterAsync), ex);
			return TypedResults.StatusCode(500);
		}

	}

	private static async Task<IResult> LoginAsync([FromBody] UserFormModel userForm, ApplicationDbContext appcontext, HttpContext httpcontext)
	{
		Log.Information("{@Method} - Try login with user ({@user}).", nameof(LoginAsync), userForm.Email);
		try
		{
			var user = appcontext.Parents.Where(u => u.Email == userForm.Email).FirstOrDefault();
			if (user is null || !BC.Verify(userForm.Password, user.PasswordHash))
			{
				Log.Warning("{@Method} - Incorrect login or password returnted.", nameof(LoginAsync));
				return TypedResults.BadRequest("Incorret login or password.");
			}

			var claim = new Claim("auth", user.Email);
			List<Claim> claims = [claim];
			var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
			var claimsPrincipal = new ClaimsPrincipal(identity);

			await httpcontext.SignInAsync(claimsPrincipal);

			return TypedResults.Ok("Logged in.");
		}
		catch (Exception ex)
		{
			Log.Error("{@Method} - Error({@er}).", nameof(LoginAsync), ex);
			return TypedResults.StatusCode(500);
		}
	}

	private static async Task<IResult> LogoutAsync(ApplicationDbContext ctx, HttpContext httpcontext)
	{
		Log.Information("{@Method} - Try logout.", nameof(LogoutAsync));
		try
		{
			await httpcontext.SignOutAsync();
			return TypedResults.Ok("Logged out.");
		}
		catch (Exception ex)
		{
			Log.Error("{@Method} - Error ({@ex}).", nameof(LogoutAsync), ex);
			return TypedResults.StatusCode(500);
		}
	}

	private record UserFormModel(string Email, string Password);
}
