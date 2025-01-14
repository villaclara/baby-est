
using System.Security.Claims;
using BabyEST.Server.Database;
using BabyEST.Server.DTOs;
using BabyEST.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace BabyEST.Server.EndPoints;

public static class KidActivityEndpoints
{
	public static RouteGroupBuilder MapKidActivityEndpoints(this RouteGroupBuilder builder)
	{
		builder.MapGet("", GetAllActivitiesForKid);
		builder.MapGet("{aId}", GetActivity);
		builder.MapGet("last", GetLastActivityByType);
		builder.MapPost("", AddActivity);
		builder.MapPut("{aId}", UpdateActivity);
		builder.MapDelete("{aId}", RemoveActivity);

		return builder;
	}

	private static bool KidExistsOrBelongsToParent(int kidId, int parentId, ApplicationDbContext dbctx) =>
		dbctx.Kids.Any(k => k.Id == kidId && k.Parents.Any(p => p.Id == parentId));

	private static IResult GetAllActivitiesForKid([FromRoute] int id, ClaimsPrincipal principal, ApplicationDbContext dbctx, [FromQuery] int? last = null)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(GetAllActivitiesForKid), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		if (!KidExistsOrBelongsToParent(id, parentId, dbctx))
		{
			return TypedResults.BadRequest("Kid with provided Id not found or you are not parent.");
		}

		var activities = dbctx.KidActivities.Where(a => a.KidId == id).Include(k => k.Kid).OrderByDescending(a => a.StartDate);

		if (activities is null)
		{
			return TypedResults.BadRequest("Activities not found.");
		}

		if (last is not null)
		{
			activities = (IOrderedQueryable<KidActivity>)activities.Take(last.Value);
		}

		var activitiesDto = new List<KidActivityDto>();
		foreach (var act in activities)
		{
			activitiesDto.Add(new KidActivityDto(act));
		}

		return TypedResults.Ok(activitiesDto);
	}

	private static IResult GetLastActivityByType([FromRoute] int id, [FromQuery] string actType, ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(GetAllActivitiesForKid), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		if (!KidExistsOrBelongsToParent(id, parentId, dbctx))
		{
			return TypedResults.BadRequest("Kid with provided Id not found or you are not parent.");
		}

		KidActivityType[] aType = actType.ToLower().Trim() switch
		{
			"eat" => [KidActivityType.EatingLeft, KidActivityType.EatingRight, KidActivityType.EatingBoth, KidActivityType.EatingBottle],
			"sleep" => [KidActivityType.Sleeping],
			_ => [KidActivityType.Undefined]
		};

		//var activity = dbctx.KidActivities.Where(a => a.KidId == id && aType.Contains(a.ActivityType))
		//	.Include(k => k.Kid)
		//	.Take(10)
		//	.OrderByDescending(a => a.StartDate)
		//	.FirstOrDefault();

		var activity = dbctx.KidActivities.Where(a => a.KidId == id && aType.Contains(a.ActivityType))
			.Include(k => k.Kid)
			.OrderByDescending(a => a.StartDate)
			.FirstOrDefault();


		if (activity is null)
		{
			return TypedResults.NotFound($"No last activity for type {actType}");
		}
		return TypedResults.Ok(new KidActivityDto(activity));

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

		if (!KidExistsOrBelongsToParent(id, parentId, dbctx))
		{
			return TypedResults.BadRequest("Kid with provided Id not found or you are not parent.");
		}

		var activity = dbctx.KidActivities.Where(a => a.Id == aId && a.KidId == id).Include(k => k.Kid).FirstOrDefault();

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

		if (!KidExistsOrBelongsToParent(id, parentId, dbctx))
		{
			return TypedResults.BadRequest("Kid with provided Id not found or you are not parent.");
		}

		try
		{
			// Try to parse string as ActivityType
			bool isConverted = Enum.TryParse(activityDto.ActivityType, ignoreCase: true, out KidActivityType actType);

			var activity = new KidActivity()
			{
				KidId = id,
				StartDate = activityDto.StartDate.Kind == DateTimeKind.Utc ? activityDto.StartDate : activityDto.StartDate.ToUniversalTime(),
				EndDate = activityDto.EndDate.Kind == DateTimeKind.Utc ? activityDto.EndDate : activityDto.EndDate.ToUniversalTime(),
				ActivityType = isConverted ? actType : KidActivityType.Undefined,
				IsActiveNow = activityDto.IsActiveNow
				//ActivityType = (KidActivityType)activityDto.ActivityType
			};

			dbctx.KidActivities.Add(activity);
			await dbctx.SaveChangesAsync();

			//return TypedResults.Created($"/api/kid/{id}/activity/{activity.Id}");
			return TypedResults.Ok(activity.Id);
		}
		catch (Exception ex)
		{
			Log.Error("{@Method} - Error when adding activity to parent ({@ex}).", nameof(AddActivity), ex);
			return TypedResults.BadRequest("Error when activity kid to parent.");
		}
	}

	private static async Task<IResult> UpdateActivity([FromRoute] int id, [FromRoute] int aId, [FromBody] KidActivityDto activityDto, ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(UpdateActivity), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		if (!KidExistsOrBelongsToParent(id, parentId, dbctx))
		{
			return TypedResults.BadRequest("Kid with provided Id not found or you are not parent.");
		}

		var activity = dbctx.KidActivities.Where(a => a.Id == aId && a.KidId == id).FirstOrDefault();
		if (activity == null)
		{
			Log.Warning("{@Method} - Activity with id ({@id}) not found. Return.", nameof(UpdateActivity), aId);
			return TypedResults.BadRequest("Activity not found.");
		}


		try
		{
			// Try parse the string as ActivityType
			bool isConverted = Enum.TryParse(activityDto.ActivityType, ignoreCase: true, out KidActivityType actType);

			activity.StartDate = activityDto.StartDate == DateTime.MinValue ? activity.StartDate : activityDto.StartDate.ToUniversalTime();
			activity.EndDate = activityDto.EndDate == DateTime.MinValue ? activity.EndDate : activityDto.EndDate.ToUniversalTime();
			//activity.ActivityType = activityToUpdate.ActivityType;
			activity.ActivityType = isConverted ? actType : KidActivityType.Undefined;
			activity.IsActiveNow = activityDto.IsActiveNow;
			await dbctx.SaveChangesAsync();

			//return TypedResults.Created($"/api/kid/{activity.Id}");
			return TypedResults.Ok(activity.Id);
		}
		catch (Exception ex)
		{
			Log.Error("{@Method} - Error when updating activity ({@ex}).", nameof(UpdateActivity), ex);
			return TypedResults.BadRequest("Error when updating activity.");
		}
	}

	private static async Task<IResult> RemoveActivity([FromRoute] int id, [FromRoute] int aId, ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(RemoveActivity), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		if (!KidExistsOrBelongsToParent(id, parentId, dbctx))
		{
			return TypedResults.BadRequest("Kid with provided Id not found or you are not parent.");
		}

		var activity = dbctx.KidActivities.Where(a => a.Id == aId && a.KidId == id).FirstOrDefault();
		if (activity == null)
		{
			return TypedResults.BadRequest("Activity not found, maybe already removed.");
		}

		try
		{

			dbctx.KidActivities.Remove(activity);
			await dbctx.SaveChangesAsync();

			return TypedResults.NoContent();
		}
		catch (Exception ex)
		{
			Log.Error("{@Method} - Error when removing activity ({@ex}).", nameof(RemoveActivity), ex);
			return TypedResults.BadRequest("Error when removing activity.");
		}
	}

}
