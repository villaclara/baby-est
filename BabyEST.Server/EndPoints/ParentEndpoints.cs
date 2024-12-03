using BabyEST.Server.Database;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace BabyEST.Server.EndPoints;

public static class ParentEndpoints
{
	// TODO 1. Parent Endpoints
	// TODO 2. Kid Endpoints
	// TODO 3. Activity Endpoints
	public static RouteGroupBuilder MapParentEndpoints(this RouteGroupBuilder builder)
	{
		builder.MapPost("/{pid}/addparent", AddNewParentToKid);

		return builder;
	}

	public static async Task<IResult> AddNewParentToKid([FromRoute] int pid, [FromQuery] int kidId, [FromQuery] string newParentEmail, ApplicationDbContext dbContext)
	{
		// Check if the current Parent is really parent of Kid
		var kid = dbContext.Parents.Where(p => p.Id == pid).FirstOrDefault()?
			.Kids.Where(k => k.Id == kidId).FirstOrDefault();

		if (kid == null)
		{
			Log.Warning("{@Method} - Kid ({@kid}) does not belong to parent ({@parent]).", nameof(AddNewParentToKid), kid, pid);
			return TypedResults.BadRequest("Kid does not belong to parent.");
		}

		// Select Parent to add instance from db
		var newParent = dbContext.Parents.Where(p => p.Email == newParentEmail).FirstOrDefault();
		if (newParent == null)
		{
			Log.Warning("{@Method} - No parents found with email ({@email}).", nameof(AddNewParentToKid), newParentEmail);
			return TypedResults.BadRequest("No parents found with email.");
		}

		// TODO
		// Add New Parent to Kid -- not sure if it is correct
		kid.Parents.Add(newParent);
		//dbContext.Update(kid);
		await dbContext.SaveChangesAsync();

		return TypedResults.Ok("Parent added to kid.");
	}
}
