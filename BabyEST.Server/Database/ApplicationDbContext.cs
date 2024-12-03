using BabyEST.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BabyEST.Server.Database;

public class ApplicationDbContext : DbContext
{
	public DbSet<Kid> Kids { get; set; }
	public DbSet<KidActivity> KidActivities { get; set; }
	public DbSet<Parent> Parents { get; set; }

	public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
	{

	}

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.Entity<Parent>(b =>
		{
			b.HasKey(p => p.Id);

			b.HasMany(b => b.Kids)
			.WithMany(b => b.Parents);
		});

		modelBuilder.Entity<Kid>(b =>
		{
			b.HasKey(k => k.Id);

			b.HasMany(k => k.Parents)
			.WithMany(k => k.Kids);

			b.HasMany(k => k.Activities)
			.WithOne(k => k.Kid)
			.IsRequired(false);
		});

		modelBuilder.Entity<KidActivity>(b =>
		{
			b.HasKey(k => k.Id);

			b.HasOne(k => k.Kid)
			.WithMany(k => k.Activities)
			.HasForeignKey(k => k.KidId);
		});
	}
}
