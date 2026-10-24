using AppStore.WebApi.Data;
using AppStore.WebApi.DTOs;
using AppStore.WebApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace AppStore.WebApi.Business
{
    public class ProductBusiness
    {
        private AppDbContext _db;
        private IWebHostEnvironment _env;
        private IConfiguration _config;
        private string folder;
        private string uploadsFolder;

        public ProductBusiness(AppDbContext db, IWebHostEnvironment env, IConfiguration config)
        {
            _db = db;
            _env = env;
            _config = config;
            folder = _config["ImageSettings:ProductsFolder"]!;
            uploadsFolder = Path.Combine(_env.WebRootPath, folder);
            Directory.CreateDirectory(uploadsFolder);
        }

        #region Helpers (NUEVO)

        private async Task<string> SaveImageAsync(IFormFile image)
        {
            string fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            string filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await image.CopyToAsync(stream);

            return fileName;
        }

        private void DeleteImage(string? fileName)
        {
            if (string.IsNullOrEmpty(fileName)) return;

            string filePath = Path.Combine(uploadsFolder, fileName);

            if (File.Exists(filePath))
                File.Delete(filePath);
        }

        #endregion

        public async Task<List<GetProductResponse>> GetAll(string serverUrl)
        {
            var products = await _db.Productos
                .AsNoTracking()
                .OrderByDescending(p => p.ProductId)
                .Select(p => new GetProductResponse(
                    p.ProductId,
                    p.Sku,
                    p.Name,
                    p.Stock,
                    p.Price,
                    $"{serverUrl}/{folder}/{p.Image}"
                ))
                .ToListAsync();

            return products;
        }

        public async Task<GetProductResponse?> GetById(int productId, string serverUrl)
        {
            var product = await _db.Productos
                .AsNoTracking()
                .Where(p => p.ProductId == productId)
                .Select(p => new GetProductResponse(
                    p.ProductId,
                    p.Sku,
                    p.Name,
                    p.Stock,
                    p.Price,
                    $"{serverUrl}/{folder}/{p.Image}"
                ))
                .FirstOrDefaultAsync();

            return product;
        }


        public async Task<int> Create(CreateProductRequest request)
        {
            string fileName = await SaveImageAsync(request.Image);

            var product = new Producto
            {
                Sku = request.SKU,
                Name = request.Name,
                Stock = request.Stock,
                Price = request.Price,
                Image = fileName
            };

            try
            {
                await _db.Productos.AddAsync(product);
                await _db.SaveChangesAsync();
            }
            catch
            {
                DeleteImage(fileName);
                throw;
            }

            return product.ProductId;
        }

        public async Task<bool> Update(UpdateProductRequest request)
        {
            var product = await _db.Productos
                .FirstOrDefaultAsync(p => p.ProductId == request.ProductId);

            if (product == null)
                return false;

            product!.Sku = request.SKU;
            product!.Name = request.Name;
            product!.Stock = request.Stock;
            product!.Price = request.Price;

            string? oldImage = null;
            string? newImage = null;

            if (request.Image != null)
            {
                oldImage = product.Image;
                newImage = await SaveImageAsync(request.Image);
                product.Image = newImage;
            }

            try
            {
                await _db.SaveChangesAsync();
            }
            catch
            {
                DeleteImage(newImage); // si falló la BD, se descarta la imagen nueva
                throw;
            }

            DeleteImage(oldImage); // la vieja se borra solo cuando todo salió bien

            return true;
        }

        public async Task<bool> Delete(int productId)
        {
            var product = await _db.Productos
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null)
                return false;

            string? image = product.Image;

            _db.Productos.Remove(product);
            await _db.SaveChangesAsync();

            DeleteImage(image); // el archivo se borra solo si el registro se eliminó

            return true;
        }
    }
}
