export interface CreateSaleRequest {
  userId: number;
  totalAmount: number;
  saleDetails: CreateSaleDetailRequest[];
}

export interface CreateSaleDetailRequest {
  productId: number;
  quantity: number;
  subTotal: number;
}

export interface GetSaleResponse {
  saleId: number;
  userName: string;
  totalAmount: number;
  saleDate: string;
  saleDetail: GetSaleDetailResponse[] | null;
}

export interface GetSaleDetailResponse {
  productName: string;
  productPrice: number;
  quantity: number;
  subTotal: number;
}