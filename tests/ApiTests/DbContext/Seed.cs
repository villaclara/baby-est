using BabyEST.Server.Database;
using BabyEST.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiTests.DbContext;

public class Seed
{
	public static async Task<ApplicationDbContext> GetContext()
	{
		var options = new DbContextOptionsBuilder<ApplicationDbContext>()
				.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()).Options;
		var dbContext = new ApplicationDbContext(options);

		List<Parent> parents = [
			new Parent()
			{
				Id = 1,
				Email = "test1@test.com",
				PasswordHash = "test1Pwd",
				Kids = []
			},
			new Parent()
			{
				Id = 2,
				Email = "test2@test.com",
				PasswordHash = "test2Pwd",
				Kids = []
			},
			new Parent()
			{
				Id = 3,
				Email = "test3@test.com",
				PasswordHash = "test3Pwd",
				Kids = []
			}
			];

		await dbContext.Parents.AddRangeAsync(parents);


		List<Kid> kids = [
			new Kid()
			{
				Id = 1,
				Name = "kid1",
				BirthDate = new DateOnly(2020, 1, 1),
				Parents = []
			},
			new Kid()
			{
				Id = 2,
				Name = "kid2",
				BirthDate = new DateOnly(2020, 1, 1),
				Parents = []
			},
			new Kid()
			{
				Id = 3,
				Name = "kid3",
				BirthDate = new DateOnly(2020, 1, 1),
				Parents = []
			}
			];

		kids[0].Parents.Add(parents[0]);
		kids[1].Parents.Add(parents[1]);

		parents[0].Kids.Add(kids[0]);
		parents[0].Kids.Add(kids[2]);

		await dbContext.Kids.AddRangeAsync(kids);

		await dbContext.SaveChangesAsync();

		return dbContext;
	}
}
