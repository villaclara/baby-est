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


	#region GET method

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
	[InlineData("test1@test.com", "password", 4)]   // kid does not belong to parent
	[InlineData("test2@test.com", "password", 100)] // non-existing kidId
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



	#endregion GET method

	#region POST method

	[Theory]
	[InlineData("test1@test.com", "password", "newKidParent1", "2025-01-01")]
	public async Task AddKid_ValidValues_Return201(string email, string password, string kidName, string birthDate)
	{
		// Arrange 
		var kidDto = new KidDto()
		{
			Name = kidName,
			BirthDate = birthDate
		};
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act + Assert
		var response = await _client.PostAsJsonAsync<KidDto>(_url, kidDto);
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.Created, response.StatusCode);
		Assert.NotNull(response.Headers.Location);

		var kidUrl = response.Headers.Location.ToString();
		var kidFromApi = await _client.GetAsync(kidUrl);

		Assert.Equal(HttpStatusCode.OK, kidFromApi.StatusCode);

		var content = await kidFromApi.Content.ReadFromJsonAsync<KidDto>();

		Assert.NotNull(content);
		Assert.Equal(kidName, content.Name);
		Assert.Equal(birthDate, content.BirthDate);

	}


	[Theory]
	[InlineData("test1@test.com", "password", "birthdate")]
	[InlineData("test1@test.com", "password", "20-10-10")]
	public async Task AddKid_WrongBirthdate_Return400(string email, string password, string wrongBd)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();
		var kidDto = new KidDto()
		{
			Name = "testkidWrongBd",
			BirthDate = wrongBd
		};
		var errMessage = "Error when adding kid to parent.";
		// Act 
		var response = await _client.PostAsJsonAsync(_url, kidDto);

		// Assert
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<string>();

		Assert.Equal(errMessage, content);

	}


	#endregion POST method

	#region PUT method

	[Theory]
	[InlineData("test1@test.com", "password", 1, "updatedKid1", null)]
	[InlineData("test1@test.com", "password", 1, null, "2025-02-02")]
	public async Task UpdateKid_ValidValues_Return201(string email, string password, int kidId, string? newName = null, string? newBirth = null)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();
		var kid = await _client.GetFromJsonAsync<KidDto>($"api/kid/{kidId}");


		// Act + Assert
		Assert.NotNull(kid);
		kid.Name = newName ?? kid.Name;
		kid.BirthDate = newBirth ?? kid.BirthDate;

		var response = await _client.PutAsJsonAsync<KidDto>(_url + $"/{kidId}", kid);
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.Created, response.StatusCode);
		Assert.NotNull(response.Headers.Location);

		var kidUrl = response.Headers.Location.ToString();
		var kidFromApi = await _client.GetAsync(kidUrl);

		Assert.Equal(HttpStatusCode.OK, kidFromApi.StatusCode);

		var content = await kidFromApi.Content.ReadFromJsonAsync<KidDto>();

		Assert.NotNull(content);
		Assert.Equal(newName is not null ? newName : kid.Name, content.Name);
		Assert.Equal(newBirth is not null ? newBirth : kid.BirthDate, content.BirthDate);

	}

	[Theory]
	[InlineData("test1@test.com", "password", 1, null, "20-02-02")]
	public async Task UpdateKid_WrongValues_Return400(string email, string password, int kidId, string? newName = null, string? newBirth = null)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();
		var kid = await _client.GetFromJsonAsync<KidDto>($"api/kid/{kidId}");

		// Act + Assert
		Assert.NotNull(kid);
		var oldBirthDate = kid.BirthDate;
		var oldName = kid.Name;
		kid.Name = newName ?? kid.Name;
		kid.BirthDate = newBirth ?? kid.BirthDate;

		var response = await _client.PutAsJsonAsync<KidDto>(_url + $"/{kidId}", kid);
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

		var kidFromApi = await _client.GetAsync($"api/kid/{kidId}");

		Assert.Equal(HttpStatusCode.OK, kidFromApi.StatusCode);

		var content = await kidFromApi.Content.ReadFromJsonAsync<KidDto>();

		Assert.NotNull(content);
		Assert.Equal(oldName, content.Name);           // name was not changed
		Assert.Equal(oldBirthDate, content.BirthDate); // birthdate was not changed

	}

	#endregion PUT method

	#region DEL method

	[Theory]
	[InlineData("test1@test.com", "password", 2)]
	public async Task RemoveKid_ValidId_Return204(string email, string password, int kidId)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act + Assert
		var response = await _client.DeleteAsync(_url + $"/{kidId}");
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

	}

	[Theory]
	[InlineData("test1@test.com", "password", 200)]
	public async Task RemoveKid_WrongId_Return400(string email, string password, int kidId)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();
		var errMessage = "Kid not found, maybe already removed.";

		// Act + Assert
		var response = await _client.DeleteAsync(_url + $"/{kidId}");
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<string>();
		Assert.Equal(errMessage, content);

	}

	#endregion DEL method
}
