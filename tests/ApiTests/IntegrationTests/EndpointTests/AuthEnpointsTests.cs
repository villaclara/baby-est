﻿using System.Net;
using System.Net.Http.Json;
using ApiTests.IntegrationTests.Helpers;

namespace ApiTests.IntegrationTests.EndpointTests;

public class AuthEnpointsTests : IClassFixture<TestWebApplicationFactory<Program>>
{
	private readonly TestWebApplicationFactory<Program> _factory;
	private readonly HttpClient _client;

	private readonly string _url = "auth";

	public AuthEnpointsTests(TestWebApplicationFactory<Program> factory)
	{
		_factory = factory;
		_client = _factory.CreateClient();
	}

	[Theory]
	[InlineData("test1@test.com", "password")]
	[InlineData("test2@test.com", "pwd")]
	public async Task Register_UsernameAlreadyTaken_Return400(string email, string password)
	{
		// Arrange 
		var userForm = new { Email = email, Password = password };
		var errMessage = "Username is already taken.";


		// Act + Assert
		var response = await _client.PostAsJsonAsync(_url + "/register", userForm);
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);


		var content = await response.Content.ReadFromJsonAsync<string>();
		Assert.NotNull(content);
		Assert.Equal(errMessage, content);
	}

	[Theory]
	[InlineData("noAt.com", "pwd")]
	[InlineData("noDot@com", "pwd")]
	[InlineData("wrongdomain@123.123", "pwd")]
	public async Task Register_WrongEmailType_Return400(string email, string password)
	{
		// Arrange 
		var userForm = new { Email = email, Password = password };
		var errMessage = "Email provided was in incorrect format.";


		// Act + Assert
		var response = await _client.PostAsJsonAsync(_url + "/register", userForm);
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);


		var content = await response.Content.ReadFromJsonAsync<string>();
		Assert.NotNull(content);
		Assert.Equal(errMessage, content);
	}

	[Theory]
	[InlineData("test10@test.com", "password")]
	public async Task Register_ValidCreds_Return200(string email, string password)
	{
		// Arrange 
		var userForm = new { Email = email, Password = password };
		var errMessage = "Register completed.";


		// Act + Assert
		var response = await _client.PostAsJsonAsync(_url + "/register", userForm);
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);


		var content = await response.Content.ReadFromJsonAsync<string>();
		Assert.NotNull(content);
		Assert.Equal(errMessage, content);
	}



	[Theory]
	[InlineData("test1@test.com", "wrongpassword")]
	[InlineData("wrongemail@test.com", "password")]
	public async Task Login_WrongCreds_Return400(string email, string password)
	{
		// Arrange 
		var userForm = new { Email = email, Password = password };
		var errMessage = "Incorret login or password.";


		// Act + Assert
		var response = await _client.PostAsJsonAsync(_url + "/login", userForm);
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);


		var content = await response.Content.ReadFromJsonAsync<string>();
		Assert.NotNull(content);
		Assert.Equal(errMessage, content);
	}

	[Theory]
	[InlineData("test1@test.com", "password")]
	[InlineData("test2@test.com", "password")]
	public async Task Login_ValidCreds_Return200(string email, string password)
	{
		// Arrange 
		var userForm = new { Email = email, Password = password };
		var message = "Logged in.";


		// Act + Assert
		var response = await _client.PostAsJsonAsync(_url + "/login", userForm);
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);


		var content = await response.Content.ReadFromJsonAsync<string>();
		Assert.NotNull(content);
		Assert.Equal(message, content);
	}

	[Fact]
	public async Task Logout_Return200()
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync(_url + "/login", new { Email = "test3@test.com", Password = "password" });
		login.EnsureSuccessStatusCode();
		var message = "Logged out.";

		// Act 
		var response = await _client.GetAsync(_url + "/logout");

		// Assert
		Assert.True(response.IsSuccessStatusCode);
		var content = await response.Content.ReadFromJsonAsync<string>();
		Assert.NotNull(content);
		Assert.Equal(message, content);
	}

	[Fact]
	public async Task Logout_WithoutLogin_Return200()
	{
		// Arrange 

		// Act 
		var response = await _client.GetAsync(_url + "/logout");

		// Assert
		Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
	}


	[Theory]
	[InlineData("test1@test.com", "kid2Parent2", "2022-02-02")]
	[InlineData("test2@test.com", "", "")]
	public async Task ValidateUser_ValidCreds_Return200(string email, string? kidname, string? strKidBirth)
	{
		// Arrange
		bool isparsed = DateOnly.TryParse(strKidBirth, out DateOnly kidBirth);
		if (!isparsed)
		{
			kidBirth = DateOnly.FromDateTime(DateTime.Now);
		}
		var validationForm = new { Email = email, KidName = kidname, Birth = kidBirth };

		// Act
		var response = await _client.PostAsJsonAsync(_url + "/validateuser", validationForm);
		Assert.True(response.IsSuccessStatusCode);
		var content = await response.Content.ReadFromJsonAsync<int>();

		// Assert
		Assert.NotEqual(0, content);
	}

	[Theory]
	[InlineData("test1@test.com", "kid2Parent23", "2022-02-02")]    // wrong kidname
	[InlineData("test111@test.com", "", "")]                        // wrong email
	[InlineData("test1@test.com", "kid2Parent", "2025-02-02")]      // wrong kidBirth
	public async Task ValidateUser_WrongCreds_Return400(string email, string? kidname, string? strKidBirth)
	{
		// Arrange
		bool isparsed = DateOnly.TryParse(strKidBirth, out DateOnly kidBirth);
		if (!isparsed)
		{
			kidBirth = DateOnly.FromDateTime(DateTime.Now);
		}
		var validationForm = new { Email = email, KidName = kidname, Birth = kidBirth };

		// Act
		var response = await _client.PostAsJsonAsync(_url + "/validateuser", validationForm);

		// Assert
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
	}

	[Theory]
	[InlineData("test1@test.com", "kid2Parent2", "2022-02-02", "newpassword")]
	[InlineData("test2@test.com", "", "", "newpassword2")]
	public async Task ChangePassword_ValidSecret_Return200(string email, string? kidname, string? strKidBirth, string newPwd)
	{
		// Arrange
		bool isparsed = DateOnly.TryParse(strKidBirth, out DateOnly kidBirth);
		if (!isparsed)
		{
			kidBirth = DateOnly.FromDateTime(DateTime.Now);
		}
		var validationForm = new { Email = email, KidName = kidname, Birth = kidBirth };

		// Act + Assert
		var response = await _client.PostAsJsonAsync(_url + "/validateuser", validationForm);
		Assert.True(response.IsSuccessStatusCode);

		var content = await response.Content.ReadFromJsonAsync<int>();
		Assert.NotEqual(0, content);

		var changePasswordForm = new { Secret = content, Email = email, Password = newPwd };

		var response2 = await _client.PostAsJsonAsync(_url + "/setpassword", changePasswordForm);
		Assert.True(response2.IsSuccessStatusCode);
	}

	[Theory]
	[InlineData("test1@test.com", "kid2Parent2", "2022-02-02", "newpassword")]
	[InlineData("test2@test.com", "", "", "newpassword2")]
	public async Task ChangePassword_WrongSecret_Return200(string email, string? kidname, string? strKidBirth, string newPwd)
	{
		// Arrange
		bool isparsed = DateOnly.TryParse(strKidBirth, out DateOnly kidBirth);
		if (!isparsed)
		{
			kidBirth = DateOnly.FromDateTime(DateTime.Now);
		}
		var validationForm = new { Email = email, KidName = kidname, Birth = kidBirth };

		// Act + Assert
		var response = await _client.PostAsJsonAsync(_url + "/validateuser", validationForm);
		Assert.True(response.IsSuccessStatusCode);

		var content = await response.Content.ReadFromJsonAsync<int>();
		content++;
		Assert.NotEqual(0, content);

		var changePasswordForm = new { Secret = content, Email = email, Password = newPwd };

		var response2 = await _client.PostAsJsonAsync(_url + "/setpassword", changePasswordForm);
		Assert.Equal(HttpStatusCode.BadRequest, response2.StatusCode);
	}
}
