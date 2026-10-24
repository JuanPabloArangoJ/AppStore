using AppStore.WebApi.Business;
using AppStore.WebApi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
    );
builder.Services.AddScoped<UserBusiness>();
builder.Services.AddScoped<ProductBusiness>();
builder.Services.AddScoped<SaleBusiness>();

builder.Services.AddCors(opts =>
{
    opts.AddPolicy("mypolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
        .AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseStaticFiles();

app.UseCors("mypolicy");

// Configure the HTTP request pipeline.

app.UseAuthorization();

app.MapControllers();

app.Run();
