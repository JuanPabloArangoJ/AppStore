using System;
using System.Collections.Generic;

namespace AppStore.WebApi.Entities;

public partial class Producto
{
    public int ProductId { get; set; }

    public string Sku { get; set; } = null!;

    public string Name { get; set; } = null!;

    public int Stock { get; set; }

    public decimal Price { get; set; }

    public string? Image { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<SaleDetail> SaleDetails { get; set; } = new List<SaleDetail>();
}
