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
	[InlineData("test1@test.com", "password", 1)]
	[InlineData("test2@test.com", "password", 0)]
	public async Task GetKidById_WrongId_Return400(string email, string password, int kidId)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var response = await _client.GetAsync(_url + "/" + kidId);

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<List<KidDto>>();

		Assert.NotNull(content);
		Assert.Equal(expectedAmount, content.Count);

	}


	public static IEnumerable<KidDto> GetKidDtos(int number)
	{

		List<KidDto> list = [
			new KidDto()
			{
				Name = "kid1",
				Activities = [],
				BirthDate = new DateOnly(2020, 1, 1).ToString(),
				Parents = [
					"test1@test.com"
					]
			},
			new KidDto()
			{
				Name = "kid2",
				Activities = [],
				BirthDate = new DateOnly(2020, 1, 1).ToString(),
				Parents = [
					"test1@test.com"
					]
			}

		];


		return list.Take(number);

	}
}
