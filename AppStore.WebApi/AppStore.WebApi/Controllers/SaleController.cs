using AppStore.WebApi.Business;
using AppStore.WebApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppStore.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SaleController : ControllerBase
    {
        private readonly SaleBusiness _saleBusiness;

        public SaleController(SaleBusiness saleBusiness)
        {
            _saleBusiness = saleBusiness;
        }

        // GET: api/sale
        [HttpGet]
        public async Task<ActionResult<List<GetSaleResponse>>> GetAll(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            if (startDate.HasValue && endDate.HasValue && startDate.Value.Date > endDate.Value.Date)
                return BadRequest(new { message = "La fecha inicial no puede ser mayor que la fecha final." });

            var sales = await _saleBusiness.GetAll(startDate, endDate);
            return Ok(sales);
        }

        // GET: api/sale/5
        [HttpGet("{saleId:int}")]
        public async Task<ActionResult<GetSaleResponse>> GetById(int saleId)
        {
            var sale = await _saleBusiness.GetById(saleId);

            if (sale == null)
                return NotFound(new { message = $"No se encontró la venta con id {saleId}." });

            return Ok(sale);
        }

        // POST: api/sale
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateSaleRequest request)
        {
            try
            {
                var saleId = await _saleBusiness.Create(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { saleId },
                    new { saleId });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}