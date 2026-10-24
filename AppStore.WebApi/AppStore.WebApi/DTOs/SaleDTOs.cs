namespace AppStore.WebApi.DTOs
{

    #region Requests
    public record CreateSaleRequest(
            int UserId,
            decimal TotalAmount,
            IEnumerable<CreateSaleDetailRequest> SaleDetails
        );

    public record CreateSaleDetailRequest(
            int ProductId,
            int Quantity,
            decimal SubTotal
        );
    #endregion

    #region Responses
    public record GetSaleResponse(
            int SaleId,
            string UserName,
            decimal TotalAmount,
            string SaleDate,
            IEnumerable<GetSaleDetailResponse>? SaleDetail = null 
        );

    public record GetSaleDetailResponse(
            string ProductName,
            decimal ProductPrice,
            int Quantity,
            decimal SubTotal
        );
    #endregion

}
