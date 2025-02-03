using System.Net;
using System.Net.Http.Json;
using ApiTests.IntegrationTests.Helpers;
using BabyEST.Server.DTOs;

namespace ApiTests.IntegrationTests.EndpointTests;

public class KidActivityEndpointTests : IClassFixture<TestWebApplicationFactory<Program>>
{
	private readonly TestWebApplicationFactory<Program> _factory;
	private readonly HttpClient _client;

	private readonly string _url = "api/kid";

	public KidActivityEndpointTests(TestWebApplicationFactory<Program> factory)
	{
		_factory = factory;
		_client = _factory.CreateClient();
	}

	#region GET method

	[Theory]
	[InlineData("test1@test.com", "password", 1, 2)]
	[InlineData("test1@test.com", "password", 2, 0)]
	public async Task GetAllActivitiesForKid_Return200(string email, string password, int kidId, int expectedAmount)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var response = await _client.GetAsync(_url + $"/{kidId}/activity");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<List<KidActivityDto>>();

		Assert.NotNull(content);
		Assert.Equal(expectedAmount, content.Count);

	}

	[Theory]
	[InlineData("test1@test.com", "password", 1, 1, 1)]
	[InlineData("test1@test.com", "password", 2, 10, 0)]
	[InlineData("test1@test.com", "password", 2, -10, 0)]
	public async Task GetAllActivitiesForKid_WithLastValue_Return200(string email, string password, int kidId, int lastValue, int expectedAmount)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var response = await _client.GetAsync(_url + $"/{kidId}/activity?last={lastValue}");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<List<KidActivityDto>>();

		Assert.NotNull(content);
		Assert.Equal(expectedAmount, content.Count);

	}


	[Theory]
	[InlineData("test1@test.com", "password", 3)]
	[InlineData("test1@test.com", "password", -1)]
	public async Task GetAllActivitiesForKid_WrongKidId_Return400(string email, string password, int kidId)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();
		var errMessage = "Kid with provided Id not found or you are not parent.";

		// Act 
		var response = await _client.GetAsync(_url + $"/{kidId}/activity");

		// Assert
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<string>();

		Assert.NotNull(content);
		Assert.Equal(errMessage, content);

	}


	#endregion

	#region POST method

	#endregion

	#region PUT method 

	#endregion

	#region DEL method 

	#endregion

}
