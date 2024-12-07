
using System.Security.Claims;
using BabyEST.Server.Database;
using BabyEST.Server.DTOs;
using BabyEST.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace BabyEST.Server.EndPoints;

public static class KidActivityEndpoints
{
	public static RouteGroupBuilder MapKidActivityEndpoints(this RouteGroupBuilder builder)
	{
		builder.MapGet("", GetAllActivitiesForKid);
		builder.MapGet("{aId}", GetActivity);
		builder.MapPost("", AddActivity);
		builder.MapPut("{aId}", UpdateActivity);
		builder.MapDelete("{aId}", RemoveActivity);

		return builder;
	}

	private static IResult GetAllActivitiesForKid([FromRoute] int id, ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(GetAllActivitiesForKid), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		var activities = dbctx.KidActivities.Where(a => a.KidId == id);

		if (activities is null)
		{
			return TypedResults.BadRequest("Activities not found.");
		}

		var activitiesDto = new List<KidActivityDto>();
		foreach (var act in activities)
		{
			activitiesDto.Add(new KidActivityDto(act));
		}

		return TypedResults.Ok(activitiesDto);
	}

	private static IResult GetActivity([FromRoute] int id, [FromRoute] int aId, ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(GetActivity), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		var activity = dbctx.KidActivities.Where(a => a.Id == aId && a.KidId == id).FirstOrDefault();

		if (activity is null)
		{
			return TypedResults.BadRequest("Activity not found.");
		}

		return TypedResults.Ok(new KidActivityDto(activity));

	}

	private static async Task<IResult> AddActivity([FromRoute] int id, [FromBody] KidActivityDto activityDto, ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(AddActivity), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		try
		{

			var activity = new KidActivity()
			{
				KidId = id,
				StartDate = activityDto.StartDate,
				EndDate = activityDto.EndDate,
				//ActivityType = (KidActivityType)activityDto.ActivityType
			};

			dbctx.KidActivities.Add(activity);
			await dbctx.SaveChangesAsync();

			return TypedResults.Created($"/api/kid/{id}/activity/{activity.Id}");
		}
		catch (Exception ex)
		{
			Log.Error("{@Method} - Error when adding activity to parent ({@ex}).", nameof(AddActivity), ex);
			return TypedResults.BadRequest("Error when activity kid to parent.");
		}
	}

	private static async Task UpdateActivity([FromRoute] int id, [FromRoute] int aId)
	{
		throw new NotImplementedException();
	}

	private static async Task RemoveActivity([FromRoute] int id, [FromRoute] int aId)
	{
		throw new NotImplementedException();
	}


}
