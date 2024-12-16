using System.Security.Claims;
using BabyEST.Server.Database;
using BabyEST.Server.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace BabyEST.Server.EndPoints;

public static class ParentEndpoints
{
	public static RouteGroupBuilder MapParentEndpoints(this RouteGroupBuilder builder)
	{
		builder.MapPost("/addparent", AddNewParentToKid);

		builder.MapGet("/kids", GetKidsForParent);

		//builder.MapGet("/parent/me", GetCurrentParent);

		return builder;
	}

	private static IResult GetKidsForParent(ClaimsPrincipal principal, ApplicationDbContext dbContext)
	{
		// Get Parent instance from context
		var currentParentId = principal.FindFirstValue("id");
		if (!int.TryParse(currentParentId, out var parentId))
		{
			Log.Warning("{@Method} - Error when parsing claim id of user ({@current}).", nameof(AddNewParentToKid), currentParentId);
			return TypedResults.BadRequest("Not found user with.");
		}
		Log.Information("GET KIDS OF PARENT WITH ID {@ID}", parentId);

		var parent = dbContext.Parents.Where(p => p.Id == parentId).Include(p => p.Kids).FirstOrDefault();
		if (parent is null)
		{
			return TypedResults.BadRequest("Parent id not found.");
		}

		var pDto = new ParentDto(parent);
		return TypedResults.Ok(pDto);
	}

	public static async Task<IResult> AddNewParentToKid([FromBody] FormKidAndParentId kidAndParent, ApplicationDbContext dbContext, ClaimsPrincipal principal)
	{
		// Get Parent instance from context
		var currentParentId = principal.FindFirstValue("id");
		if (!int.TryParse(currentParentId, out var parentId))
		{
			Log.Warning("{@Method} - Error when parsing claim id of user ({@current}).", nameof(AddNewParentToKid), currentParentId);
			return TypedResults.BadRequest("Not found user with.");
		}

		(int kidId, string newParentEmail) = (kidAndParent.kidId, kidAndParent.pEmail);

		// Check if the current Parent is really parent of Kid
		var kid = dbContext.Kids.Where(k => k.Id == kidId && k.Parents.Any(p => p.Id == parentId)).FirstOrDefault();

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

		kid.Parents.Add(newParent);
		await dbContext.SaveChangesAsync();

		return TypedResults.Ok("Parent added to kid.");
	}

	public record FormKidAndParentId(int kidId, string pEmail);
}
