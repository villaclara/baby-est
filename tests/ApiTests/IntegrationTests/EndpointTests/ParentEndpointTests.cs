using System.Net;
using System.Net.Http.Json;
using ApiTests.IntegrationTests.Helpers;
using BabyEST.Server.DTOs;
using Microsoft.AspNetCore.Http;

namespace ApiTests.IntegrationTests.EndpointTests;

public class ParentEndpointTests : IClassFixture<TestWebApplicationFactory<Program>>
{
	private readonly TestWebApplicationFactory<Program> _factory;
	private readonly HttpClient _client;

	private readonly string _url = "api/parent";

	public ParentEndpointTests(TestWebApplicationFactory<Program> factory)
	{
		_factory = factory;
		_client = _factory.CreateClient();
	}

	[Fact]
	public async Task GetKidsFormParent_Return200()
	{
		// Arrange
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = "test1@test.com", Password = "password" });
		login.EnsureSuccessStatusCode();

		// Act
		var response = await _client.GetAsync(_url + "/kids");

		// Assert
		Assert.NotNull(response);
		Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
		var content = await response.Content.ReadFromJsonAsync<ParentDto>();
		Assert.NotNull(content);
		Assert.NotNull(content.Kids);
		Assert.Equal(2, content.Kids.Count);

	}



	[Theory]
	[InlineData(1, "wrongemail@test.com")]  // incorrect parentEmail
	[InlineData(9999, "test2@test.com")]    // incorrect KidId
	[InlineData(100, "wrongEmail")]         // incorrect both
	public async Task AddNewParentToKid_WithIncorrectParams_Return400(int kId, string email)
	{
		// Arrange
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = "test1@test.com", Password = "password" });
		login.EnsureSuccessStatusCode();

		var errMessage = "No parents found with email.";
		var errMessage2 = "Kid does not belong to parent.";

		// Act
		var response = await _client.PostAsJsonAsync(_url + "/addparent", new { kidId = kId, pEmail = email });
		var content = await response.Content.ReadFromJsonAsync<string>();


		// Assert
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
		Assert.NotNull(content);
		Assert.True(content == errMessage || content == errMessage2);
	}

	[Theory]
	[InlineData(2, "test2@test.com")]
	public async Task AddNewParentToKid_Return200(int kId, string pEmail)
	{
		// Arrange
		var currentParentEmail = "test1@test.com";
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = currentParentEmail, Password = "password" });
		login.EnsureSuccessStatusCode();
		string[] shouldBeParentsOfKid = [currentParentEmail, pEmail];
		var formData = new { kidId = kId, pEmail = pEmail };

		var responseMessage = "Parent added to kid.";

		// Act + Assert
		var response = await _client.PostAsJsonAsync(_url + "/addparent", formData);

		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<string>();

		Assert.Equal(responseMessage, content);

		// Assert that the new parent is really added to kid.
		var response2 = await _client.GetAsync(_url + "/kids");
		var content2 = await response2.Content.ReadFromJsonAsync<ParentDto>();

		Assert.NotNull(content2);

		var parentsOfKid = content2.Kids.FirstOrDefault(k => k.KidId == kId);

		Assert.NotNull(parentsOfKid);
		Assert.NotEmpty(parentsOfKid.Parents);
		foreach (var email in parentsOfKid.Parents)
		{
			Assert.Contains("test1@test.com", shouldBeParentsOfKid);
		}
	}

}
