using AppStore.WebApi.Constants;
using System;
using System.Collections.Generic;

namespace AppStore.WebApi.Entities;

public partial class Usuario
{
    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string UserType { get; set; } = UserTypes.SalesPerson;

    public string Passwrd { get; set; } = null!;

    public bool ResetPassword { get; set; } = false;
    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
