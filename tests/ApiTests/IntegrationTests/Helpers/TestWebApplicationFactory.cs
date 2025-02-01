using ApiTests.DbContext;
using BabyEST.Server.Database;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ApiTests.IntegrationTests.Helpers;

public class TestWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram>, IDisposable where TProgram : class
{
	private string _dbFilePath;
	protected override IHost CreateHost(IHostBuilder builder)
	{

		builder.ConfigureServices((services) =>
		{
			var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
			if (descriptor is not null)
			{
				services.Remove(descriptor);
			}

			//services.AddDbContext<ApplicationDbContext>(options =>
			//	options.UseSqlite("Data Source = data_test.db")); // test/bin/debug/data_test.db

			//services.AddDbContext<ApplicationDbContext>(options =>
			//	options.UseInMemoryDatabase(Guid.NewGuid().ToString()));

			//services.AddDbContext<ApplicationDbContext>(options =>
			//	options.UseSqlite("Data Source = 1.db"));

			// get another instance of Database for each of the object created of this class
			_dbFilePath = Path.Combine(Path.GetTempPath(), $"test_db_{Guid.NewGuid()}.db");
			services.AddDbContext<ApplicationDbContext>(options =>
				options.UseSqlite($"Data Source = {_dbFilePath}"));



			var sp = services.BuildServiceProvider();

			using var scope = sp.CreateScope();
			var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

			dbContext.Database.EnsureDeleted();
			dbContext.Database.EnsureCreated();

			var p = Seed.GetDataAsParentsList();
			dbContext.AddRange(p);

			dbContext.SaveChanges();
		});



		return base.CreateHost(builder);
	}
}
