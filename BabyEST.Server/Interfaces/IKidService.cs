using BabyEST.Server.Models;

namespace BabyEST.Server.Interfaces;

internal interface IKidService
{
	Task<KidActivity> GetActivitiesForKidAsync(int kidId);

	Task<Kid?> GetKidByIdAsync(int kidId);
	Task<Kid?> CreateKidAsync(Kid kid);
	Task<Kid?> DeleteKidAsync(int kidId);
	Task<Kid?> UpdateKidAsync(Kid kid);


}
