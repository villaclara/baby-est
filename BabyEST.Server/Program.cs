using BabyEST.Server.Database;
using BabyEST.Server.EndPoints;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http.Json;
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

// Add Environment variables
builder.Configuration.AddEnvironmentVariables();

//builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseInMemoryDatabase("db"));
builder.Services.AddDbContext<ApplicationDbContext>(options =>
	options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
	.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
	{
		//options.LoginPath = "/api/unauthorized"; // to bypass default Cookie Redirect to Login page. It returns status code.
		options.Events.OnRedirectToLogin = (ctx) =>
		{
			ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
			return Task.CompletedTask;
		};
		options.Events.OnRedirectToAccessDenied = (ctx) =>
		{
			ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
			return Task.CompletedTask;
		};
	});
builder.Services.AddAuthorization();

// Start the Names with Upper Case Letter when returning Json objects.
builder.Services.Configure<JsonOptions>(options =>
{
	options.SerializerOptions.PropertyNamingPolicy = null;
});

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

app.MapFallbackToFile("/index.html");

app.MapGroup("/auth")
	.MapAuthEndpoints();

app.MapGroup("/api/parent")
	.MapParentEndpoints()
	.RequireAuthorization();

app.MapGroup("/api/kid")
	.MapKidEndpoints()
	.RequireAuthorization();

app.MapGroup("/api/kid/{id}/activity")
	.MapKidActivityEndpoints()
	.RequireAuthorization();

app.MapGet("/api/unauthorized", () => "403")
	.AllowAnonymous();


app.Run();
