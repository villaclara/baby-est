using System.Security.Claims;
using BabyEST.Server.Database;
using BabyEST.Server.EndPoints;
using BabyEST.Server.Interfaces;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Serilog;

Log.Logger = new LoggerConfiguration()
	.WriteTo.File("log.txt", shared: true, fileSizeLimitBytes: 1_000_000_000)
	.CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<ITest, Test>();


//builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseInMemoryDatabase("db"));
builder.Services.AddDbContext<ApplicationDbContext>(options =>
	options.UseSqlServer(builder.Configuration.GetConnectionString("LocalSqlConnection")));

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
	.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme);
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var summaries = new[]
{
	"Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
	var forecast = Enumerable.Range(1, 5).Select(index =>
		new WeatherForecast
		(
			DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
			Random.Shared.Next(-20, 55),
			summaries[Random.Shared.Next(summaries.Length)]
		))
		.ToArray();
	return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.MapFallbackToFile("/index.html");

app.MapGroup("/auth")
	.MapAuthEndpoints();

app.MapGroup("/api/parent")
	.MapParentEndpoints()
	.RequireAuthorization()
	.WithOpenApi();

app.MapGroup("/api/kid")
	.MapKidEndpoints()
	.RequireAuthorization();

app.MapGroup("/api/kid/{id}/activity")
	.MapKidActivityEndpoints()
	.RequireAuthorization();

app.MapGet("/log", (ClaimsPrincipal principal) =>
{
	//Dictionary<string, string> claims = [];
	//foreach (var c in ctx.User.Claims)
	//{
	//	claims.Add(c.Type, c.Value);
	//}

	//return claims;

	//return principal.Claims.Where(c => c.Type == "id").FirstOrDefault()?.Value;
	return principal.FindFirstValue("id");
}).RequireAuthorization();

app.Run();

internal record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
	public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
