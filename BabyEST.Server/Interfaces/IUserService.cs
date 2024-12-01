using BabyEST.Server.Models;

namespace BabyEST.Server.Interfaces;

internal interface IUserService
{
	Task<Parent?> GetUser(Guid userId);
	Task<Parent?> CreateUserAsync(Parent user);
	Task<Parent?> UpdateUserAsync(Parent user);
	Task<Parent?> DeleteUserAsync(Guid userId);
}
