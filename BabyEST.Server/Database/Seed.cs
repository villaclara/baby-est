using BabyEST.Server.Models;

namespace BabyEST.Server.Database;

internal class Seed(ApplicationDbContext dbContext)
{
	private readonly ApplicationDbContext _dbContext = dbContext;

	public async Task SeedData()
	{
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

		await _dbContext.Parents.AddRangeAsync(parents);


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

		await _dbContext.Kids.AddRangeAsync(kids);
	}
}
