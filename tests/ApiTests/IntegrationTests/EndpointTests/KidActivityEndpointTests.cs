using System.Net;
using System.Net.Http.Json;
using System.Text;
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
	[InlineData("test1@test.com", "password", 1, 2, 0, 0, null, null)]
	[InlineData("test1@test.com", "password", 1, 2, 2, 0, null, null)]
	[InlineData("test1@test.com", "password", 1, 2, 0, 365, null, null)]
	[InlineData("test1@test.com", "password", 1, 2, 0, 0, "2024-02-02", "2025-05-05")]
	[InlineData("test1@test.com", "password", 1, 0, 0, 0, "2024-02-02", null)]
	[InlineData("test1@test.com", "password", 1, 0, 0, 0, null, "2024-02-02")]
	[InlineData("test1@test.com", "password", 1, 0, 0, 0, "asd", "asd")]
	[InlineData("test1@test.com", "password", 1, 2, 2, 1000, "2024-02-02", "2025-04-04")]
	public async Task GetAllActivitiesForKid_WithQueryParams_Return200(string email, string password, int kidId, int expectedAmount,
		int? lastValue, int? forDays, string? fromDate, string? toDate)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		var sb = new StringBuilder();
		sb.Append(_url + $"/{kidId}/activity");

		if (lastValue > 0)
		{
			sb.Append($"?last={lastValue}");
		}
		if (forDays > 0)
		{
			if (sb.ToString().EndsWith("activity"))
			{
				sb.Append($"?forDays={forDays}");
			}
			else
			{
				sb.Append($"&forDays={forDays}");
			}
		}
		if (fromDate is not null)
		{
			if (sb.ToString().EndsWith("activity"))
			{
				sb.Append($"?fromDate={fromDate}");
			}
			else
			{
				sb.Append($"&fromDate={fromDate}");
			}
		}
		if (toDate is not null)
		{
			if (sb.ToString().EndsWith("activity"))
			{
				sb.Append($"?toDate={toDate}");
			}
			else
			{
				sb.Append($"&toDate={toDate}");
			}
		}
		var link = sb.ToString();


		// Act 
		var response = await _client.GetAsync(link);

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

	[Theory]
	[InlineData("test1@test.com", "password", 1, "sleep", 1)]
	[InlineData("test1@test.com", "password", 1, "eat", 2)]
	public async Task GetLastActivityByType_ValidValues_Return200(string email, string password, int kidId, string actType, int expectedActivityId)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var response = await _client.GetAsync(_url + $"/{kidId}/activity/last?actType={actType}");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<KidActivityDto>();

		Assert.NotNull(content);
		Assert.Equal(expectedActivityId, content.Id);

	}

	[Theory]
	[InlineData("test1@test.com", "password", 1, "bruh")] // undefined activity Type
	public async Task GetLastActivityByType_WrongValues_Return404(string email, string password, int kidId, string actType)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();
		var errMessage = $"No last activity for type {actType}";

		// Act 
		var response = await _client.GetAsync(_url + $"/{kidId}/activity/last?actType={actType}");

		// Assert
		Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<string>();

		Assert.NotNull(content);
		Assert.Equal(errMessage, content);

	}

	[Theory]
	[InlineData("test1@test.com", "password", 1, 1, "Sleeping")]
	[InlineData("test1@test.com", "password", 1, 2, "EatingRight")]
	public async Task GetActivity_ValidValue_Return200(string email, string password, int kidId, int actId, string expectedActType)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var response = await _client.GetAsync(_url + $"/{kidId}/activity/{actId}");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<KidActivityDto>();

		Assert.NotNull(content);
		Assert.Equal(expectedActType, content.ActivityType);

	}

	[Theory]
	[InlineData("test1@test.com", "password", 1, 10)]
	[InlineData("test1@test.com", "password", 1, 20)]
	public async Task GetActivity_WrongValue_Return400(string email, string password, int kidId, int actId)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();
		var errMessage = "Activity not found.";

		// Act 
		var response = await _client.GetAsync(_url + $"/{kidId}/activity/{actId}");

		// Assert
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<string>();

		Assert.NotNull(content);
		Assert.Equal(errMessage, content);

	}

	#endregion

	#region POST method

	[Theory]
	[InlineData("test3@test.com", "password", 3, "sleeping", "2025-02-04T10:39:01.753Z", "1970-01-01T00:00:00Z", true)]
	[InlineData("test3@test.com", "password", 3, "eatingRight", "2025-02-04T10:39:01.753Z", "2025-02-04T10:49:01.753Z", false)]
	public async Task AddActivity_ValidValues_Return200(string email, string password, int kidId, string actType, DateTime startDate, DateTime endDate, bool isActive)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var activityDto = new KidActivityDto()
		{
			Id = kidId,
			ActivityType = actType,
			StartDate = startDate,
			EndDate = endDate,
			IsActiveNow = isActive,
		};

		var response = await _client.PostAsJsonAsync(_url + $"/{kidId}/activity", activityDto);

		// Assert
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var content = await response.Content.ReadAsStringAsync();
		Assert.NotNull(content);
	}


	[Theory]
	[InlineData("test3@test.com", "password", 3, "wrongActType", "2025-02-04T10:39:01.753Z", "1970-01-01T00:00:00Z", true)] // add activity with 'ActivityType.Undefined' 
	public async Task AddActivity_WrongActType_Return200(string email, string password, int kidId, string actType, DateTime startDate, DateTime endDate, bool isActive)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var activityDto = new KidActivityDto()
		{
			Id = kidId,
			ActivityType = actType,
			StartDate = startDate,
			EndDate = endDate,
			IsActiveNow = isActive,
		};

		var response = await _client.PostAsJsonAsync(_url + $"/{kidId}/activity", activityDto);

		// Assert
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<int>();

		var act = await _client.GetAsync(_url + $"/{kidId}/activity/{content}");

		Assert.NotNull(act);
		var content2 = await act.Content.ReadFromJsonAsync<KidActivityDto>();
		Assert.NotNull(content2);
		Assert.Equal("undefined", content2.ActivityType.ToLower());
	}

	[Theory]
	[InlineData("test1@test.com", "password", 2, 100, "2025-02-04T10:39:01.753Z", "1970-01-01T00:00:00Z", true)]                // bad activityType	(object) -> (string)
	[InlineData("test1@test.com", "password", 2, "sleeping", 10, "1970-01-01T00:00:00Z", true)]                                 // bad startDate	(object) -> (DateTime)
	[InlineData("test1@test.com", "password", 2, "sleeping", "2025-02-04T10:39:01.753Z", true, true)]                           // bad endDate		(object) -> (DateTime)
	[InlineData("test1@test.com", "password", 2, "wrongActType", "2025-02-04T10:39:01.753Z", "1970-01-01T00:00:00Z", "hello")]  // bad isActiveNow	(object) -> (bool)
	public async Task AddActivity_WrongTypeInDto_Return400(string email, string password, int kidId, object actType, object startDate, object endDate, object isActive)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var activityDto = new
		{
			Id = kidId,
			ActivityType = actType,
			StartDate = startDate,
			EndDate = endDate,
			IsActiveNow = isActive,
		};

		var response = await _client.PostAsJsonAsync(_url + $"/{kidId}/activity", activityDto);

		// Assert
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

	}

	#endregion

	#region PUT method 

	[Theory]
	[InlineData("test3@test.com", "password", 4, 6, "EatingLeft", "2025-02-02T02:02:02Z", "2025-02-02T22:22:22Z", false)]           // change actType
	[InlineData("test3@test.com", "password", 4, 6, "EatingRight", "2025-02-02T01:02:02Z", "2025-02-02T22:22:22Z", false)] // change startDate
	[InlineData("test3@test.com", "password", 4, 6, "EatingRight", "2025-02-02T02:02:02Z", "2025-02-02T20:22:22Z", false)] // change endDate
	[InlineData("test3@test.com", "password", 4, 6, "EatingRight", "2025-02-02T02:02:02Z", "1970-01-01T00:00:00Z", true)] // change isActive
	public async Task UpdateActivity_ValidValues_Return200(string email, string password, int kidId, int actId, string actType, DateTime startDate, DateTime endDate, bool isActive)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		//new KidActivity()
		//{
		//	Id = 6,
		//	ActivityType = KidActivityType.EatingRight,
		//	IsActiveNow = false,
		//	StartDate = new DateTime(2025, 2, 2, 2, 2, 2),
		//	EndDate = new DateTime(2025, 2, 2, 22, 22, 22),
		//	KidId = 1
		//}


		// Act 
		var activityDto = new KidActivityDto()
		{
			Id = actId,
			ActivityType = actType,
			StartDate = startDate,
			EndDate = endDate,
			IsActiveNow = isActive,
		};

		var response = await _client.PutAsJsonAsync(_url + $"/{kidId}/activity/{actId}", activityDto);

		// Assert
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<int>();
		Assert.Equal(actId, content);

		var response2 = await _client.GetAsync(_url + $"/{kidId}/activity/{actId}");

		Assert.NotNull(response2);
		var updatedActivity = await response2.Content.ReadFromJsonAsync<KidActivityDto>();

		Assert.NotNull(updatedActivity);
		activityDto.KidName = "kid4Parent3";
		Assert.Equivalent(activityDto, updatedActivity);
	}

	[Theory]
	[InlineData("test3@test.com", "password", 4, 6, 10, "2025-02-02T02:02:02+02:00", "2025-02-02T22:22:22+02:00", false)]           // wrong actType (object) -> (string)
	[InlineData("test3@test.com", "password", 4, 6, "EatingRight", "startDate", "2025-02-02T22:22:22+02:00", false)] // wrong startDate (object) -> (DateTime)
	[InlineData("test3@test.com", "password", 4, 6, "EatingRight", "2025-02-02T02:02:02+02:00", true, false)] // wrong endDate (object) -> (DateTime)
	[InlineData("test3@test.com", "password", 4, 6, "EatingRight", "2025-02-02T02:02:02+02:00", "2025-02-02T22:22:22+02:00", 10)] // wrong isActive (object) -> (bool)
	public async Task UpdateActivity_WrongValues_Return400(string email, string password, int kidId, int actId, object actType, object startDate, object endDate, object isActive)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		var r1 = await _client.GetAsync(_url + $"/{kidId}/activity/{actId}");
		r1.EnsureSuccessStatusCode();
		var expectedActivityNotChanged = await r1.Content.ReadFromJsonAsync<KidActivityDto>();


		// Act 
		var activityDto = new
		{
			Id = actId,
			ActivityType = actType,
			StartDate = startDate,
			EndDate = endDate,
			IsActiveNow = isActive,
		};

		var response = await _client.PutAsJsonAsync(_url + $"/{kidId}/activity/{actId}", activityDto);

		// Assert
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

		var response2 = await _client.GetAsync(_url + $"/{kidId}/activity/{actId}");
		Assert.NotNull(response2);
		var content = await response2.Content.ReadFromJsonAsync<KidActivityDto>();

		Assert.NotNull(content);
		Assert.Equivalent(expectedActivityNotChanged, content);

	}

	#endregion

	#region DEL method 

	[Theory]
	[InlineData("test3@test.com", "password", 4, 5)]
	public async Task RemoveActivity_ValidValues_Return204(string email, string password, int kidId, int actId)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();

		// Act 
		var response = await _client.DeleteAsync(_url + $"/{kidId}/activity/{actId}");

		// Assert
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
	}

	[Theory]
	[InlineData("test3@test.com", "password", 4, 50)]   // wrong activityId
	public async Task RemoveActivity_WrongValues_Return204(string email, string password, int kidId, int actId)
	{
		// Arrange 
		var login = await _client.PostAsJsonAsync("/auth/login", new { Email = email, Password = password });
		login.EnsureSuccessStatusCode();
		var errMessage = "Activity not found, maybe already removed.";

		// Act 
		var response = await _client.DeleteAsync(_url + $"/{kidId}/activity/{actId}");

		// Assert
		Assert.NotNull(response);
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<string>();
		Assert.Equal(errMessage, content);
	}

	#endregion

}
