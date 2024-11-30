using BabyEST.Server.Models;

namespace BabyEST.Server.Interfaces;

internal interface IUserService
{
	Task<User?> GetUser(Guid userId);
	Task<User?> CreateUserAsync(User user);
	Task<User?> UpdateUserAsync(User user);
	Task<User?> DeleteUserAsync(Guid userId);
}
