using BabyEST.Server.Database;
using BabyEST.Server.Interfaces;
using BabyEST.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BabyEST.Server.Services;

internal class UserService : IUserService
{
	private readonly ApplicationDbContext _ctx;

	public UserService(ApplicationDbContext context)
	{
		_ctx = context;
	}

	public async Task<Parent?> CreateUserAsync(Parent user)
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

	public async Task<Parent?> DeleteUserAsync(Guid userId)
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

	public async Task<Parent?> GetUser(Guid userId)
	{
		return await _ctx.Parents.FirstOrDefaultAsync(u => u.Id == userId);
	}

	public async Task<Parent?> UpdateUserAsync(Parent user)
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
