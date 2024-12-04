using System.Security.Claims;
using BabyEST.Server.Database;
using BabyEST.Server.DTOs;
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
		builder.MapPost("/addparent", AddNewParentToKid);

		builder.MapGet("/{pid}/kids", GetKidsForParent);

		return builder;
	}

	private static IResult GetKidsForParent([FromRoute] int pid, ApplicationDbContext dbContext)
	{
		var kids = dbContext.Kids.Where(k => k.Parents.Any(p => p.Id == pid)).ToList();

		var parent = dbContext.Parents.Where(p => p.Id == pid).FirstOrDefault();
		if (parent is null)
		{
			return TypedResults.BadRequest("Parent id not found.");
		}

		var pDto = new ParentDto(parent);
		return TypedResults.Ok(pDto.Kids);
	}

	public static async Task<IResult> AddNewParentToKid([FromQuery] int kidId, [FromQuery] string newParentEmail, ApplicationDbContext dbContext, ClaimsPrincipal principal)
	{
		// Get Parent instance from context
		var currentParentId = principal.FindFirstValue("id");
		if (!int.TryParse(currentParentId, out var parentId))
		{
			Log.Warning("{@Method} - Error when parsing claim id of user ({@current}).", nameof(AddNewParentToKid), currentParentId);
			return TypedResults.BadRequest("Not found user with.");
		}

		// Check if the current Parent is really parent of Kid
		var kid = dbContext.Parents.Where(p => p.Id == parentId).FirstOrDefault()?
			.Kids.Where(k => k.Id == kidId).FirstOrDefault();

		if (kid == null)
		{
			Log.Warning("{@Method} - Kid ({@kid}) does not belong to parent ({@parent]).", nameof(AddNewParentToKid), kid, parentId);
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
