using System.Net;
using System.Net.Http.Json;
using ApiTests.IntegrationTests.Helpers;
using BabyEST.Server.DTOs;

namespace ApiTests.IntegrationTests.EndpointTests;

public class KidEndpointTests : IClassFixture<TestWebApplicationFactory<Program>>
{
	private readonly TestWebApplicationFactory<Program> _factory;
	private readonly HttpClient _client;

	private readonly string _url = "api/kid";

	public KidEndpointTests(TestWebApplicationFactory<Program> factory)
	{
		_factory = factory;
		_client = _factory.CreateClient();
	}

	[Theory]
	[InlineData("test1@test.com", "password", 2)]
	[InlineData("test2@test.com", "password", 0)]
	public async Task GetAllKidsForCurrentParent_Return200(string email, string password, int expectedAmount)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var response = await _client.GetAsync(_url);

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<List<KidDto>>();

		Assert.NotNull(content);
		Assert.Equal(expectedAmount, content.Count);

	}

	[Theory]
	[InlineData("test1@test.com", "password", 10)]
	[InlineData("test2@test.com", "password", 100)]
	public async Task GetKidById_WrongId_Return400(string email, string password, int kidId)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var response = await _client.GetAsync(_url + "/" + kidId);

		// Assert
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
	}



	[Theory]
	[InlineData("test1@test.com", "password", 1, "kid1Parent1", "2021-01-01")]
	[InlineData("test3@test.com", "password", 4, "kid4Parent3", "2024-04-04")]
	public async Task GetKidById_CorrectId_Return200(string email, string password, int kidId, string expectedKidName, string expectedBirthDate)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var response = await _client.GetAsync(_url + "/" + kidId);

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<KidDto>();

		Assert.NotNull(content);
		Assert.Equal(expectedKidName, content.Name);
		Assert.Equal(expectedBirthDate, content.BirthDate);

	}


}
