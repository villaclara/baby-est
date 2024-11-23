using BabyEST.Server.Database;
using BabyEST.Server.Interfaces;
using BabyEST.Server.Models;

namespace BabyEST.Server.Services;

internal class UserService : IUserService
{
	private readonly ApplicationContext _ctx;

	public UserService(ApplicationContext context)
	{
		_ctx = context;
	}

	public async Task<User?> CreateUserAsync(User user)
	{
		await _ctx.AddAsync(user);
		await _ctx.SaveChangesAsync();

		return user;
	}

	public Task<User?> DeleteUserAsync(int userId)
	{
		throw new NotImplementedException();
	}

	public Task<User?> GetUser(int userId)
	{
		throw new NotImplementedException();
	}

	public Task<User?> UpdateUserAsync(User user)
	{
		throw new NotImplementedException();
	}
}
