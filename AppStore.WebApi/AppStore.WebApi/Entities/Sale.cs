using System;
using System.Collections.Generic;

namespace AppStore.WebApi.Entities;

public partial class Sale
{
    public int SaleId { get; set; }

    public int UserId { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<SaleDetail> SaleDetails { get; set; } = new List<SaleDetail>();

    public virtual Usuario User { get; set; } = null!;
}
