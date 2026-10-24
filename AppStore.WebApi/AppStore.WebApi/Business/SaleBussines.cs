using AppStore.WebApi.Data;
using AppStore.WebApi.DTOs;
using AppStore.WebApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace AppStore.WebApi.Business
{
    public class SaleBusiness
    {
        private readonly AppDbContext _db;

        public SaleBusiness(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<GetSaleResponse>> GetAll(DateTime? startDate, DateTime? endDate)
        {
            var query = _db.Sales
                .AsNoTracking()
                .AsQueryable();

            if (startDate.HasValue)
            {
                var start = startDate.Value.Date;
                query = query.Where(s => s.CreatedAt >= start);
            }

            if (endDate.HasValue)
            {
                // Se suma un día y se usa "<" para incluir todo el día final
                var endExclusive = endDate.Value.Date.AddDays(1);
                query = query.Where(s => s.CreatedAt < endExclusive);
            }

            var sales = await query
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    s.SaleId,
                    UserName = s.User.FullName,
                    s.TotalAmount,
                    s.CreatedAt
                })
                .ToListAsync();

            return sales
                .Select(s => new GetSaleResponse(
                    s.SaleId,
                    s.UserName,
                    s.TotalAmount,
                    s.CreatedAt.ToString("dd/MM/yyyy")
                ))
                .ToList();
        }

        public async Task<GetSaleResponse?> GetById(int saleId)
        {
            var sale = await _db.Sales
                .AsNoTracking()
                .Where(s => s.SaleId == saleId)
                .Select(s => new
                {
                    s.SaleId,
                    UserName = s.User.FullName,
                    s.TotalAmount,
                    s.CreatedAt,
                    Details = s.SaleDetails.Select(d => new
                    {
                        ProductName = d.Product.Name,
                        ProductPrice = d.Product.Price,
                        d.Quantity,
                        d.SubTotal
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (sale == null)
                return null;

            return new GetSaleResponse(
                sale.SaleId,
                sale.UserName,
                sale.TotalAmount,
                sale.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                sale.Details.Select(d => new GetSaleDetailResponse(
                    d.ProductName,
                    d.ProductPrice,
                    d.Quantity,
                    d.SubTotal
                )).ToList()
            );
        }

        public async Task<int> Create(CreateSaleRequest request)
        {
            if (request.SaleDetails == null || !request.SaleDetails.Any())
                throw new ArgumentException("La venta debe tener al menos un producto.");

            if (request.SaleDetails.Any(d => d.Quantity <= 0))
                throw new ArgumentException("La cantidad de cada producto debe ser mayor a cero.");

            var userExists = await _db.Usuarios.AnyAsync(u => u.UserId == request.UserId);
            if (!userExists)
                throw new KeyNotFoundException($"No se encontró el usuario con id {request.UserId}.");

            // Si el mismo producto viene repetido, se suman las cantidades
            var lines = request.SaleDetails
                .GroupBy(d => d.ProductId)
                .Select(g => new { ProductId = g.Key, Quantity = g.Sum(x => x.Quantity) })
                .ToList();

            var productIds = lines.Select(l => l.ProductId).ToList();

            var products = await _db.Productos
                .Where(p => productIds.Contains(p.ProductId))
                .ToDictionaryAsync(p => p.ProductId);

            var sale = new Sale
            {
                UserId = request.UserId,
                CreatedAt = DateTime.Now
            };

            foreach (var line in lines)
            {
                if (!products.TryGetValue(line.ProductId, out var product))
                    throw new KeyNotFoundException($"No se encontró el producto con id {line.ProductId}.");

                if (product.Stock < line.Quantity)
                    throw new InvalidOperationException(
                        $"Stock insuficiente para '{product.Name}'. Disponible: {product.Stock}, solicitado: {line.Quantity}.");

                // El subtotal se calcula en el servidor con el precio real del producto
                sale.SaleDetails.Add(new SaleDetail
                {
                    ProductId = product.ProductId,
                    Quantity = line.Quantity,
                    SubTotal = product.Price * line.Quantity
                });

                product.Stock -= line.Quantity;
            }

            sale.TotalAmount = sale.SaleDetails.Sum(d => d.SubTotal);

            await _db.Sales.AddAsync(sale);
            await _db.SaveChangesAsync();

            return sale.SaleId;
        }
    }
}