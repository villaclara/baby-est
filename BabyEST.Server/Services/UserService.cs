using BabyEST.Server.Database;
using BabyEST.Server.Interfaces;
using BabyEST.Server.Models;
using Microsoft.EntityFrameworkCore;

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
		try
		{
			await _ctx.AddAsync(user);
			await _ctx.SaveChangesAsync();

			return user;
		}
		catch (Exception ex)
		{
			throw;
		}
	}

	public async Task<User?> DeleteUserAsync(int userId)
	{
		try
		{
			var user = await GetUser(userId);
			if (user != null)
			{
				_ctx.Remove(user);
				await _ctx.SaveChangesAsync();
				return user;
			}

			return null;
		}
		catch
		{
			throw;
		}
	}

	public async Task<User?> GetUser(int userId)
	{
		return await _ctx.Users.FirstOrDefaultAsync(u => u.Id == userId);
	}

	public async Task<User?> UpdateUserAsync(User user)
	{
		try
		{

			_ctx.Update(user);
			await _ctx.SaveChangesAsync();
			return user;
		}
		catch
		{
			throw;
		}
	}
}
