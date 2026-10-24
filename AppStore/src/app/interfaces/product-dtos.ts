export interface CreateProductRequest {
  sku: string;
  name: string;
  stock: number;
  price: number;
  image: File;
}

export interface UpdateProductRequest {
  productId: number;
  sku: string;
  name: string;
  stock: number;
  price: number;
  image?: File;
}

export interface GetProductResponse {
  productId: number;
  sku: string;
  name: string;
  stock: number;
  price: number;
  imageUrl: string;
}

export interface CreateProductResponse {
  productId: number;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;   // para no permitir más unidades de las que hay
}