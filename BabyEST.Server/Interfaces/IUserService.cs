using BabyEST.Server.Models;

namespace BabyEST.Server.Interfaces;

internal interface IUserService
{
	Task<User?> GetUser(int userId);
	Task<User?> CreateUserAsync(User user);
	Task<User?> UpdateUserAsync(User user);
	Task<User?> DeleteUserAsync(int userId);
}
