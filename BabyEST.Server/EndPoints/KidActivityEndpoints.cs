﻿
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

		var activities = dbctx.KidActivities.Where(a => a.KidId == id).Include(k => k.Kid);

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

		try
		{
			// Try to parse string as ActivityType
			bool isConverted = Enum.TryParse(activityDto.ActivityType, ignoreCase: true, out KidActivityType actType);

			var activity = new KidActivity()
			{
				KidId = id,
				StartDate = activityDto.StartDate,
				EndDate = activityDto.EndDate,
				ActivityType = isConverted ? actType : KidActivityType.Undefined
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

	private static async Task<IResult> UpdateActivity([FromRoute] int id, [FromRoute] int aId, [FromBody] KidActivityDto activityDto, ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(UpdateActivity), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
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

			activity.StartDate = activityDto.StartDate == DateTime.MinValue ? activity.StartDate : activityDto.StartDate;
			activity.EndDate = activityDto.EndDate == DateTime.MinValue ? activity.EndDate : activityDto.EndDate;
			//activity.ActivityType = activityToUpdate.ActivityType;
			activity.ActivityType = isConverted ? actType : KidActivityType.Undefined;

			await dbctx.SaveChangesAsync();

			return TypedResults.Created($"/api/kid/{activity.Id}");
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