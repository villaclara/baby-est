using BabyEST.Server.Models;

namespace BabyEST.Server.Interfaces;

internal interface IActivityService
{
	Task<IEnumerable<KidActivity>> GetActivitiesByKidAsync(int kidId);
	Task<IEnumerable<KidActivity>> GetActivitiesByDateAsync(DateOnly dateOnly);

	Task<KidActivity?> GetActivityAsync(long activityId);
	Task<KidActivity?> GetLatestActivityAsync();

	Task<KidActivity?> CreateActivityAsync(KidActivity activity);
	Task<KidActivity?> UpdateActivityAsync(KidActivity activity);
	Task<KidActivity?> DeleteActivityAsync(long activityId);

}
