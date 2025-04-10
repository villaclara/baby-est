﻿// <auto-generated />
using System;
using BabyEST.Server.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace BabyEST.Server.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class ApplicationDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.11");

            modelBuilder.Entity("BabyEST.Server.Models.Kid", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<DateOnly>("BirthDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Kids");
                });

            modelBuilder.Entity("BabyEST.Server.Models.KidActivity", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("ActivityType")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("TEXT");

                    b.Property<bool>("IsActiveNow")
                        .HasColumnType("INTEGER");

                    b.Property<int>("KidId")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("KidId");

                    b.ToTable("KidActivities");
                });

            modelBuilder.Entity("BabyEST.Server.Models.Parent", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Parents");
                });

            modelBuilder.Entity("BabyEST.Server.Models.SessionToken", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Token")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("UserId");

                    b.ToTable("SessionTokens");
                });

            modelBuilder.Entity("KidParent", b =>
                {
                    b.Property<int>("KidsId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("ParentsId")
                        .HasColumnType("INTEGER");

                    b.HasKey("KidsId", "ParentsId");

                    b.HasIndex("ParentsId");

                    b.ToTable("KidParent");
                });

            modelBuilder.Entity("BabyEST.Server.Models.KidActivity", b =>
                {
                    b.HasOne("BabyEST.Server.Models.Kid", "Kid")
                        .WithMany("Activities")
                        .HasForeignKey("KidId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Kid");
                });

            modelBuilder.Entity("KidParent", b =>
                {
                    b.HasOne("BabyEST.Server.Models.Kid", null)
                        .WithMany()
                        .HasForeignKey("KidsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("BabyEST.Server.Models.Parent", null)
                        .WithMany()
                        .HasForeignKey("ParentsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("BabyEST.Server.Models.Kid", b =>
                {
                    b.Navigation("Activities");
                });
#pragma warning restore 612, 618
        }
    }
}
