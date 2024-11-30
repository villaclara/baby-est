using BabyEST.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BabyEST.Server.Database;

internal class ApplicationDbContext : DbContext
{
	internal DbSet<Kid> Kids { get; set; }
	internal DbSet<KidActivity> KidActivities { get; set; }
	internal DbSet<User> Users { get; set; }

	public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
	{

	}
}
