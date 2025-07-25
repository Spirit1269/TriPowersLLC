﻿using Microsoft.EntityFrameworkCore;

namespace TriPowersLLC.Models
{
    public class JobDBContext : DbContext
    {
        public JobDBContext(DbContextOptions<JobDBContext> options) : base(options)
        {

        }
        public DbSet<Applicants> Applicants { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<User> Users { get; set; }

    }
}
