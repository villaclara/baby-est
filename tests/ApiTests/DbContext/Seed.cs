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


	public static List<Parent> GetDataAsParentsList() => SeedAllDataAsParentsList();

	private static List<Parent> SeedAllDataAsParentsList()
	{
		List<Parent> parents = [
			new Parent()
			{
				Id = 1,
				Email = "test1@test.com",
				PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
				Kids = [
					new Kid()
					{
						Id = 1,
						Name = "kid1",
						BirthDate = new DateOnly(2020, 1, 1),
						Activities = [
							new KidActivity()
							{
								Id = 1,
								ActivityType = KidActivityType.Sleeping,
								IsActiveNow = false,
								StartDate = new DateTime(2025, 1, 1, 10, 10, 10),
								EndDate = new DateTime(2025, 1, 1, 11, 11, 11),
								KidId = 1
							},
							new KidActivity()
							{
								Id = 2,
								ActivityType = KidActivityType.EatingRight,
								IsActiveNow = false,
								StartDate = new DateTime(2025, 2, 2, 2, 2, 2),
								EndDate = new DateTime(2025, 2, 2, 22, 22, 22),
								KidId = 1
							}
						]
					},
					new Kid()
					{
						Id = 2,
						Name = "kid2",
						BirthDate = new DateOnly(2020, 1, 1)
					},
				]
			},
			new Parent()
			{
				Id = 2,
				Email = "test2@test.com",
				PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
				Kids = []
			},
			new Parent()
			{
				Id = 3,
				Email = "test3@test.com",
				PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
				Kids = []
			}
		];

		return parents;
	}
}
