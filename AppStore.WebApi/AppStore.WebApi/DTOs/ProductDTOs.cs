namespace AppStore.WebApi.DTOs
{
    #region Request
    public record CreateProductRequest(
            string SKU,
            string Name,
            int Stock,
            decimal Price,
            IFormFile Image
        );

    public record UpdateProductRequest(
            int ProductId,
            string SKU,
            string Name,
            int Stock,
            decimal Price,
            IFormFile? Image
        );
    #endregion

    #region Response
    public record GetProductResponse(
            int ProductId,
            string SKU,
            string Name, 
            int Stock,
            decimal Price,
            string ImageUrl
        );
    #endregion
}
