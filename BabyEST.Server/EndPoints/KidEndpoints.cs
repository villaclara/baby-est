
using System.Security.Claims;
using BabyEST.Server.Database;
using BabyEST.Server.DTOs;
using BabyEST.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace BabyEST.Server.EndPoints;

public static class KidEndpoints
{
	public static RouteGroupBuilder MapKidEndpoints(this RouteGroupBuilder builder)
	{
		builder.MapGet("", GetAllKidsForCurrentParent);
		builder.MapGet("{id}", GetKidById);
		builder.MapPost("", AddKid);
		builder.MapPut("{id}", UpdateKid);
		builder.MapDelete("{id}", RemoveKid);
		return builder;

	}

	private static IResult GetAllKidsForCurrentParent(ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(GetAllKidsForCurrentParent), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		var kids = dbctx.Kids.Where(k => k.Parents.Any(p => p.Id == parentId)).Include(k => k.Parents);

		var kidDtos = new List<KidDto>();
		foreach (var kid in kids)
		{
			kidDtos.Add(new KidDto(kid));
		}

		return TypedResults.Ok(kidDtos);
	}

	private static IResult GetKidById([FromRoute] int id, ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(GetKidById), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		var kid = dbctx.Kids.Where(k => k.Id == id && k.Parents.Any(p => p.Id == parentId)).Include(k => k.Parents).FirstOrDefault();

		if (kid is null)
		{
			return TypedResults.BadRequest("Kid not found.");
		}

		return TypedResults.Ok(new KidDto(kid));

	}

	private static async Task<IResult> AddKid([FromBody] KidDto kidDto, ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(AddKid), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		try
		{

			var kid = new Kid()
			{
				Name = kidDto.Name,
				BirthDate = DateOnly.ParseExact(kidDto.BirthDate, "yyyy-MM-dd"),
			};

			var parent = dbctx.Parents.Where(p => p.Id == parentId).FirstOrDefault();
			if (parent is null)
			{
				return TypedResults.BadRequest("Parent not found with id");
			}
			parent.Kids.Add(kid);

			//kid.Parents.Add(new Parent()
			//{
			//	Id = parentId,
			//	Email = principal.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
			//});

			//dbctx.Kids.Add(kid);
			await dbctx.SaveChangesAsync();

			return TypedResults.Created($"/api/kid/{kid.Id}");
		}
		catch (Exception ex)
		{
			Log.Error("{@Method} - Error when adding kid to parent ({@ex}).", nameof(AddKid), ex);
			return TypedResults.BadRequest("Error when adding kid to parent.");
		}

	}

	private static async Task<IResult> RemoveKid([FromRoute] int id, ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(RemoveKid), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		var kid = dbctx.Kids.Where(k => k.Id == id && k.Parents.Any(p => p.Id == parentId)).FirstOrDefault();
		var activities = dbctx.KidActivities.Where(a => a.KidId == id).AsEnumerable() ?? [];
		if (kid == null)
		{
			return TypedResults.BadRequest("Kid not found, maybe already removed.");
		}

		try
		{

			dbctx.Kids.Remove(kid);
			dbctx.KidActivities.RemoveRange(activities);
			await dbctx.SaveChangesAsync();

			return TypedResults.NoContent();
		}
		catch (Exception ex)
		{
			Log.Error("{@Method} - Error when removing kid ({@ex}).", nameof(AddKid), ex);
			return TypedResults.BadRequest("Error when removing kid.");
		}
	}

	//Updates the Kid received from Body. Can only update the Name and BirthDate.
	private static async Task<IResult> UpdateKid([FromRoute] int id, [FromBody] KidDto kidToUpdate, ClaimsPrincipal principal, ApplicationDbContext dbctx)
	{
		// Get current user id
		var pid = principal.FindFirstValue("id");
		if (!int.TryParse(pid, out int parentId))
		{
			Log.Warning("{@Method} - Could not parse current user id ({@pid}).", nameof(UpdateKid), pid);
			return TypedResults.BadRequest("Could not parse current user id.");
		}

		var kid = dbctx.Kids.Where(k => k.Id == id && k.Parents.Any(p => p.Id == parentId)).FirstOrDefault();
		if (kid == null)
		{
			Log.Warning("{@Method} - Kid with id ({@id}) not found. Return.", nameof(UpdateKid), id);
			return TypedResults.BadRequest("Kid not found.");
		}

		try
		{
			kid.Name = kidToUpdate.Name;
			kid.BirthDate = DateOnly.ParseExact(kidToUpdate.BirthDate, "yyyy-MM-dd");

			await dbctx.SaveChangesAsync();

			return TypedResults.Created($"/api/kid/{kid.Id}");
		}
		catch (Exception ex)
		{
			Log.Error("{@Method} - Error when updating kid ({@ex}).", nameof(AddKid), ex);
			return TypedResults.BadRequest("Error when updating kid.");
		}
	}




}
