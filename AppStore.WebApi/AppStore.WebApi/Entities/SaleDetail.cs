using System;
using System.Collections.Generic;

namespace AppStore.WebApi.Entities;

public partial class SaleDetail
{
    public int SaleDetailId { get; set; }

    public int SaleId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal SubTotal { get; set; }

    public virtual Producto Product { get; set; } = null!;

    public virtual Sale Sale { get; set; } = null!;
}
