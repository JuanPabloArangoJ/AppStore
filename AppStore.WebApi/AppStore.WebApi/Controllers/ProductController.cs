using AppStore.WebApi.Business;
using AppStore.WebApi.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace AppStore.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ProductBusiness _productBusiness;

        public ProductController(ProductBusiness productBusiness)
        {
            _productBusiness = productBusiness;
        }

        private string ServerUrl => $"{Request.Scheme}://{Request.Host}";

        // GET: api/product
        [HttpGet]
        public async Task<ActionResult<List<GetProductResponse>>> GetAll()
        {
            var products = await _productBusiness.GetAll(ServerUrl);
            return Ok(products);
        }

        // GET: api/product/5
        [HttpGet("{productId:int}")]
        public async Task<ActionResult<GetProductResponse>> GetById(int productId)
        {
            var product = await _productBusiness.GetById(productId, ServerUrl);

            if (product == null)
                return NotFound(new { message = $"No se encontró el producto con id {productId}." });

            return Ok(product);
        }

        // POST: api/product
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> Create([FromForm] CreateProductRequest request)
        {
            if (request.Image == null || request.Image.Length == 0)
                return BadRequest(new { message = "La imagen es obligatoria." });

            var productId = await _productBusiness.Create(request);

            return CreatedAtAction(
                nameof(GetById),
                new { productId },
                new { productId });
        }

        // PUT: api/product/5
        [HttpPut("{productId:int}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> Update(int productId, [FromForm] UpdateProductRequest request)
        {
            if (productId != request.ProductId)
                return BadRequest(new { message = "El id de la ruta no coincide con el del cuerpo." });

            var updated = await _productBusiness.Update(request);

            if (!updated)
                return NotFound(new { message = $"No se encontró el producto con id {productId}." });

            return NoContent();
        }

        // DELETE: api/product/5
        [HttpDelete("{productId:int}")]
        public async Task<ActionResult> Delete(int productId)
        {
            var deleted = await _productBusiness.Delete(productId);

            if (!deleted)
                return NotFound(new { message = $"No se encontró el producto con id {productId}." });

            return NoContent();
        }
    }
}